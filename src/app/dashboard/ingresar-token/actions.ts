'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/components/asientos/types'

export interface DatosTicketCanjeado {
  ticketId: string
  nombre: string | null
  email: string
  matricula: string | null
  carrera: string | null
  semestre: string | null
  telefono: string | null
  unidadAcademica: string | null
  asientoZona: string | null
  asientoBloque: string | null
  asientoFila: string | null
  asientoNumero: number | null
  tipo: string
}

/**
 * Canjea un token de 8 dígitos:
 * 1. Busca el token en tokens_canje por token_code
 * 2. Verifica que esté 'disponible'
 * 3. Cambia status a 'usado', guarda el UUID del alumno y la fecha
 * 4. Asocia el ticket del asiento al buyer_id del alumno
 * 5. Retorna los datos del ticket para generar QR y PDF
 */
export async function canjearTokenPorCodigo(tokenCode: string): Promise<ActionResult & { ticket?: DatosTicketCanjeado }> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, message: 'Debes iniciar sesión para canjear un token.' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any

  // 1. Buscar el token en tokens_canje
  const { data: token, error: tokenError } = await client
    .from('tokens_canje')
    .select('id, status, event_id, zone_id, creado_por')
    .eq('token_code', tokenCode)
    .maybeSingle()

  if (tokenError || !token) {
    return { success: false, message: 'Token inválido o no existe.' }
  }

  const t = token as { id: string; status: string; event_id: string; zone_id: string; creado_por: string }

  // 2. Verificar que esté disponible
  if (t.status !== 'disponible') {
    return { success: false, message: 'Token inválido o ya canjeado.' }
  }

  // 3. Actualizar el token a 'usado'
  const { error: updateTokenError } = await client
    .from('tokens_canje')
    .update({
      status: 'usado',
      utilizado_por: user.id,
      utilizado_el: new Date().toISOString(),
    })
    .eq('id', t.id)

  if (updateTokenError) {
    console.error('[canjearTokenPorCodigo] Error al actualizar token:', updateTokenError.message)
    return { success: false, message: 'Error al canjear el token. Intenta de nuevo.' }
  }

  // 4. Buscar el ticket asociado a este token (por event_id y zone_id)
  // Primero intentamos buscar un ticket del usuario creador (el encargado)
  const { data: ticketData, error: ticketError } = await client
    .from('tickets')
    .select('id, nombre, email, matricula, carrera, semestre, telefono, unidad_academica, asiento_zona, asiento_bloque, asiento_fila, asiento_numero, type')
    .eq('event_id', t.event_id)
    .eq('zone_id', t.zone_id)
    .eq('buyer_id', t.creado_por)
    .maybeSingle()

  // Si encontramos un ticket del encargado, lo transferimos al alumno
  if (!ticketError && ticketData) {
    const ticketRow = ticketData as {
      id: string
      nombre: string | null
      email: string
      matricula: string | null
      carrera: string | null
      semestre: string | null
      telefono: string | null
      unidad_academica: string | null
      asiento_zona: string | null
      asiento_bloque: string | null
      asiento_fila: string | null
      asiento_numero: number | null
      type: string
    }

    // Actualizar el buyer_id al usuario actual
    const { error: updateTicketError } = await client
      .from('tickets')
      .update({
        buyer_id: user.id,
        estatus_pago: 'pagado',
        purchased_at: new Date().toISOString(),
      })
      .eq('id', ticketRow.id)

    if (updateTicketError) {
      console.error('[canjearTokenPorCodigo] Error al transferir ticket:', updateTicketError.message)
      return { success: false, message: 'Error al vincular el pase a tu cuenta.' }
    }

    revalidatePath('/dashboard/ingresar-token')
    revalidatePath('/dashboard/mis-asientos')

    return {
      success: true,
      message: '¡Token canjeado exitosamente! Tu pase está activo.',
      ticket: {
        ticketId: ticketRow.id,
        nombre: ticketRow.nombre,
        email: ticketRow.email,
        matricula: ticketRow.matricula,
        carrera: ticketRow.carrera,
        semestre: ticketRow.semestre,
        telefono: ticketRow.telefono,
        unidadAcademica: ticketRow.unidad_academica,
        asientoZona: ticketRow.asiento_zona,
        asientoBloque: ticketRow.asiento_bloque,
        asientoFila: ticketRow.asiento_fila,
        asientoNumero: ticketRow.asiento_numero,
        tipo: ticketRow.type,
      },
    }
  }

  // Si no hay ticket del encargado, buscar cualquier ticket en la zona/evento (pre-registro)
  const { data: fallbackTicket } = await client
    .from('tickets')
    .select('id, nombre, email, matricula, carrera, semestre, telefono, unidad_academica, asiento_zona, asiento_bloque, asiento_fila, asiento_numero, type')
    .eq('event_id', t.event_id)
    .eq('zone_id', t.zone_id)
    .eq('estatus_pago', 'pre-registro')
    .maybeSingle()

  if (fallbackTicket) {
    const fbTicket = fallbackTicket as {
      id: string
      nombre: string | null
      email: string
      matricula: string | null
      carrera: string | null
      semestre: string | null
      telefono: string | null
      unidad_academica: string | null
      asiento_zona: string | null
      asiento_bloque: string | null
      asiento_fila: string | null
      asiento_numero: number | null
      type: string
    }

    const { error: updateFbError } = await client
      .from('tickets')
      .update({
        buyer_id: user.id,
        estatus_pago: 'pagado',
        purchased_at: new Date().toISOString(),
      })
      .eq('id', fbTicket.id)

    if (!updateFbError) {
      revalidatePath('/dashboard/ingresar-token')
      revalidatePath('/dashboard/mis-asientos')

      return {
        success: true,
        message: '¡Token canjeado exitosamente! Tu pase está activo.',
        ticket: {
          ticketId: fbTicket.id,
          nombre: fbTicket.nombre,
          email: fbTicket.email,
          matricula: fbTicket.matricula,
          carrera: fbTicket.carrera,
          semestre: fbTicket.semestre,
          telefono: fbTicket.telefono,
          unidadAcademica: fbTicket.unidad_academica,
          asientoZona: fbTicket.asiento_zona,
          asientoBloque: fbTicket.asiento_bloque,
          asientoFila: fbTicket.asiento_fila,
          asientoNumero: fbTicket.asiento_numero,
          tipo: fbTicket.type,
        },
      }
    }
  }

  // Token canjeado pero no pudimos vincular un ticket específico
  revalidatePath('/dashboard/ingresar-token')
  return {
    success: true,
    message: 'Token canjeado. Tu pase está activo. Revisa la sección de Mis Asientos.',
  }
}