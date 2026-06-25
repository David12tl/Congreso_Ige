'use server'

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

// Los tipos no se ven afectados por las restricciones de 'use server'
export type { ApartadoInfoLocal } from './tokenActions'
export type { OccupiedSeat, AssignmentContext, ManualTicketInput, ActionResult } from '@/components/asientos/types'
