'use client'

import { auditorioConfig, getSeatKey, type SeatIdentity } from '@/src/config/auditorioConfig'

interface AuditorioSeatMapProps {
  occupiedSeatKeys: Set<string>
  mode: 'monitor' | 'assign'
  selectedSeatKey?: string | null
  onSeatClick?: (seat: SeatIdentity) => void
}

export function AuditorioSeatMap({
  occupiedSeatKeys,
  mode,
  selectedSeatKey,
  onSeatClick,
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
                            const isInteractive = mode === 'assign' && !occupied

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
                                  disabled={!isInteractive}
                                  onClick={() => onSeatClick?.(seat)}
                                  title={`${zone.nombre} ${bloque.nombre} fila ${fila.fila}, asiento ${numero}`}
                                  aria-label={`${occupied ? 'Ocupado' : 'Disponible'}: ${zone.nombre}, ${bloque.nombre}, fila ${fila.fila}, asiento ${numero}`}
                                  className={`h-5 w-5 rounded-t-[4px] border text-[8px] font-bold leading-none transition-all duration-300 ${
                                    occupied
                                      ? 'cursor-not-allowed border-gray-500/40 bg-gray-400 text-gray-700 opacity-80 animate-pulse'
                                      : selected
                                        ? 'scale-110 border-white bg-white text-slate-950 shadow-[0_0_0_2px_rgba(255,255,255,0.35)]'
                                        : isInteractive
                                          ? 'border-white/25 text-white hover:scale-110 hover:border-white hover:bg-white hover:text-slate-950'
                                          : 'border-white/20 text-white'
                                  }`}
                                  style={
                                    occupied || selected
                                      ? undefined
                                      : { backgroundColor: zone.color }
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
    </section>
  )
}
