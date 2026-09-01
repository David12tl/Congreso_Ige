'use client'

import React, { useMemo, useState } from 'react'

/**
 * Grid numérico de asientos para zonas convencionales (ZONA_1 … ZONA_4).
 * A diferencia del mapa trapezoidal de EXTERNOS (zonaExternos.tsx), aquí la
 * plantilla NO es estática: se genera dinámicamente a partir de la capacidad
 * de la zona traída de Supabase (tabla `zones`).
 *
 * Formato de asiento: "FILA-NUMERO" (ej. "A-5"), consistente con el mapa de
 * EXTERNOS. Las butacas ocupadas siguen visibles (no se deshabilitan) para que
 * la taquilla pueda abrir directamente el panel de liquidación al hacer clic.
 */

// Estructura informativa del asiento seleccionado dentro del grid.
export interface ZonaSeatSelectionInfo {
  fila: string
  numero: number
}

export type ZonaSeatStatus = 'libre' | 'apartado' | 'pagado' | 'desconocido'

interface ZonaGridProps {
  zoneCode: string
  zoneName: string
  capacity: number
  /** Asientos ocupados en formato "FILA-NUMERO" de ESTA zona. */
  occupiedSeats?: string[]
  /** Estatus por asiento en formato "FILA-NUMERO" de ESTA zona. */
  seatStatuses?: Record<string, string>
  /** Capacidad visual: asientos por fila (por defecto 10). */
  seatsPerRow?: number
  onSeatSelect?: (seatId: string, seatInfo: ZonaSeatSelectionInfo) => void
}

export default function ZonaGrid({
  zoneCode,
  zoneName,
  capacity,
  occupiedSeats = [],
  seatStatuses = {},
  seatsPerRow = 10,
  onSeatSelect,
}: ZonaGridProps) {
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null)

  // Construcción dinámica de filas: letras A, B, C… y numeración global 1..capacity.
  const rows = useMemo(() => {
    const totalRows = Math.max(1, Math.ceil(capacity / seatsPerRow))
    return Array.from({ length: totalRows }, (_, rowIndex) => {
      const fila = String.fromCharCode(65 + rowIndex)
      const start = rowIndex * seatsPerRow
      const count = Math.min(seatsPerRow, capacity - start)
      return {
        fila,
        asientos: Array.from({ length: Math.max(0, count) }, (_, i) => start + i + 1),
      }
    }).filter((r) => r.asientos.length > 0)
  }, [capacity, seatsPerRow])

  const handleSelect = (seatId: string, info: ZonaSeatSelectionInfo) => {
    setSelectedSeat(seatId)
    if (onSeatSelect) onSeatSelect(seatId, info)
  }

  const resolveStatus = (seatId: string): ZonaSeatStatus => {
    if (!occupiedSeats.includes(seatId)) return 'libre'
    const status = (seatStatuses[seatId] ?? '').toLowerCase()
    if (status === 'pagado' || status === 'completo') return 'pagado'
    if (status === 'apartado' || status === 'pendiente' || status === 'pre-registro') return 'apartado'
    return 'pagado' // Ocupado sin estatus conocido: se muestra como no disponible.
  }

  return (
    <div className="w-full flex flex-col items-center bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
      {/* Encabezado de la zona */}
      <div className="mb-6 text-center">
        <h3 className="text-sm font-black uppercase tracking-widest text-[#1E2A39]">
          {zoneName || zoneCode}
        </h3>
        <p className="text-[11px] text-slate-500 font-medium">
          Capacidad: {capacity} asientos
        </p>
      </div>

      {/* Escenario / Frente */}
      <div className="w-64 sm:w-80 h-3 bg-[#1E2A39] rounded-b-xl mb-8 shadow-sm flex items-center justify-center">
        <span className="text-[9px] font-black uppercase tracking-widest text-white/80">Escenario</span>
      </div>

      {/* Grid de asientos */}
      <div className="flex flex-col items-center gap-2 min-w-max">
        {rows.map((row) => (
          <div key={`${zoneCode}-row-${row.fila}`} className="flex items-center gap-1.5 justify-center">
            {/* Etiqueta de Fila Izquierda */}
            <span className="w-5 text-right font-mono text-xs font-bold text-slate-400 select-none mr-1">
              {row.fila}
            </span>

            <div className="flex gap-1.5 justify-center">
              {row.asientos.map((numero) => {
                const seatId = `${row.fila}-${numero}`
                const status = resolveStatus(seatId)
                const isSelected = selectedSeat === seatId

                return (
                  <button
                    key={seatId}
                    onClick={() => handleSelect(seatId, { fila: row.fila, numero })}
                    title={`Asiento ${seatId}`}
                    className={`
                      w-6 h-6 sm:w-7 sm:h-7 rounded-t-md text-[10px] font-bold transition-all duration-150
                      flex items-center justify-center border
                      ${status === 'apartado'
                        ? 'bg-amber-200 border-amber-400 text-amber-800 hover:border-amber-600'
                        : status === 'pagado'
                          ? 'bg-rose-200 border-rose-400 text-rose-700'
                          : isSelected
                            ? 'bg-[#8B1E23] text-white border-[#8B1E23] scale-110 shadow-md ring-2 ring-[#8B1E23]/30'
                            : 'bg-white border-slate-300 text-slate-700 hover:border-[#1E2A39] hover:bg-slate-100'
                      }
                    `}
                  >
                    {numero}
                  </button>
                )
              })}
            </div>

            {/* Etiqueta de Fila Derecha */}
            <span className="w-5 text-left font-mono text-xs font-bold text-[#7D7D7D] select-none ml-1">
              {row.fila}
            </span>
          </div>
        ))}
      </div>

      {/* Leyenda de estados */}
      <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-xs font-medium text-slate-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-white border border-slate-300"></div>
          <span>Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#8B1E23]"></div>
          <span>Seleccionado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-amber-200 border border-amber-400"></div>
          <span>Apartado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-rose-200 border border-rose-400"></div>
          <span>Pagado</span>
        </div>
      </div>
    </div>
  )
}
