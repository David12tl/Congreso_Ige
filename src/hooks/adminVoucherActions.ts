'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface ComprobanteItem {
  id: string
  matricula: string
  file_url: string
  file_path: string
  ruta_archivo: string
  signedUrl: string | null
  estado: string
  created_at: string | null
  profile_id: string
}

/**
 * Normaliza y limpia una ruta de archivo dentro del bucket privado 'vouchers'.
 * Remueve prefijos de bucket ('vouchers/'), slashes iniciales, URLs completas de Supabase y query tokens.
 */
export function normalizarRutaStorage(raw: string | null | undefined): string {
  if (!raw || typeof raw !== 'string') return ''
  let ruta = raw.trim()

  // Remover query params si los tiene (?token=...)
  ruta = ruta.split('?')[0]

  // Extraer la ruta relativa si viene como URL completa de Supabase Storage
  if (ruta.includes('/storage/v1/object/public/vouchers/')) {
    ruta = ruta.split('/storage/v1/object/public/vouchers/').pop() || ruta
  } else if (ruta.includes('/storage/v1/object/sign/vouchers/')) {
    ruta = ruta.split('/storage/v1/object/sign/vouchers/').pop() || ruta
  } else if (ruta.includes('/storage/v1/object/vouchers/')) {
    ruta = ruta.split('/storage/v1/object/vouchers/').pop() || ruta
  } else if (ruta.includes('/vouchers/')) {
    ruta = ruta.split('/vouchers/').pop() || ruta
  }

  // Quitar prefijo 'vouchers/' si estuviera presente
  if (ruta.startsWith('vouchers/')) {
    ruta = ruta.slice('vouchers/'.length)
  }

  // Quitar slashes al inicio
  ruta = ruta.replace(/^\/+/, '')

  // Decodificar posibles caracteres codificados (%20, etc.)
  try {
    ruta = decodeURIComponent(ruta)
  } catch {
    // Si falla, usar tal como está
  }

  return ruta
}

export async function obtenerComprobantesPorUsuario(userId: string): Promise<ComprobanteItem[]> {
  const supabase = await createClient()

  console.log('[obtenerComprobantesPorUsuario] Buscando comprobantes para identificador:', userId)

  // 1. Búsqueda principal por profile_id
  let { data, error } = await supabase
    .from('comprobantes_pago')
    .select(`
      id,
      matricula,
      file_url,
      file_path,
      estado,
      created_at,
      profile_id
    `)
    .eq('profile_id', userId)
    .order('created_at', { ascending: false })

  // 2. Si no encontró resultados, buscar por matricula
  if (!data || data.length === 0) {
    const { data: dataPorMatricula } = await supabase
      .from('comprobantes_pago')
      .select(`
        id,
        matricula,
        file_url,
        file_path,
        estado,
        created_at,
        profile_id
      `)
      .eq('matricula', userId)
      .order('created_at', { ascending: false })

    if (dataPorMatricula && dataPorMatricula.length > 0) {
      data = dataPorMatricula
    }
  }

  // 3. Si aún no encontró resultados, verificar si 'userId' corresponde a un id de ticket
  if (!data || data.length === 0) {
    const { data: ticket } = await supabase
      .from('tickets')
      .select('buyer_id, matricula')
      .eq('id', userId)
      .maybeSingle()

    if (ticket) {
      if (ticket.buyer_id) {
        const { data: dataBuyer } = await supabase
          .from('comprobantes_pago')
          .select(`
            id,
            matricula,
            file_url,
            file_path,
            estado,
            created_at,
            profile_id
          `)
          .eq('profile_id', ticket.buyer_id)
          .order('created_at', { ascending: false })

        if (dataBuyer && dataBuyer.length > 0) {
          data = dataBuyer
        }
      }

      if ((!data || data.length === 0) && ticket.matricula) {
        const { data: dataTicketMatricula } = await supabase
          .from('comprobantes_pago')
          .select(`
            id,
            matricula,
            file_url,
            file_path,
            estado,
            created_at,
            profile_id
          `)
          .eq('matricula', ticket.matricula)
          .order('created_at', { ascending: false })

        if (dataTicketMatricula && dataTicketMatricula.length > 0) {
          data = dataTicketMatricula
        }
      }
    }
  }

  if (error && (!data || data.length === 0)) {
    console.error('[obtenerComprobantesPorUsuario] Error al obtener comprobantes:', error)
    return []
  }

  const items: ComprobanteItem[] = await Promise.all(
    (data || []).map(async (row) => {
      // Normalizar la ruta del archivo dentro del bucket privado 'vouchers'
      const rawPath = row.file_path || (row as unknown as Record<string, unknown>).ruta_archivo as string || row.file_url || ''
      const cleanPath = normalizarRutaStorage(rawPath)

      let signedUrl: string | null = null
      if (cleanPath) {
        const { data: signData, error: signError } = await supabase.storage
          .from('vouchers')
          .createSignedUrl(cleanPath, 3600)

        if (signError) {
          console.error(`[Server Admin] Error en createSignedUrl para ruta_archivo "${cleanPath}":`, signError.message)
        } else {
          signedUrl = signData?.signedUrl ?? null
        }
      }

      console.log(`[Server Admin Voucher] ruta_archivo: "${cleanPath}", signedUrl: "${signedUrl ?? 'NO_URL'}"`)

      return {
        id: row.id,
        matricula: row.matricula,
        file_url: row.file_url,
        file_path: cleanPath,
        ruta_archivo: cleanPath,
        signedUrl: signedUrl,
        estado: row.estado,
        created_at: row.created_at,
        profile_id: row.profile_id
      }
    })
  )

  return items
}

export async function cambiarEstadoComprobante(
  comprobanteId: string, 
  nuevoEstado: 'aprobado' | 'rechazado',
  userId: string
) {
  const supabase = await createClient()

  // 1. Actualizar el estado del comprobante
  const { error } = await supabase
    .from('comprobantes_pago')
    .update({ estado: nuevoEstado })
    .eq('id', comprobanteId)

  if (error) {
    return { success: false, message: 'No se pudo actualizar el estado.' }
  }

  // 2. Si es aprobado, marcar su token_canje como completado
  if (nuevoEstado === 'aprobado') {
    await supabase
      .from('tokens_canje')
      .update({ estado_pago: 'completado' })
      .eq('utilizado_por', userId)
  }

  revalidatePath(`/elige/usuarios-ua/${userId}`)
  revalidatePath(`/admin/usuarios_ua/${userId}`)
  return { success: true }
}
