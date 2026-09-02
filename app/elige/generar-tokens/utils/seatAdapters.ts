import { getSeatKey, getZoneByCode, auditorioConfig } from '@/config/auditorioConfig'
import type { SeatIdentity, ZoneCode } from '@/config/auditorioConfig'
import type { SeatSelectionInfo } from '@/components/asientos/zonaExternos'
import type { ZonaSeatSelectionInfo } from '@/components/asientos/ZonaGrid'
import type {
  TicketInsertPayload,
  ZonaSupabaseRow,
  ExtendedZoneConfig,
} from '../types'

// ─── Conversores de formato de clave de asiento ───────────────────────

/**
 * Extrae la etiqueta legible "FILA-NUMERO" (ej. "A-5") de una clave
 * interna con formato "ZONA|BLOQUE|FILA|NUMERO".
 */
export function seatKeyToReadable(key: string): string {
  const [, , fila, numero] = key.split('|')
  return fila && numero ? `${fila}-${numero}` : key
}

/**
 * Convierte el conjunto de claves ocupadas al formato "FILA-NUMERO"
 * que esperan los componentes visuales de mapa (zonaExternos / ZonaGrid).
 */
export function buildAsientosOcupados(occupiedSeatKeys: Set<string>): string[] {
  return Array.from(occupiedSeatKeys).map(seatKeyToReadable)
}

/**
 * Devuelve los asientos ocupados de una zona concreta en formato
 * "FILA-NUMERO", filtrando por el prefijo de clave de zona.
 */
export function getZonaOcupados(occupiedSeatKeys: Set<string>, code: string): string[] {
  const prefix = `${code}|`
  return Array.from(occupiedSeatKeys)
    .filter((key) => key.startsWith(prefix))
    .map(seatKeyToReadable)
}

/**
 * Devuelve un mapa de estatus de pago por asiento (formato "FILA-NUMERO")
 * para una zona concreta.
 */
export function getZonaStatuses(
  seatStatusMap: Record<string, string>,
  code: string,
): Record<string, string> {
  const prefix = `${code}|`
  const out: Record<string, string> = {}
  for (const [key, status] of Object.entries(seatStatusMap)) {
    if (!key.startsWith(prefix)) continue
    const readable = seatKeyToReadable(key)
    // eslint-disable-next-line security/detect-object-injection -- clave derivada de getSeatKey
    out[readable] = status
  }
  return out
}

// ─── Utilidades de zona ────────────────────────────────────────────────

/**
 * Localiza la fila de Supabase correspondiente a un código de zona (ZONA_1…ZONA_4).
 * Acepta nombres como "Zona 1", "ZONA_1" o "zona-1".
 */
export function findZonaRow(zonasSupabase: ZonaSupabaseRow[], code: string): ZonaSupabaseRow | null {
  const digit = code.replace('ZONA_', '').trim()
  return (
    zonasSupabase.find(
      (z) => z.name.replace(/[\s_-]/g, '').toLowerCase() === `zona${digit}`,
    ) ?? null
  )
}

/**
 * Resuelve la configuración extendida de la zona para un asiento seleccionado.
 * Las zonas ZONA_1…ZONA_4 no viven en auditorioConfig, así que se resuelven
 * contra los datos de Supabase para que el panel lateral de cobro tenga
 * nombre y precio.
 */
export function resolveZoneConfig(
  seat: SeatIdentity | null,
  zonasSupabase: ZonaSupabaseRow[],
): ExtendedZoneConfig | null {
  if (!seat) return null
  const configZone = getZoneByCode(seat.zoneCode)
  if (configZone) {
    return { id: configZone.zoneId, code: configZone.code, name: configZone.nombre }
  }
  const zonaRow = findZonaRow(zonasSupabase, seat.zoneCode)
  if (zonaRow) {
    return { id: zonaRow.id, code: seat.zoneCode, name: zonaRow.name, price: zonaRow.price }
  }
  return null
}

// ─── Conversión de payload de inserción ────────────────────────────────

/**
 * Convierte una fila de inserción de la tabla `tickets` (formato Supabase)
 * en un objeto SeatIdentity.
 */
export function parseInsertedSeat(row: TicketInsertPayload): SeatIdentity | null {
  if (
    !row.zone_id ||
    !row.asiento_zona ||
    !row.asiento_bloque ||
    !row.asiento_fila ||
    !row.asiento_numero
  ) {
    return null
  }

  return {
    zoneCode: row.asiento_zona as ZoneCode,
    zoneId: row.zone_id,
    bloque: row.asiento_bloque,
    fila: row.asiento_fila,
    numero: row.asiento_numero,
  }
}

// ─── Resolución de identidad desde selector de mapa ───────────────────

/**
 * Convierte la estructura del mapa abstracto del modal (bloque/fila/numero)
 * en un SeatIdentity real de la configuración del auditorio.
 *
 * Nota: las filas A–E → PREFERENTE, F–J → LUNETA y K–O → GENERAL PLANTA BAJA
 * son únicas por zona, por lo que la resolución de la zona es determinista.
 */
export function resolveSeatIdentityFromModal(info: SeatSelectionInfo): SeatIdentity | null {
  for (const zone of auditorioConfig) {
    for (const bloque of zone.bloques) {
      const filaConfig = bloque.filas.find((f) => f.fila === info.fila)
      if (filaConfig && info.numero <= filaConfig.asientos) {
        return {
          zoneCode: zone.code,
          zoneId: zone.zoneId,
          bloque: bloque.id,
          fila: info.fila,
          numero: info.numero,
        }
      }
    }
  }
  return null
}

/**
 * Deriva la clave interna de asiento a partir de un SeatIdentity.
 * Envoltorio alrededor de getSeatKey para centralizar el acceso.
 */
export function buildSeatKey(seat: SeatIdentity): string {
  return getSeatKey(seat)
}

// ─── Tipos re-exportados para conveniencia ────────────────────────────

export type { SeatIdentity, ZoneCode, SeatSelectionInfo, ZonaSeatSelectionInfo }
