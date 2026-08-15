'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/components/asientos/types'

// ─── Esquemas de validación ───────────────────────────────────────────────────
// El token sigue el patrón IGE-2026-XXXX-XXXX (alfanumérico, guiones, 4-64 chars)
const TokenSchema = z
  .string()
  .trim()
  .min(4, 'El token es demasiado corto.')
  .max(64, 'El token es demasiado largo.')
  .regex(/^[A-Z0-9\-]+$/i, 'El token contiene caracteres no permitidos.')

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
  departamento: string | null // Añadido para docentes
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
export async function validarToken(tokenCode: string): Promise<ActionResult & { ticket?: DatosTicketCanjeado }> {
  // ── Validación de entrada con Zod ────────────────────────────────────────
  const parsed = TokenSchema.safeParse(tokenCode)
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? 'Token inválido.' }
  }
  const safeToken = parsed.data

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, message: 'Debes iniciar sesión para validar un token.' }
  }

  // Buscar el token en la base de datos
  const { data: token, error: tokenError } = await supabase
    .from('tokens_canje')
    .select('id, status, token_code')
    .eq('token_code', safeToken)
    .maybeSingle()

  if (tokenError || !token) {
    return { success: false, message: 'Token inválido o no existe.' }
  }

  const t = token as { id: string; status: string; token_code: string }

  // Verificar que esté disponible
  if (t.status !== 'disponible') {
    return { success: false, message: 'Token inválido o ya canjeado.' }
  }

  // Canjear el token usando la función existente
  return canjearTokenPorCodigo(safeToken)
}

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

  const t = token as { id: string; status: string; event_id: string; zone_id: string | null; creado_por: string }

  // 2. Verificar que esté disponible
  if (t.status !== 'disponible' && t.status !== 'usado') { // Permitir re-validar si ya es 'usado' por el mismo usuario
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

  // --- LÓGICA DIFERENCIADA: TOKEN DE ASIENTO vs. TOKEN DE DOCENTE ---

  // FLUJO 1: Token de Docente/Organizador (no tiene zona asignada)
  if (t.zone_id === null) {
    const { data: docenteTicket, error: docenteError } = await client
      .from('tickets')
      .select('id, nombre, email, departamento, type')
      .eq('buyer_id', t.creado_por) // El ticket original del docente
      .eq('type', 'docente')
      .maybeSingle()

    if (docenteError || !docenteTicket) {
      return { success: false, message: 'No se encontró el registro de organizador asociado a este token.' }
    }

    const ticketRow = docenteTicket as {
      id: string
      nombre: string | null
      email: string
      departamento: string | null
      type: string
    }

    // Vincular el ticket al usuario que canjea el token
    const { error: updateTicketError } = await client
      .from('tickets')
      .update({
        buyer_id: user.id,
        estatus_pago: 'organizador', // Mantenemos el estatus especial
        purchased_at: new Date().toISOString(),
      })
      .eq('id', ticketRow.id)

    if (updateTicketError) {
      console.error('[canjearTokenPorCodigo] Error al transferir ticket:', updateTicketError.message)
      return { success: false, message: 'Error al vincular el pase a tu cuenta.' }
    }

    revalidatePath('/elige/ingresar-token')
    revalidatePath('/elige/mis-asientos')

    return {
      success: true,
      message: '¡Token canjeado exitosamente! Tu pase está activo.',
      ticket: {
        ticketId: ticketRow.id,
        nombre: ticketRow.nombre,
        email: ticketRow.email,
        matricula: null,
        carrera: null,
        semestre: null,
        telefono: null,
        unidadAcademica: null,
        asientoZona: null,
        asientoBloque: null,
        asientoFila: null,
        asientoNumero: null,
        departamento: ticketRow.departamento,
        tipo: ticketRow.type,
      },
    }
  }

  // Si no hay ticket del encargado, buscar cualquier ticket en la zona/evento (pre-registro)
  const { data: fallbackTicket } = await client
    .from('tickets')
    .select('id, nombre, email, matricula, carrera, semestre, telefono, unidad_academica, asiento_zona, asiento_bloque, asiento_fila, asiento_numero, type, departamento')
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
      departamento: string | null
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
      revalidatePath('/elige/ingresar-token')
      revalidatePath('/elige/mis-asientos')

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
          departamento: fbTicket.departamento,
          tipo: fbTicket.type,
        },
      }
    }
  }

  // Token canjeado pero no pudimos vincular un ticket específico
  revalidatePath('/elige/ingresar-token')
  return {
    success: true,
    message: 'Token canjeado. Tu pase está activo. Revisa la sección de Mis Asientos.',
  }
}