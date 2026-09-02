'use client'

import React from 'react'
import { auditorioConfig, getSeatKey, type SeatIdentity } from '@/config/auditorioConfig'
import type { SeatEstatusPago } from './types'

export type SeatStatus = SeatEstatusPago

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
    case 'apartado':
      return { backgroundColor: '#f59e0b' } // Ámbar
    case 'pagado':
      return { backgroundColor: '#00a354' } // Verde corporativo
    case 'completo':
      return { backgroundColor: '#DC2626' } // Rojo
    default:
      return { backgroundColor: '#a3a3a3' } // Gris neutro
  }
}

function getStatusTitle(status: SeatStatus | undefined, defaultTitle: string): string {
  switch (status) {
    case 'pre-registro':
      return `${defaultTitle} — Pre-registro (Sin pago)`
    case 'pendiente':
      return `${defaultTitle} — Pendiente de pago (Apartado)`
    case 'apartado':
      return `${defaultTitle} — Apartado (Pago parcial)`
    case 'pagado':
      return `${defaultTitle} — Confirmado (Pagado)`
    case 'completo':
      return `${defaultTitle} — Liquidado`
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
    <section className="w-full overflow-x-auto rounded-2xl border border-[#e5e5e5] bg-white p-5 shadow-sm">
      <div className="min-w-[1120px] space-y-6">
        {/* Escenario */}
        <div className="mx-auto flex h-14 w-[560px] items-center justify-center rounded-b-3xl border-x border-b border-[#00a354]/20 bg-gradient-to-b from-[#00a354]/5 to-[#00a354]/10 text-xs font-black uppercase tracking-[0.35em] text-[#00a354] shadow-sm">
          Escenario
        </div>

        <div className="space-y-8">
          {auditorioConfig.map((zone) => (
            <div key={zone.zoneId} className="space-y-3">
              {/* Encabezado de la Zona */}
              <div className="flex items-center gap-3">
                <span
                  className="h-3.5 w-3.5 rounded-md border border-black/5 shadow-sm"
                  style={{ backgroundColor: zone.color }}
                />
                <h2 className="text-xs font-black uppercase tracking-[0.24em] text-[#1a1a1a]">
                  {zone.nombre}
                </h2>
              </div>

              {/* Contenedor de Bloques ajustado a layout de 1 o 2 columnas si es zona externos */}
              <div
                className={`grid gap-6 ${
                  zone.bloques.length === 1
                    ? 'grid-cols-1'
                    : zone.bloques.length === 2
                      ? 'grid-cols-1 lg:grid-cols-2'
                      : 'grid-cols-1 md:grid-cols-3 lg:grid-cols-5'
                }`}
              >
                {zone.bloques.map((bloque) => {
                  const totalAsientosBloque = bloque.filas.reduce(
                    (acc, fila) => acc + fila.asientos,
                    0,
                  )

                  return (
                    <div
                      key={bloque.id}
                      className="rounded-xl border border-[#e5e5e5] bg-[#f5f5f5]/40 p-4"
                    >
                      {/* Título del Bloque con conteo exacto */}
                      <div className="mb-4 flex items-center justify-center border-b border-[#e5e5e5] pb-2">
                        <span className="rounded-full bg-[#1E2A39] px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-sm">
                          {bloque.nombre} ({totalAsientosBloque})
                        </span>
                      </div>

                      <div className="space-y-2">
                        {bloque.filas.map((fila) => (
                          <div
                            key={fila.fila}
                            className="flex items-center justify-center gap-1"
                          >
                            {/* Identificador de fila Izquierdo */}
                            <span className="mr-2 w-6 text-right text-[10px] font-black text-[#4a4a4a]/70">
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
                              const isApartado =
                                status === 'apartado' || status === 'pendiente'
                              const isPagado =
                                status === 'pagado' || status === 'completo'
                              const isPreRegistro = status === 'pre-registro'
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
                                    disabled={
                                      !isInteractive &&
                                      !(mode === 'assign' && occupied)
                                    }
                                    onClick={() => onSeatClick?.(seat)}
                                    title={getStatusTitle(
                                      status,
                                      `${zone.nombre} ${bloque.nombre} fila ${fila.fila}, asiento ${numero}`,
                                    )}
                                    aria-label={`${
                                      occupied ? 'Ocupado' : 'Disponible'
                                    }: ${zone.nombre}, ${bloque.nombre}, fila ${fila.fila}, asiento ${numero}`}
                                    className={`h-6 w-6 rounded-t-[5px] border text-[9px] font-black leading-none transition-all duration-150 ${
                                      occupied && !status
                                        ? 'cursor-not-allowed border-[#e5e5e5] bg-[#e5e5e5] text-[#4a4a4a] opacity-65'
                                        : isPreRegistro
                                          ? 'cursor-pointer border-orange-500 bg-orange-600 text-white hover:scale-110 hover:brightness-105'
                                          : isApartado
                                            ? 'cursor-pointer border-amber-400 bg-amber-500 text-white hover:scale-110 hover:brightness-105'
                                            : isPagado
                                              ? 'cursor-not-allowed border-[#00a354]/30 bg-[#00a354] text-white opacity-85'
                                              : selected
                                                ? 'scale-110 border-[#1a1a1a] bg-[#1a1a1a] text-white shadow-[0_0_0_2px_rgba(26,26,26,0.15)]'
                                                : isInteractive
                                                  ? 'border-[#e5e5e5] bg-white text-[#4a4a4a] hover:scale-110 hover:border-[#00a354] hover:bg-[#00a354]/10 hover:text-[#00a354]'
                                                  : 'border-[#e5e5e5] bg-white text-[#4a4a4a]'
                                    }`}
                                    style={
                                      selected || (occupied && !status)
                                        ? undefined
                                        : getStatusColor(
                                            status,
                                            zone.color,
                                            occupied,
                                            selected,
                                          )
                                    }
                                  >
                                    {numero}
                                  </button>
                                </div>
                              )
                            })}

                            {/* Identificador de fila Derecho */}
                            <span className="ml-2 w-6 text-left text-[10px] font-black text-[#4a4a4a]/70">
                              {fila.fila}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leyenda extendida */}
      <div className="mt-6 flex flex-wrap items-center gap-5 border-t border-[#e5e5e5] pt-4 text-[9px] font-black uppercase tracking-widest text-[#4a4a4a]">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3.5 w-3.5 rounded-sm bg-[#a3a3a3] border border-black/5" />
          <span>Ocupado genérico</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3.5 w-3.5 rounded-sm bg-orange-600 border border-black/5" />
          <span className="text-orange-600">Pre-registro</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3.5 w-3.5 rounded-sm bg-amber-500 border border-black/5" />
          <span className="text-amber-600">Apartado (Pago parcial)</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3.5 w-3.5 rounded-sm bg-[#00a354] border border-black/5" />
          <span className="text-[#00a354]">Confirmado / Pagado</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3.5 w-3.5 rounded-sm bg-red-600 border border-black/5" />
          <span className="text-red-600">Liquidado (Caja)</span>
        </span>
      </div>
    </section>
  )
}