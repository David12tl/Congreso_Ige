export const CONGRESO_IGE_EVENT_ID = '6b077c0c-ca75-483c-87d4-1211118936d2'

export const ZONE_UUIDS: Record<string, string> = {
  externos: '126bd2ac-9c73-4224-9bac-bcb517699be8',
  zona1: '219c93e2-0eb9-4b10-9954-9245c8c9fc46',
  zona2: '42ac3d31-39ad-45ba-bdbe-f7455d460cd7',
  zona3: '363c612c-7bf9-4118-8510-4ff90099c4f6',
  zona4: 'eaee25be-0ff5-4091-aa82-8dd028586c17',
}

export function getZoneUuid(keyOrId?: string | null): string | null {
  if (!keyOrId) return null
  if (ZONE_UUIDS[keyOrId]) return ZONE_UUIDS[keyOrId]
  const normalized = keyOrId.toLowerCase().replace(/[\s_-]/g, '')
  if (ZONE_UUIDS[normalized]) return ZONE_UUIDS[normalized]
  if (Object.values(ZONE_UUIDS).includes(keyOrId)) return keyOrId
  return keyOrId
}

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
    zoneId: ZONE_UUIDS.externos,
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