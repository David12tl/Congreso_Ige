export const CONGRESO_IGE_EVENT_ID = '6b077c0c-ca75-483c-87d4-1211118936d2'

export type ZoneCode =
  | 'PREFERENTE'
  | 'LUNETA'
  | 'PALCOS'
  | 'GENERAL PLANTA BAJA'
  | 'GENERAL PLANTA ALTA'

export interface SeatRowConfig {
  fila: string
  asientos: number
  pasillosDespuesDe?: number[]
}

export interface SeatBlockConfig {
  id: string
  nombre: string
  filas: SeatRowConfig[]
}

export interface AuditorioZoneConfig {
  code: ZoneCode
  zoneId: string
  nombre: string
  color: string
  bloques: SeatBlockConfig[]
}

const withCentralAisle = (fila: string, asientos: number): SeatRowConfig => ({
  fila,
  asientos,
  pasillosDespuesDe: asientos >= 12 ? [Math.floor(asientos / 2)] : undefined,
})

const rows = (labels: string[], asientos: number): SeatRowConfig[] =>
  labels.map((fila) => withCentralAisle(fila, asientos))

export const auditorioConfig: AuditorioZoneConfig[] = [
  {
    code: 'PREFERENTE',
    zoneId: '126bd2ac-9c73-4224-9bac-bcb517699be8',
    nombre: 'Preferente',
    color: '#DC2626',
    bloques: [
      { id: 'PREF-IZQ', nombre: 'Izquierda', filas: rows(['A', 'B', 'C', 'D'], 12) },
      { id: 'PREF-CIZQ', nombre: 'Centro Izq.', filas: rows(['A', 'B', 'C', 'D'], 14) },
      { id: 'PREF-CEN', nombre: 'Centro', filas: rows(['A', 'B', 'C', 'D', 'E'], 16) },
      { id: 'PREF-CDER', nombre: 'Centro Der.', filas: rows(['A', 'B', 'C', 'D'], 14) },
      { id: 'PREF-DER', nombre: 'Derecha', filas: rows(['A', 'B', 'C', 'D'], 12) },
    ],
  },
  {
    code: 'LUNETA',
    zoneId: '219c93e2-0eb9-4b10-9954-9245c8c9fc46',
    nombre: 'Luneta',
    color: '#2563EB',
    bloques: [
      { id: 'LUN-IZQ', nombre: 'Izquierda', filas: rows(['F', 'G', 'H', 'I'], 14) },
      { id: 'LUN-CIZQ', nombre: 'Centro Izq.', filas: rows(['F', 'G', 'H', 'I'], 16) },
      { id: 'LUN-CEN', nombre: 'Centro', filas: rows(['F', 'G', 'H', 'I', 'J'], 18) },
      { id: 'LUN-CDER', nombre: 'Centro Der.', filas: rows(['F', 'G', 'H', 'I'], 16) },
      { id: 'LUN-DER', nombre: 'Derecha', filas: rows(['F', 'G', 'H', 'I'], 14) },
    ],
  },
  {
    code: 'PALCOS',
    zoneId: 'eaee25be-0ff5-4091-aa82-8dd028586c17',
    nombre: 'Palcos',
    color: '#7E22CE',
    bloques: [
      { id: 'PAL-IZQ-A', nombre: 'Palco Izq. A', filas: rows(['P1', 'P2'], 10) },
      { id: 'PAL-IZQ-B', nombre: 'Palco Izq. B', filas: rows(['P1', 'P2'], 10) },
      { id: 'PAL-CEN', nombre: 'Palco Central', filas: rows(['P1', 'P2', 'P3'], 12) },
      { id: 'PAL-DER-B', nombre: 'Palco Der. B', filas: rows(['P1', 'P2'], 10) },
      { id: 'PAL-DER-A', nombre: 'Palco Der. A', filas: rows(['P1', 'P2'], 10) },
    ],
  },
  {
    code: 'GENERAL PLANTA BAJA',
    zoneId: '42ac3d31-39ad-45ba-bdbe-f7455d460cd7',
    nombre: 'General Planta Baja',
    color: '#15803D',
    bloques: [
      { id: 'GPB-CEN', nombre: 'Bloque General PB', filas: rows(['K', 'L', 'M', 'N', 'O'], 18) },
    ],
  },
  {
    code: 'GENERAL PLANTA ALTA',
    zoneId: '363c612c-7bf9-4118-8510-4ff90099c4f6',
    nombre: 'General Planta Alta',
    color: '#4D7C0F',
    bloques: [
      { id: 'GPA-CEN', nombre: 'Balcón General PA', filas: rows(['AA', 'BB', 'CC', 'DD'], 20) },
    ],
  },
]

export interface SeatIdentity {
  zoneCode: ZoneCode
  zoneId: string
  bloque: string
  fila: string
  numero: number
}

export function getSeatKey(seat: SeatIdentity) {
  return `${seat.zoneCode}|${seat.bloque}|${seat.fila}|${seat.numero}`
}

export function getZoneByCode(zoneCode: string) {
  return auditorioConfig.find((zone) => zone.code === zoneCode)
}
