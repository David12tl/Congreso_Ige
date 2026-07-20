'use server'

import { createClient } from '@/lib/supabase/server'
import { CONGRESO_IGE_EVENT_ID } from '@/config/auditorioConfig'
import * as tokenActions from './tokenActions'

// Re-exportamos explícitamente las funciones asíncronas para cumplir las reglas estricta de Next.js.
// Usamos Parameters<typeof ...> y ReturnType<typeof ...> para heredar el tipado exacto automáticamente.

export async function getOccupiedSeats(...args: Parameters<typeof tokenActions.getOccupiedSeats>): Promise<ReturnType<typeof tokenActions.getOccupiedSeats>> {
  return tokenActions.getOccupiedSeats(...args)
}

export async function getOccupiedSeatKeys(...args: Parameters<typeof tokenActions.getOccupiedSeatKeys>): Promise<ReturnType<typeof tokenActions.getOccupiedSeatKeys>> {
  return tokenActions.getOccupiedSeatKeys(...args)
}

export async function getSeatStatusMap(...args: Parameters<typeof tokenActions.getSeatStatusMap>): Promise<ReturnType<typeof tokenActions.getSeatStatusMap>> {
  return tokenActions.getSeatStatusMap(...args)
}

export async function getAssignmentContext(...args: Parameters<typeof tokenActions.getAssignmentContext>): Promise<ReturnType<typeof tokenActions.getAssignmentContext>> {
  return tokenActions.getAssignmentContext(...args)
}

// Corregido: Se eliminó el espacio y el texto 'get ' erróneo dentro de Parameters<...>
export async function requireAssignmentContext(...args: Parameters<typeof tokenActions.requireAssignmentContext>): Promise<ReturnType<typeof tokenActions.requireAssignmentContext>> {
  return tokenActions.requireAssignmentContext(...args)
}

export async function createManualSeatTicket(...args: Parameters<typeof tokenActions.createManualSeatTicket>): Promise<ReturnType<typeof tokenActions.createManualSeatTicket>> {
  return tokenActions.createManualSeatTicket(...args)
}

export async function confirmarPagoTicket(...args: Parameters<typeof tokenActions.confirmarPagoTicket>): Promise<ReturnType<typeof tokenActions.confirmarPagoTicket>> {
  return tokenActions.confirmarPagoTicket(...args)
}

export async function generarTokensMultiples(...args: Parameters<typeof tokenActions.generarTokensMultiples>): Promise<ReturnType<typeof tokenActions.generarTokensMultiples>> {
  return tokenActions.generarTokensMultiples(...args)
}

export async function cobrarAsientoYGenerarToken(...args: Parameters<typeof tokenActions.cobrarAsientoYGenerarToken>): Promise<ReturnType<typeof tokenActions.cobrarAsientoYGenerarToken>> {
  return tokenActions.cobrarAsientoYGenerarToken(...args)
}

export async function liquidarRestoAsiento(...args: Parameters<typeof tokenActions.liquidarRestoAsiento>): Promise<ReturnType<typeof tokenActions.liquidarRestoAsiento>> {
  return tokenActions.liquidarRestoAsiento(...args)
}

export async function getApartadoInfo(...args: Parameters<typeof tokenActions.getApartadoInfo>): Promise<ReturnType<typeof tokenActions.getApartadoInfo>> {
  return tokenActions.getApartadoInfo(...args)
}

// Tipos para generar-tokens
export interface GenerarTokenResult {
  success: boolean
  token?: string
  message: string
}

export interface TaquillaTokensView {
  id: string
  token_code: string
  zone_id: string
  status: string
  created_at: string
}

// Función para generar un token individual
export async function generarToken(): Promise<GenerarTokenResult> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, message: 'Debes iniciar sesión para generar tokens.' }
  }

  // Verificar permisos de admin/encargado
  const { data: perfil } = await supabase
    .from('profiles')
    .select('id_rol')
    .eq('id', user.id)
    .maybeSingle()

  if (!perfil || (perfil as { id_rol: number }).id_rol !== 1) {
    return { success: false, message: 'No tienes permisos para generar tokens.' }
  }

  // Generar código de token usando UUID
  const { v4: uuidv4 } = await import('uuid')
  const tokenCode = `IGE-2026-${uuidv4().split('-')[0].toUpperCase()}-${uuidv4().split('-')[1].toUpperCase()}`

  // Insertar el token en la base de datos
  const { data: token, error } = await supabase
    .from('tokens_canje')
    .insert({
      token_code: tokenCode,
      event_id: CONGRESO_IGE_EVENT_ID,
      zone_id: null,
      creado_por: user.id,
      status: 'disponible',
      total_abonado: 0,
      estado_pago: 'sin_pago'
    } as never)
    .select()
    .maybeSingle()

  if (error) {
    console.error('[generarToken] Error:', error.message)
    return { success: false, message: `Error al generar token: ${error.message}` }
  }

  return {
    success: true,
    token: (token as { token_code: string }).token_code,
    message: 'Token generado exitosamente.'
  }
}

// Los tipos no se ven afectados por las restricciones de 'use server'
export type { ApartadoInfoLocal } from './tokenActions'
export type { OccupiedSeat, AssignmentContext, ManualTicketInput, ActionResult } from '@/components/asientos/types'
