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

export async function obtenerComprobantesPorUsuario(userId: string): Promise<ComprobanteItem[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
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

  if (error) {
    console.error('[obtenerComprobantesPorUsuario] Error al obtener comprobantes:', error)
    return []
  }

  const items: ComprobanteItem[] = await Promise.all(
    (data || []).map(async (row) => {
      // Normalizar la ruta dentro del bucket 'vouchers'
      const rawPath = row.file_path || (row as unknown as Record<string, unknown>).ruta_archivo as string || row.file_url || ''
      let cleanPath = rawPath.trim()
      if (cleanPath.includes('/vouchers/')) {
        cleanPath = cleanPath.split('/vouchers/').pop() || cleanPath
      } else if (cleanPath.startsWith('vouchers/')) {
        cleanPath = cleanPath.replace(/^vouchers\//, '')
      }
      cleanPath = cleanPath.split('?')[0]

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
