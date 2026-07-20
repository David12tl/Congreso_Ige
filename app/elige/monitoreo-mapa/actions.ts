'use server'

import { CONGRESO_IGE_EVENT_ID, getSeatKey, type ZoneCode } from '@/config/auditorioConfig'
import { createClient } from '@/lib/supabase/server'
import type { OccupiedSeat } from '@/components/asientos/types'

interface TicketSeatRow {
  id: string
  zone_id: string | null
  asiento_zona: string | null
  asiento_bloque: string | null
  asiento_fila: string | null
  asiento_numero: number | null
  purchase_id: string | null
  buyer_id: string | null
}

interface TicketsSeatClient {
  from: (table: 'tickets') => {
    select: (columns: string) => {
      eq: (column: string, value: string) => Promise<{
        data: TicketSeatRow[] | null
        error: { message: string } | null
      }>
    }
  }
}

export async function getOccupiedSeats(): Promise<OccupiedSeat[]> {
  const supabase = await createClient()
  const client = supabase as unknown as TicketsSeatClient

  const { data, error } = await client
    .from('tickets')
    .select('id, zone_id, asiento_zona, asiento_bloque, asiento_fila, asiento_numero, purchase_id, buyer_id')
    .eq('event_id', CONGRESO_IGE_EVENT_ID)

  if (error) {
    console.error('[getOccupiedSeats] Error al consultar tickets:', error.message)
    return []
  }

  return (data ?? [])
    .filter((ticket): ticket is TicketSeatRow & {
      asiento_zona: ZoneCode
      zone_id: string
      asiento_bloque: string
      asiento_fila: string
      asiento_numero: number
    } => Boolean(
      ticket.zone_id &&
      ticket.asiento_zona &&
      ticket.asiento_bloque &&
      ticket.asiento_fila &&
      ticket.asiento_numero,
    ))
    .map((ticket) => {
      // Derive payment status from purchase_id: if it has one, treat as 'pagado'
      // Otherwise, since it has a buyer (exists in DB), treat as 'pre-registro'
      const estatusPago: OccupiedSeat['estatusPago'] = ticket.purchase_id ? 'pagado' : 'pre-registro'
      return {
        ticketId: ticket.id,
        zoneCode: ticket.asiento_zona,
        zoneId: ticket.zone_id,
        bloque: ticket.asiento_bloque,
        fila: ticket.asiento_fila,
        numero: ticket.asiento_numero,
        estatusPago,
        buyerId: ticket.buyer_id ?? undefined,
      }
    })
}

export async function getOccupiedSeatKeys(): Promise<string[]> {
  return (await getOccupiedSeats()).map(getSeatKey)
}

export async function getSeatStatusMap(): Promise<Record<string, string>> {
  const seats = await getOccupiedSeats()
  const map: Record<string, string> = {}
  for (const seat of seats) {
    if (seat.estatusPago) {
      map[getSeatKey(seat)] = seat.estatusPago
    }
  }
  return map
}
