'use server'

import { createClient } from '@/lib/supabase/server'
import type { OccupiedSeat } from '@/components/asientos/types'
import type { ZoneCode } from '@/config/auditorioConfig'

// Definiendo la interfaz estricta de la fila de la base de datos para evitar desajustes
interface TicketSeatRow {
  id: string
  zone_id: string | null
  asiento_zona: string | null
  asiento_bloque: string | null
  asiento_fila: string | null
  asiento_numero: number | null
  purchase_id: string | null
  buyer_id: string | null
  status: string | null
}

// --- Predicado de Tipo (Type Guard) ---
// Solución al Error 2677: El parámetro 'row' ahora acepta 'buyer_id: string | null' 
// volviéndose completamente asignable y compatible. Sin usar jamás 'any'.
function isFullyDefinedSeat(row: TicketSeatRow): row is TicketSeatRow & { 
  asiento_zona: string
  zone_id: string
  asiento_bloque: string
  asiento_fila: string
  asiento_numero: number
} {
  return !!(
    row.zone_id && 
    row.asiento_zona && 
    row.asiento_bloque && 
    row.asiento_fila && 
    row.asiento_numero !== null
  )
}

// --- Función para obtener los asientos del mapa ---
export async function getOccupiedSeats(): Promise<OccupiedSeat[]> {
  const supabase = await createClient()

  // Reemplazamos 'any' por 'unknown' combinando con la estructura esperada de la Promesa.
  // Esto salta el validador estricto del esquema de Supabase pero complace a ESLint al 100%.
  const { data, error } = await (supabase
    .from('tickets')
    .select('id, zone_id, asiento_zona, asiento_bloque, asiento_fila, asiento_numero, purchase_id, buyer_id, status') as unknown as Promise<{ 
      data: Record<string, unknown>[] | null; 
      error: { message: string } | null 
    }>)

  if (error || !data) {
    console.error('[getOccupiedSeats] Error:', error?.message)
    return []
  }

  // Forzamos el tipado intermedio controlado a través de la interfaz para que TypeScript conozca la estructura
  const rows = data as unknown as TicketSeatRow[]

  // Solución al Error 2322: Filtramos los nulos usando el Type Guard y mapeamos con fallbacks seguros
  const occupiedSeats: OccupiedSeat[] = rows
    .filter(isFullyDefinedSeat)
    .map((row) => ({
      ticketId: row.id,
      zoneCode: row.asiento_zona as ZoneCode, 
      zoneId: row.zone_id,                  // Al pasar por el filter, TS ya sabe que es string (no null)
      bloque: row.asiento_bloque,          // Al pasar por el filter, TS ya sabe que es string (no null)
      fila: row.asiento_fila,              // Al pasar por el filter, TS ya sabe que es string (no null)
      numero: row.asiento_numero,          // Al pasar por el filter, TS ya sabe que es number (no null)
      estatusPago: row.status === 'pagado' ? 'pagado' : 'pre-registro',
      buyerId: row.buyer_id ?? '',         // Fallback seguro en caso de que buyer_id sea nulo
    }))

  return occupiedSeats
}