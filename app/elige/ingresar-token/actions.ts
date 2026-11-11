'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/components/asientos/types'
import { CONGRESO_IGE_EVENT_ID } from '@/config/auditorioConfig'
import { resolveUnidadAcademicaId } from '@/lib/tickets/resolveUnidadAcademica'

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
  const parsed = TokenSchema.safeParse(tokenCode)
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? 'Token inválido.' }
  }
  return canjearTokenPorCodigo(parsed.data.toUpperCase())
}

export async function canjearTokenPorCodigo(tokenCode: string): Promise<ActionResult & { ticket?: DatosTicketCanjeado }> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, message: 'Debes iniciar sesión para canjear un token.' }
  }

  let unidadAcademicaId: number | null
  try {
    unidadAcademicaId = await resolveUnidadAcademicaId(supabase, user.id, user.email ?? null)
  } catch (error) {
    console.error('[canjearTokenPorCodigo] Error al consultar Unidad Académica:', error)
    return { success: false, message: 'No se pudo validar tu Unidad Académica. Intenta de nuevo.' }
  }

  if (unidadAcademicaId == null) {
    return { success: false, message: 'Selecciona una Unidad Académica antes de canjear el token.' }
  }

  const { data, error } = await supabase.rpc('canjear_token_y_ticket', {
    p_token_code: tokenCode.toUpperCase(),
    p_buyer_id: user.id,
    p_event_id: CONGRESO_IGE_EVENT_ID,
    p_unidad_academica_id: unidadAcademicaId,
  })

  if (error) {
    console.error('[canjearTokenPorCodigo] Error en la transacción de canje:', error.message)
    return { success: false, message: error.message || 'No se pudo canjear el token.' }
  }

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    console.error('[canjearTokenPorCodigo] La rutina de canje devolvió una respuesta inválida.')
    return { success: false, message: 'No se pudo confirmar el boleto canjeado.' }
  }

  const ticketData = data as {
    ticket_id: string
    nombre: string | null
    email: string
    matricula: string | null
    carrera: string | null
    semestre: string | null
    telefono: string | null
    unidad_academica_id: number | null
    asiento_zona: string | null
    asiento_bloque: string | null
    asiento_fila: string | null
    asiento_numero: number | null
    departamento: string | null
    type: string
  }

  const { data: unidad, error: unidadError } = ticketData.unidad_academica_id
    ? await supabase
        .from('unidades_academicas')
        .select('nombre')
        .eq('id', ticketData.unidad_academica_id)
        .maybeSingle()
    : { data: null, error: null }

  if (unidadError) {
    console.error('[canjearTokenPorCodigo] Error al consultar nombre de Unidad Académica:', unidadError.message)
  }

  revalidatePath('/elige/ingresar-token')
  revalidatePath('/elige/mis-asientos')

  return {
    success: true,
    message: '¡Token canjeado exitosamente! Tu pase está activo.',
    ticket: {
      ticketId: ticketData.ticket_id,
      nombre: ticketData.nombre,
      email: ticketData.email,
      matricula: ticketData.matricula,
      carrera: ticketData.carrera,
      semestre: ticketData.semestre,
      telefono: ticketData.telefono,
      unidadAcademica: unidad?.nombre ?? null,
      asientoZona: ticketData.asiento_zona,
      asientoBloque: ticketData.asiento_bloque,
      asientoFila: ticketData.asiento_fila,
      asientoNumero: ticketData.asiento_numero,
      departamento: ticketData.departamento,
      tipo: ticketData.type,
    },
  }
}