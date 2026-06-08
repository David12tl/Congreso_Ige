'use client'

import { auditorioConfig, getSeatKey, type SeatIdentity } from '@/src/config/auditorioConfig'

export type SeatStatus = 'libre' | 'pre-registro' | 'pagado' | 'pendiente'

export interface SeatStatusMap {
  occupied: Set<string>
  statusMap: Record<string, SeatStatus>
}

interface AuditorioSeatMapProps {
  occupiedSeatKeys: Set<string>
  mode: 'monitor' | 'assign'
  selectedSeatKey?: string | null
  onSeatClick?: (seat: SeatIdentity) => void
  /** Mapa opcional que asigna un estatus de pago a cada asiento ocupado */
  seatStatusMap?: Record<string, SeatStatus>
}

function getStatusColor(
  status: SeatStatus | undefined,
  zoneColor: string,
  isOccupied: boolean,
  isSelected: boolean,
): React.CSSProperties {
  if (isSelected) return {}

  if (!isOccupied) return { backgroundColor: zoneColor }

  switch (status) {
    case 'pre-registro':
      return { backgroundColor: '#EA580C' } // Naranja
    case 'pendiente':
      return { backgroundColor: '#D97706' } // Ámbar
    case 'pagado':
      return { backgroundColor: '#059669' } // Verde
    default:
      return { backgroundColor: '#6B7280' } // Gris ocupado genérico
  }
}

function getStatusTitle(status: SeatStatus | undefined, defaultTitle: string): string {
  switch (status) {
    case 'pre-registro':
      return `${defaultTitle} — Pre-registro (Sin pago)`
    case 'pendiente':
      return `${defaultTitle} — Pendiente de pago`
    case 'pagado':
      return `${defaultTitle} — Confirmado (Pagado)`
    default:
      return defaultTitle
  }
}

export function AuditorioSeatMap({
  occupiedSeatKeys,
  mode,
  selectedSeatKey,
  onSeatClick,
  seatStatusMap,
}: AuditorioSeatMapProps) {
  return (
    <section className="w-full overflow-x-auto rounded-lg border border-white/10 bg-slate-950 p-4 shadow-2xl">
      <div className="min-w-[1120px] space-y-6">
        <div className="mx-auto flex h-16 w-[560px] items-center justify-center rounded-t-full border border-cyan-300/30 bg-gradient-to-b from-cyan-300/30 to-transparent text-xs font-black uppercase tracking-[0.35em] text-cyan-100 shadow-[0_0_35px_rgba(34,211,238,0.18)]">
          Escenario
        </div>

        <div className="space-y-8">
          {auditorioConfig.map((zone) => (
            <div key={zone.zoneId} className="space-y-3">
              <div className="flex items-center gap-3">
                <span
                  className="h-3 w-3 rounded-sm shadow-[0_0_16px_currentColor]"
                  style={{ backgroundColor: zone.color, color: zone.color }}
                />
                <h2 className="text-xs font-black uppercase tracking-[0.24em] text-slate-200">
                  {zone.nombre}
                </h2>
              </div>

              <div
                className={`grid gap-3 ${
                  zone.bloques.length === 1 ? 'grid-cols-1' : 'grid-cols-5'
                }`}
              >
                {zone.bloques.map((bloque) => (
                  <div
                    key={bloque.id}
                    className="rounded-md border border-white/10 bg-white/[0.025] p-3"
                  >
                    <div className="mb-2 truncate text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      {bloque.nombre}
                    </div>

                    <div className="space-y-1.5">
                      {bloque.filas.map((fila) => (
                        <div key={fila.fila} className="flex items-center justify-center gap-1">
                          <span className="mr-1 w-6 text-right text-[10px] font-bold text-slate-500">
                            {fila.fila}
                          </span>
                          {Array.from({ length: fila.asientos }, (_, index) => {
                            const numero = index + 1
                            const seat: SeatIdentity = {
                              zoneCode: zone.code,
                              zoneId: zone.zoneId,
                              bloque: bloque.id,
                              fila: fila.fila,
                              numero,
                            }
                            const key = getSeatKey(seat)
                            const occupied = occupiedSeatKeys.has(key)
                            const selected = selectedSeatKey === key
                            const status = seatStatusMap?.[key]
                            const isInteractive =
                              mode === 'assign' && !occupied

                            return (
                              <div
                                key={key}
                                className={
                                  fila.pasillosDespuesDe?.includes(numero - 1)
                                    ? 'ml-4 flex'
                                    : 'flex'
                                }
                              >
                                <button
                                  type="button"
                                  disabled={!isInteractive && !(mode === 'assign' && occupied)}
                                  onClick={() => onSeatClick?.(seat)}
                                  title={getStatusTitle(status, `${zone.nombre} ${bloque.nombre} fila ${fila.fila}, asiento ${numero}`)}
                                  aria-label={`${occupied ? 'Ocupado' : 'Disponible'}: ${zone.nombre}, ${bloque.nombre}, fila ${fila.fila}, asiento ${numero}`}
                                  className={`h-5 w-5 rounded-t-[4px] border text-[8px] font-bold leading-none transition-all duration-300 ${
                                    occupied && !status
                                      ? 'cursor-not-allowed border-gray-500/40 bg-gray-400 text-gray-700 opacity-80 animate-pulse'
                                      : status === 'pre-registro'
                                        ? 'cursor-pointer border-orange-400/60 bg-orange-600 text-orange-100 hover:scale-110 hover:border-orange-300'
                                        : status === 'pendiente'
                                          ? 'cursor-pointer border-amber-400/60 bg-amber-600 text-amber-100 hover:scale-110 hover:border-amber-300'
                                          : status === 'pagado'
                                            ? 'cursor-not-allowed border-emerald-400/60 bg-emerald-700 text-emerald-200 opacity-80'
                                            : selected
                                              ? 'scale-110 border-white bg-white text-slate-950 shadow-[0_0_0_2px_rgba(255,255,255,0.35)]'
                                              : isInteractive
                                                ? 'border-white/25 text-white hover:scale-110 hover:border-white hover:bg-white hover:text-slate-950'
                                                : 'border-white/20 text-white'
                                  }`}
                                  style={
                                    selected || (occupied && !status)
                                      ? undefined
                                      : getStatusColor(status, zone.color, occupied, selected)
                                  }
                                >
                                  {numero}
                                </button>
                              </div>
                            )
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leyenda extendida */}
      <div className="mt-6 flex flex-wrap items-center gap-4 text-[10px] font-bold uppercase tracking-widest">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm bg-gray-400" />
          <span className="text-slate-400">Ocupado genérico</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm bg-orange-600" />
          <span className="text-orange-300">Pre-registro</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm bg-amber-600" />
          <span className="text-amber-300">Pendiente de pago</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm bg-emerald-700" />
          <span className="text-emerald-300">Confirmado / Pagado</span>
        </span>
      </div>
    </section>
  )
}