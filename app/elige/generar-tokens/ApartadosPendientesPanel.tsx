'use client'

import {
  HiClipboardList,
  HiCurrencyDollar,
  HiExclamationCircle,
  HiOutlineCheckCircle,
  HiRefresh,
  HiSearch,
  HiX,
} from 'react-icons/hi'
import type { ApartadoPendienteRow } from './TaquillaTokensView'

interface ApartadosPendientesPanelProps {
  apartadosFiltrados: ApartadoPendienteRow[]
  totalPendientes: number
  totalAdeudo: number
  filtroNombre: string
  onFiltroNombreChange: (value: string) => void
  loadingApartados: boolean
  errorApartados: string | null
  isPending: boolean
  onRecargar: () => void
  onLiquidar: (row: ApartadoPendienteRow) => void
}

export function ApartadosPendientesPanel({
  apartadosFiltrados,
  totalPendientes,
  totalAdeudo,
  filtroNombre,
  onFiltroNombreChange,
  loadingApartados,
  errorApartados,
  isPending,
  onRecargar,
  onLiquidar,
}: ApartadosPendientesPanelProps) {
  return (
    <div className="mt-6 rounded-2xl border border-amber-500/30 bg-white dark:bg-[#2a2a2f] shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-[#e5e5e5]">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
            <HiClipboardList className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-amber-600">Apartados Pendientes</h3>
            <p className="text-[10px] text-[#4a4a4a]">Personas que aún deben liquidar el resto de su asiento.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[9px] uppercase tracking-widest text-[#4a4a4a] font-bold">Pendientes</p>
            <p className="text-lg font-black text-amber-600 leading-none">{totalPendientes}</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] uppercase tracking-widest text-[#4a4a4a] font-bold">Adeudo Total</p>
            <p className="text-lg font-black text-rose-600 leading-none">${totalAdeudo.toLocaleString('es-MX')} MXN</p>
          </div>
          <button
            type="button"
            onClick={onRecargar}
            className="bg-[#f5f5f5] hover:bg-[#e5e5e5] border border-[#e5e5e5] text-[#1a1a1a] rounded-lg p-2 transition shadow-sm"
            title="Refrescar lista"
          >
            <HiRefresh className={`h-4 w-4 ${loadingApartados ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {errorApartados && (
        <div className="m-4 bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2 text-[11px] text-red-600">
          <HiExclamationCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{errorApartados}</span>
        </div>
      )}

      <div className="p-4">
        <div className="mb-3 flex items-center gap-2 bg-[#f5f5f5] border border-[#e5e5e5] rounded-xl px-3 py-2">
          <HiSearch className="w-4 h-4 text-[#4a4a4a]" />
          <input
            type="text"
            value={filtroNombre}
            onChange={(e) => onFiltroNombreChange(e.target.value)}
            placeholder="Filtrar por nombre o correo..."
            className="flex-1 bg-transparent text-xs text-[#1a1a1a] focus:outline-none placeholder:text-[#4a4a4a]/60"
          />
          {filtroNombre && (
            <button
              type="button"
              onClick={() => onFiltroNombreChange('')}
              className="text-[#4a4a4a] hover:text-[#1a1a1a]"
            >
              <HiX className="w-3 h-3" />
            </button>
          )}
        </div>

        {loadingApartados && totalPendientes === 0 ? (
          <div className="py-12 text-center">
            <div className="w-8 h-8 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin mx-auto mb-3" />
            <p className="text-xs text-[#4a4a4a] font-mono">Cargando lista de apartados pendientes...</p>
          </div>
        ) : apartadosFiltrados.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-[#e5e5e5] rounded-xl">
            <HiOutlineCheckCircle className="mx-auto h-8 w-8 text-[#00a354]/40 mb-2" />
            <p className="text-xs font-bold uppercase tracking-wider text-[#4a4a4a]">
              {totalPendientes === 0 ? '¡No hay apartados pendientes!' : 'Sin coincidencias para el filtro.'}
            </p>
            {totalPendientes === 0 && (
              <p className="mt-1 text-[11px] text-[#4a4a4a]/70">Todos los asientos apartados han sido liquidados.</p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[#e5e5e5]">
            <table className="w-full text-[11px]">
              <thead className="bg-[#f5f5f5] border-b border-[#e5e5e5] text-[#4a4a4a] uppercase tracking-wider text-[9px]">
                <tr>
                  <th className="px-3 py-2.5 text-left font-black">Alumno</th>
                  <th className="px-3 py-2.5 text-left font-black">Correo</th>
                  <th className="px-3 py-2.5 text-left font-black">Asiento</th>
                  <th className="px-3 py-2.5 text-right font-black">Abonado</th>
                  <th className="px-3 py-2.5 text-right font-black">Restante</th>
                  <th className="px-3 py-2.5 text-center font-black">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e5e5]">
                {apartadosFiltrados.map((row) => (
                  <tr key={row.ticketId} className="hover:bg-[#f5f5f5]/30 transition">
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center font-black text-[10px] shrink-0">
                          {row.nombre?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <span className="font-bold text-[#1a1a1a] truncate max-w-[140px]" title={row.nombre ?? ''}>
                          {row.nombre || '—'}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-[#4a4a4a] font-mono text-[10px] truncate max-w-[180px]" title={row.email ?? ''}>
                      {row.email || '—'}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex flex-col">
                        <span className="text-[#1a1a1a] font-black">
                          {row.zoneCode} · {row.bloque}{row.fila}{row.numero}
                        </span>
                        <span className="text-[#4a4a4a] text-[9px]">
                          Bloque {row.bloque} · Fila {row.fila} · Num {row.numero}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <span className="text-[#00a354] font-black">${row.totalAbonado.toLocaleString('es-MX')}</span>
                      <span className="text-[#4a4a4a] text-[9px] block">de ${row.total.toLocaleString('es-MX')}</span>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <span className="text-rose-600 font-black">${row.montoRestante.toLocaleString('es-MX')}</span>
                      <span className="text-[#4a4a4a] text-[9px] block">MXN</span>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => onLiquidar(row)}
                        disabled={isPending}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 text-white font-black uppercase tracking-wider text-[10px] px-3 py-1.5 hover:opacity-90 disabled:opacity-50 transition shadow-sm"
                      >
                        <HiCurrencyDollar className="w-3 h-3" />
                        Liquidar Saldo
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}