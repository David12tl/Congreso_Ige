'use server'

import { CONGRESO_IGE_EVENT_ID, getSeatKey, type ZoneCode } from '@/src/config/auditorioConfig'
import { createClient } from '@/src/lib/supabase/server'
import type { OccupiedSeat } from '@/src/components/asientos/types'

interface TicketSeatRow {
  id: string
  zone_id: string | null
  asiento_zona: string | null
  asiento_bloque: string | null
  asiento_fila: string | null
  asiento_numero: number | null
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
    .select('id, zone_id, asiento_zona, asiento_bloque, asiento_fila, asiento_numero')
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
    .map((ticket) => ({
      ticketId: ticket.id,
      zoneCode: ticket.asiento_zona,
      zoneId: ticket.zone_id,
      bloque: ticket.asiento_bloque,
      fila: ticket.asiento_fila,
      numero: ticket.asiento_numero,
    }))
}

export async function getOccupiedSeatKeys(): Promise<string[]> {
  return (await getOccupiedSeats()).map(getSeatKey)
}
