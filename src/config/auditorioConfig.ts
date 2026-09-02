export const CONGRESO_IGE_EVENT_ID = '6b077c0c-ca75-483c-87d4-1211118936d2'

export type ZoneCode =
  | 'EXTERNOS'
  | 'ZONA_1'
  | 'ZONA_2'
  | 'ZONA_3'
  | 'ZONA_4'

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
    code: 'EXTERNOS',
    zoneId: '5f92a10b-8d76-48bc-b2e1-93109282f5d2',
    nombre: 'Zona Externos',
    color: '#1E2A39',
    bloques: [
      {
        id: 'EXT-TOP',
        nombre: 'Bloque Superior',
        filas: [
          ...rows(['A', 'B'], 3),
          ...rows(['C', 'D', 'E'], 4),
          ...rows(['F', 'G', 'H'], 5),
          ...rows(['I', 'J', 'K'], 6),
          ...rows(['L', 'M', 'N'], 7),
          ...rows(['O', 'P', 'Q'], 8),
        ],
      },
      {
        id: 'EXT-INF',
        nombre: 'Bloque Inferior',
        filas: [
          // 13 Filas de 8 asientos (R a AD)
          ...rows(['R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD'], 8),
          // Fila 14 (AE) con 4 asientos únicamente
          ...rows(['AE'], 4),
        ],
      },
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