'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/src/lib/supabase/server'
import type { ActionResult } from '@/src/components/asientos/types'

export interface DatosTicketParaQR {
  ticketId: string
  qrData: string
  nombre: string
  email: string
  matricula: string | null
  carrera: string | null
  semestre: string | null
  telefono: string | null
  asientoZona: string | null
  asientoBloque: string | null
  asientoFila: string | null
  asientoNumero: number | null
  tipo: string
  unidadAcademica: string | null
}

/**
 * Verifica si el usuario tiene un token canjeado (status='usado', utilizado_por=user.id).
 * Si el ticket no existe en public.tickets, lo crea y genera el qr_data.
 * Maneja errores de constraints (asiento duplicado, buyer_id único).
 */
export async function obtenerQRData(): Promise<ActionResult & { ticket?: DatosTicketParaQR }> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, message: 'Debes iniciar sesión para acceder a esta sección.' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any

  // ─── 1. Verificar si el usuario tiene un token canjeado ───────────────
  const { data: tokenUsado, error: tokenError } = await client
    .from('tokens_canje')
    .select('id, event_id, zone_id, status')
    .eq('utilizado_por', user.id)
    .eq('status', 'usado')
    .maybeSingle()

  if (tokenError) {
    console.error('[obtenerQRData] Error al buscar token:', tokenError.message)
    return { success: false, message: 'Error de conexión. Intenta de nuevo.' }
  }

  if (!tokenUsado) {
    return {
      success: false,
      message: '⚠️ Aún no has activado tu pase. Por favor, ingresa primero el token de 8 dígitos que te proporcionó tu encargado en la sección /dashboard/ingresar-token.',
      ticket: undefined,
    }
  }

  const t = tokenUsado as { id: string; event_id: string; zone_id: string; status: string }

  // ─── 2. Buscar ticket existente del usuario ───────────────────────────
  let ticketExistente: Record<string, unknown> | null = null
  let ticketId: string
  let qrData: string

  // Primero buscar un ticket que ya tenga buyer_id = user.id
  const { data: existingTicket } = await client
    .from('tickets')
    .select('id, nombre, email, matricula, carrera, semestre, telefono, asiento_zona, asiento_bloque, asiento_fila, asiento_numero, type, unidad_academica, qr_data')
    .eq('buyer_id', user.id)
    .eq('event_id', t.event_id)
    .maybeSingle()

  if (existingTicket) {
    ticketExistente = existingTicket as Record<string, unknown>
    ticketId = ticketExistente.id as string

    // Si ya tiene qr_data, lo reusamos; si no, lo generamos
    if (ticketExistente.qr_data) {
      qrData = ticketExistente.qr_data as string
    } else {
      // Generar qr_data y actualizar el registro
      const matricula = (ticketExistente.matricula as string) || 'SIN_MATRICULA'
      const asientoZona = (ticketExistente.asiento_zona as string) || 'SIN_ZONA'
      const asientoBloque = (ticketExistente.asiento_bloque as string) || 'SIN_BLOQUE'
      const asientoFila = (ticketExistente.asiento_fila as string) || 'SIN_FILA'
      const asientoNumero = (ticketExistente.asiento_numero as number) ?? 0

      qrData = `CONGRESO2026|${ticketId}|${matricula}|${asientoZona}-${asientoBloque}-${asientoFila}-${asientoNumero}`

      const { error: updateQrError } = await client
        .from('tickets')
        .update({ qr_data: qrData })
        .eq('id', ticketId)

      if (updateQrError) {
        console.error('[obtenerQRData] Error al actualizar qr_data:', updateQrError.message)
      }
    }
  } else {
    // ─── 3. No existe ticket para este buyer_id → crear uno nuevo ──────

    // Obtener perfil del usuario para los datos de identidad
    const { data: perfil } = await client
      .from('profiles')
      .select('email, nombre, telefono, matricula, carrera, semestre, unidad_academica_id')
      .eq('id', user.id)
      .single()

    const profile = perfil as Record<string, unknown> | null

    const email = (profile?.email as string) || user.email || ''
    const nombre = (profile?.nombre as string) || ''
    const matricula = (profile?.matricula as string) || null
    const carrera = (profile?.carrera as string) || null
    const semestre = (profile?.semestre as string) || null
    const telefono = (profile?.telefono as string) || null
    const unidadAcademicaId = (profile?.unidad_academica_id as number) ?? null

    // Determinar tipo
    const tipo = matricula ? 'alumno' : 'empresa'

    // Obtener nombre de la unidad académica
    let unidadAcademicaNombre: string | null = null
    if (unidadAcademicaId) {
      const { data: ua } = await client
        .from('unidades_academicas')
        .select('nombre')
        .eq('id', unidadAcademicaId)
        .single()

      if (ua) {
        unidadAcademicaNombre = (ua as Record<string, unknown>).nombre as string
      }
    }

    // Valores por defecto para asiento (se asignarán después si es necesario)
    const asientoZona = 'PREFERENTE'
    const asientoBloque = 'GENERAL'
    const asientoFila = 'A'
    const asientoNumero = 1

    // Construir el objeto del nuevo ticket
    const nuevoTicket: Record<string, unknown> = {
      buyer_id: user.id,
      event_id: t.event_id,
      zone_id: t.zone_id,
      type: tipo,
      nombre,
      email,
      matricula,
      carrera,
      semestre,
      telefono,
      unidad_academica_id: unidadAcademicaId,
      unidad_academica: unidadAcademicaNombre ?? 'No especificada',
      asiento_zona: asientoZona,
      asiento_bloque: asientoBloque,
      asiento_fila: asientoFila,
      asiento_numero: asientoNumero,
      estatus_pago: 'pagado',
      purchased_at: new Date().toISOString(),
    }

    const { data: insertData, error: insertError } = await client
      .from('tickets')
      .insert(nuevoTicket)
      .select('id')
      .single()

    if (insertError) {
      console.error('[obtenerQRData] Error al insertar ticket:', insertError.message)

      // Manejo de errores de constraints
      const msg = (insertError.message || '').toLowerCase()
      if (insertError.code === '23505' || msg.includes('unq_asitorio_orizaba_asiento_unico')) {
        return {
          success: false,
          message: 'Este asiento ya ha sido reservado, por favor contacta a tu encargado.',
        }
      }
      if (msg.includes('tickets_buyer_id_key') || msg.includes('tickets_buyer_id_unique')) {
        return {
          success: false,
          message: 'Ya tienes un boleto registrado. Si crees que es un error, contacta a tu encargado.',
        }
      }

      return { success: false, message: `Error al generar tu pase: ${insertError.message}` }
    }

    ticketId = (insertData as { id: string }).id

    // Generar qr_data
    qrData = `CONGRESO2026|${ticketId}|${matricula || 'SIN_MATRICULA'}|${asientoZona}-${asientoBloque}-${asientoFila}-${asientoNumero}`

    const { error: updateQrError } = await client
      .from('tickets')
      .update({ qr_data: qrData })
      .eq('id', ticketId)

    if (updateQrError) {
      console.error('[obtenerQRData] Error al guardar qr_data:', updateQrError.message)
    }

    // Actualizar referencia del ticket en el objeto para el return
    ticketExistente = {
      id: ticketId,
      nombre,
      email,
      matricula,
      carrera,
      semestre,
      telefono,
      asiento_zona: asientoZona,
      asiento_bloque: asientoBloque,
      asiento_fila: asientoFila,
      asiento_numero: asientoNumero,
      type: tipo,
      unidad_academica: unidadAcademicaNombre,
    }
  }

  revalidatePath('/dashboard/generar-qr')

  const ticketData = ticketExistente as Record<string, unknown>

  return {
    success: true,
    message: 'Tu pase está listo.',
    ticket: {
      ticketId: ticketId!,
      qrData: qrData!,
      nombre: (ticketData.nombre as string) || '',
      email: (ticketData.email as string) || '',
      matricula: (ticketData.matricula as string) || null,
      carrera: (ticketData.carrera as string) || null,
      semestre: (ticketData.semestre as string) || null,
      telefono: (ticketData.telefono as string) || null,
      asientoZona: (ticketData.asiento_zona as string) || null,
      asientoBloque: (ticketData.asiento_bloque as string) || null,
      asientoFila: (ticketData.asiento_fila as string) || null,
      asientoNumero: (ticketData.asiento_numero as number) ?? null,
      tipo: (ticketData.type as string) || 'alumno',
      unidadAcademica: (ticketData.unidad_academica as string) || null,
    },
  }
}