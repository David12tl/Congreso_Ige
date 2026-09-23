'use client'

import { useState, useMemo } from 'react'
import {
  HiClipboardList,
  HiCurrencyDollar,
  HiExclamationCircle,
  HiOutlineCheckCircle,
  HiRefresh,
  HiSearch,
  HiX,
  HiChevronLeft,
  HiChevronRight,
} from 'react-icons/hi'
import type { ApartadoPendienteRow } from './TaquillaTokensView'

// Iconos estilo Material para "Ir al Inicio" y "Ir al Final"
function FirstPageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
    </svg>
  )
}

function LastPageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
    </svg>
  )
}

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

const ITEMS_PER_PAGE = 5 // Límite estricto de 5 renderizados

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
  const [currentPage, setCurrentPage] = useState(1)

  // ─── Control de estado derivado ───
  const [prevFiltro, setPrevFiltro] = useState(filtroNombre)
  const [prevLength, setPrevLength] = useState(apartadosFiltrados.length)

  if (prevFiltro !== filtroNombre || prevLength !== apartadosFiltrados.length) {
    setPrevFiltro(filtroNombre)
    setPrevLength(apartadosFiltrados.length)
    setCurrentPage(1)
  }

  // Cálculo de total de páginas
  const totalPages = Math.ceil(apartadosFiltrados.length / ITEMS_PER_PAGE) || 1

  // Elementos paginados para la vista actual (máximo 5)
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return apartadosFiltrados.slice(start, start + ITEMS_PER_PAGE)
  }, [apartadosFiltrados, currentPage])

  // Cálculo del rango actual (ej. 1-5 de 13)
  const startRange = apartadosFiltrados.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1
  const endRange = Math.min(currentPage * ITEMS_PER_PAGE, apartadosFiltrados.length)

  return (
    <div className="mt-6 rounded-2xl border border-amber-500/30 bg-white dark:bg-[#2a2a2f] shadow-sm overflow-hidden">
      {/* Encabezado */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-[#e5e5e5] dark:border-[#38383e]">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
            <HiClipboardList className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-amber-600">
              Apartados Pendientes
            </h3>
            <p className="text-[10px] text-[#4a4a4a]">
              Personas que aún deben liquidar el resto de su asiento.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[9px] uppercase tracking-widest text-[#4a4a4a] font-bold">
              Pendientes
            </p>
            <p className="text-lg font-black text-amber-600 leading-none">
              {totalPendientes}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[9px] uppercase tracking-widest text-[#4a4a4a] font-bold">
              Adeudo Total
            </p>
            <p className="text-lg font-black text-rose-600 leading-none">
              ${totalAdeudo.toLocaleString('es-MX')} MXN
            </p>
          </div>
          <button
            type="button"
            onClick={onRecargar}
            className="bg-[#f5f5f5] hover:bg-[#e5e5e5] dark:bg-[#333] border border-[#e5e5e5] dark:border-[#444] text-[#1a1a1a] dark:text-white rounded-lg p-2 transition shadow-sm"
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

      <div className="p-4 space-y-4">
        {/* Barra de Búsqueda */}
        <div className="flex items-center gap-2 bg-[#f5f5f5] dark:bg-[#202023] border border-[#e5e5e5] dark:border-[#38383e] rounded-xl px-3 py-1.5">
          <HiSearch className="w-4 h-4 text-[#4a4a4a] shrink-0" />
          <input
            type="text"
            value={filtroNombre}
            onChange={(e) => onFiltroNombreChange(e.target.value)}
            placeholder="Filtrar por nombre o correo..."
            className="w-full bg-transparent text-xs text-[#1a1a1a] dark:text-white focus:outline-none placeholder:text-[#4a4a4a]/60"
          />
          {filtroNombre && (
            <button
              type="button"
              onClick={() => onFiltroNombreChange('')}
              className="text-[#4a4a4a] hover:text-[#1a1a1a] dark:hover:text-white shrink-0"
            >
              <HiX className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Estado de Carga / Lista Vacía / Tabla */}
        {loadingApartados && totalPendientes === 0 ? (
          <div className="py-12 text-center">
            <div className="w-8 h-8 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin mx-auto mb-3" />
            <p className="text-xs text-[#4a4a4a] font-mono">
              Cargando lista de apartados pendientes...
            </p>
          </div>
        ) : apartadosFiltrados.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-[#e5e5e5] dark:border-[#38383e] rounded-xl">
            <HiOutlineCheckCircle className="mx-auto h-8 w-8 text-[#00a354]/40 mb-2" />
            <p className="text-xs font-bold uppercase tracking-wider text-[#4a4a4a]">
              {totalPendientes === 0
                ? '¡No hay apartados pendientes!'
                : 'Sin coincidencias para el filtro.'}
            </p>
            {totalPendientes === 0 && (
              <p className="mt-1 text-[11px] text-[#4a4a4a]/70">
                Todos los asientos apartados han sido liquidados.
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="w-full rounded-xl border border-[#e5e5e5] dark:border-[#38383e] overflow-hidden">
              <table className="w-full table-fixed text-[11px]">
                <thead className="bg-[#f5f5f5] dark:bg-[#202023] border-b border-[#e5e5e5] dark:border-[#38383e] text-[#4a4a4a] uppercase tracking-wider text-[9px]">
                  <tr>
                    <th className="w-[32%] px-3 py-2 text-left font-black">Cliente</th>
                    <th className="w-[20%] px-2 py-2 text-left font-black">Asiento</th>
                    <th className="w-[24%] px-2 py-2 text-right font-black">Abonado / Restante</th>
                    <th className="w-[24%] px-3 py-2 text-center font-black">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e5e5] dark:divide-[#38383e]">
                  {currentItems.map((row) => (
                    <tr key={row.ticketId} className="hover:bg-[#f5f5f5]/50 dark:hover:bg-[#333]/30 transition">
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <div className="h-7 w-7 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center font-black text-[10px] shrink-0">
                            {row.nombre?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-[#1a1a1a] dark:text-white truncate leading-tight" title={row.nombre ?? ''}>
                              {row.nombre || '—'}
                            </p>
                            <p className="text-[#4a4a4a] font-mono text-[9px] truncate" title={row.email ?? ''}>
                              {row.email || 'Sin correo'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-2 py-2.5">
                        <div className="flex flex-col">
                          <span className="text-[#1a1a1a] dark:text-white font-black truncate">
                            {row.zoneCode}
                          </span>
                          <span className="text-[#4a4a4a] text-[10px] font-semibold">
                            B{row.bloque} · F{row.fila} · N{row.numero}
                          </span>
                        </div>
                      </td>

                      <td className="px-2 py-2.5 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-rose-600 font-black text-[11px]">
                            ${row.montoRestante.toLocaleString('es-MX')}
                          </span>
                          <span className="text-[#00a354] text-[9px] font-bold">
                            Abonó: ${row.totalAbonado.toLocaleString('es-MX')}
                          </span>
                        </div>
                      </td>

                      <td className="px-3 py-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => onLiquidar(row)}
                          disabled={isPending}
                          className="w-full justify-center inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 text-white font-black uppercase tracking-wider text-[9px] sm:text-[10px] px-2 py-1.5 hover:opacity-90 disabled:opacity-50 transition shadow-sm"
                        >
                          <HiCurrencyDollar className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">Liquidar</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ─── Navegación Simplificada (1-5 de X) ─── */}
            <div className="pt-2 flex items-center justify-end gap-5 text-xs text-[#1a1a1a] dark:text-gray-200">
              {/* Rango e Información Total */}
              <div className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                {startRange}-{endRange} de {apartadosFiltrados.length}
              </div>

              {/* Botones de Navegación */}
              <div className="flex items-center gap-1">
                {/* Primera Página |< */}
                <button
                  type="button"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#38383e] disabled:opacity-30 disabled:hover:bg-transparent transition"
                  title="Primera página"
                >
                  <FirstPageIcon className="w-4 h-4" />
                </button>

                {/* Anterior < */}
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#38383e] disabled:opacity-30 disabled:hover:bg-transparent transition"
                  title="Página anterior"
                >
                  <HiChevronLeft className="w-4 h-4" />
                </button>

                {/* Siguiente > */}
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#38383e] disabled:opacity-30 disabled:hover:bg-transparent transition"
                  title="Página siguiente"
                >
                  <HiChevronRight className="w-4 h-4" />
                </button>

                {/* Última Página >| */}
                <button
                  type="button"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#38383e] disabled:opacity-30 disabled:hover:bg-transparent transition"
                  title="Última página"
                >
                  <LastPageIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}