'use client'

import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { 
  HiOutlineTicket, 
  HiOutlineChartBar, 
  HiOutlineSearch, 
  HiOutlineFilter,
  HiOutlineRefresh,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineCheck,
  HiOutlineAcademicCap,
  HiOutlineOfficeBuilding,
  HiChevronLeft,
  HiChevronRight
} from 'react-icons/hi'
import { GlassCard } from '@/components/ui/GlassCard'
import { getTickets, Ticket } from './action'

const TOTAL_AFORO = 1200 // Capacidad máxima del recinto/evento
const ITEMS_PER_PAGE = 10 // Fijado a 10 registros por página

// Íconos SVG auxiliares para "Ir al Inicio" (|<) y "Ir al Final" (>|)
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

export default function TicketsVendidosPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('todos')
  const [typeFilter, setTypeFilter] = useState<string>('todos')
  const [zoneFilter, setZoneFilter] = useState<string>('todas')
  const [currentPage, setCurrentPage] = useState<number>(1)

  // Cargar registros llamando a la Server Action
  const fetchTicketsData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setLoading(true)
    }
    const { tickets: data } = await getTickets()
    setTickets(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    let isMounted = true

    getTickets().then(({ tickets: data }) => {
      if (isMounted) {
        setTickets(data)
        setLoading(false)
      }
    })

    return () => {
      isMounted = false
    }
  }, [])

  // 1. Total Boletos Pagados
  const totalPagados = useMemo(() => {
    return tickets.filter(t => t.estatus_pago === 'pagado').length
  }, [tickets])

  // 2. Capacidad Utilizada (%)
  const capacidadPorcentaje = useMemo(() => {
    return ((totalPagados / TOTAL_AFORO) * 100).toFixed(1)
  }, [totalPagados])

  // 3. Zona Más Vendida
  const zonaMasVendida = useMemo(() => {
    const pagados = tickets.filter(t => t.estatus_pago === 'pagado' && t.asiento_zona)
    if (pagados.length === 0) return 'N/A'

    const conteoZonas = new Map<string, number>()
    pagados.forEach(t => {
      const zona = t.asiento_zona!
      conteoZonas.set(zona, (conteoZonas.get(zona) || 0) + 1)
    })

    const ordenadas = Array.from(conteoZonas.entries()).sort((a, b) => b[1] - a[1])
    return ordenadas[0] ? ordenadas[0][0] : 'N/A'
  }, [tickets])

  // Listado dinámico de zonas para el selector
  const zonasDisponibles = useMemo(() => {
    const zonas = new Set<string>()
    tickets.forEach(t => {
      if (t.asiento_zona) zonas.add(t.asiento_zona)
    })
    return Array.from(zonas)
  }, [tickets])

  // Filtrado de la tabla en tiempo real
  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      const term = searchTerm.toLowerCase()
      const matchSearch = 
        ticket.nombre?.toLowerCase().includes(term) ||
        ticket.email.toLowerCase().includes(term) ||
        ticket.matricula?.toLowerCase().includes(term) ||
        ticket.empresa?.toLowerCase().includes(term)

      const matchStatus = 
        statusFilter === 'todos' ? true : ticket.estatus_pago === statusFilter

      const matchType = 
        typeFilter === 'todos' ? true : ticket.type === typeFilter

      const matchZone = 
        zoneFilter === 'todas' ? true : ticket.asiento_zona === zoneFilter

      return matchSearch && matchStatus && matchType && matchZone
    })
  }, [tickets, searchTerm, statusFilter, typeFilter, zoneFilter])

  // Restablecer a la página 1 cuando se cambie cualquier filtro
  const [prevSearch, setPrevSearch] = useState(searchTerm)
  const [prevStatus, setPrevStatus] = useState(statusFilter)
  const [prevType, setPrevType] = useState(typeFilter)
  const [prevZone, setPrevZone] = useState(zoneFilter)

  if (
    prevSearch !== searchTerm ||
    prevStatus !== statusFilter ||
    prevType !== typeFilter ||
    prevZone !== zoneFilter
  ) {
    setPrevSearch(searchTerm)
    setPrevStatus(statusFilter)
    setPrevType(typeFilter)
    setPrevZone(zoneFilter)
    setCurrentPage(1)
  }

  // Cálculos de Paginación
  const totalPages = Math.ceil(filteredTickets.length / ITEMS_PER_PAGE) || 1

  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredTickets.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredTickets, currentPage])

  const startRange = filteredTickets.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1
  const endRange = Math.min(currentPage * ITEMS_PER_PAGE, filteredTickets.length)

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto p-4 md:p-0">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-black tracking-tight text-slate-900 dark:text-white text-2xl md:text-3xl">
            <HiOutlineTicket className="inline-block w-6 h-6 sm:w-8 sm:h-8 mr-3 text-amber-600 dark:text-amber-500" />
            Tickets{' '}
            <span className="text-amber-600 dark:text-amber-500">
              Vendidos
            </span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Gestión de emisión de entradas y control de acceso.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchTicketsData(true)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-full text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-xs font-semibold"
          >
            <HiOutlineRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Recargar
          </button>
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-full">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-widest">
              Base de Datos Conectada
            </span>
          </div>
        </div>
      </header>

      {/* Grid de Métricas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="p-6" glowColor="blue">
          <div className="flex items-center gap-3 mb-4 text-blue-600 dark:text-blue-400">
            <HiOutlineTicket className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Boletos Pagados</span>
          </div>
          <span className="text-5xl font-black text-slate-900 dark:text-white">
            {loading ? '—' : totalPagados}
          </span>
          <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-2 font-medium">
            {tickets.length} boletos registrados en total
          </p>
        </GlassCard>

        <GlassCard className="p-6" glowColor="amber">
          <div className="flex items-center gap-3 mb-4 text-amber-600 dark:text-amber-400">
            <HiOutlineChartBar className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Capacidad Utilizada</span>
          </div>
          <span className="text-5xl font-black text-slate-900 dark:text-white">
            {loading ? '—%' : `${capacidadPorcentaje}%`}
          </span>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-2 font-medium">
            {totalPagados} de {TOTAL_AFORO} asientos asignados
          </p>
        </GlassCard>

        <GlassCard className="p-6" glowColor="purple">
          <div className="flex items-center gap-3 mb-4 text-purple-600 dark:text-purple-400">
            <HiOutlineTicket className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Zona Más Vendida</span>
          </div>
          <span className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight block truncate mt-2">
            {loading ? '—' : zonaMasVendida}
          </span>
          <p className="text-[11px] text-purple-600 dark:text-purple-400 mt-2 font-medium">
            Mayor concentración de ventas
          </p>
        </GlassCard>
      </div>

      {/* Tabla de Registros */}
      <GlassCard className="p-6" glowColor="amber">
        {/* Controles de Búsqueda y Filtros */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
          <div className="relative w-full md:w-80">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre, correo, matrícula..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Filtro Tipo */}
            <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="todos" className="dark:bg-slate-800">Todos los Tipos</option>
                <option value="alumno" className="dark:bg-slate-800">Alumnos</option>
                <option value="empresa" className="dark:bg-slate-800">Empresas</option>
              </select>
            </div>

            {/* Filtro Estatus Pago */}
            <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg">
              <HiOutlineFilter className="text-slate-400 w-4 h-4" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="todos" className="dark:bg-slate-800">Todos los Estatus</option>
                <option value="pagado" className="dark:bg-slate-800">Pagados</option>
                <option value="pending" className="dark:bg-slate-800">Pendientes</option>
              </select>
            </div>

            {/* Filtro Zona */}
            <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg">
              <select
                value={zoneFilter}
                onChange={(e) => setZoneFilter(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="todas" className="dark:bg-slate-800">Todas las Zonas</option>
                {zonasDisponibles.map(zona => (
                  <option key={zona} value={zona} className="dark:bg-slate-800">{zona}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tabla de Datos */}
        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                <th className="p-3">Asistente / Tipo</th>
                <th className="p-3">Detalle (Escuela / Empresa)</th>
                <th className="p-3">Ubicación Asiento</th>
                <th className="p-3">Asistencia (Día 1 / Día 2)</th>
                <th className="p-3">Estatus Pago</th>
                <th className="p-3">Fecha Compra</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-light">
                    Cargando tickets desde la base de datos...
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-light">
                    No se encontraron tickets con los criterios seleccionados.
                  </td>
                </tr>
              ) : (
                currentItems.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 space-y-1.5">
                      <div>
                        <h4 className="font-bold text-[#1E2A39] dark:text-slate-100 text-base leading-tight">{ticket.nombre || 'Sin nombre'}</h4>
                        <p className="text-xs text-[#7D7D7D] dark:text-slate-400 font-medium">{ticket.email}</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {/* Badge Tipo Base */}
                        {ticket.type === 'alumno' ? (
                          <span className="px-2.5 py-0.5 bg-[#1E2A39]/10 dark:bg-slate-700/60 text-[#1E2A39] dark:text-slate-200 text-[11px] font-extrabold uppercase rounded-md tracking-wider">
                            <HiOutlineAcademicCap className="w-3 h-3 inline-block mr-1" /> Alumno
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 bg-[#8B1E23]/10 dark:bg-rose-950/40 text-[#8B1E23] dark:text-rose-400 text-[11px] font-extrabold uppercase rounded-md tracking-wider">
                            <HiOutlineOfficeBuilding className="w-3 h-3 inline-block mr-1" /> Empresa
                          </span>
                        )}

                        {/* BADGE DE MODALIDAD DINÁMICO */}
                        {ticket.type === 'alumno' && (
                          <span className={`px-2.5 py-0.5 text-[11px] font-extrabold uppercase rounded-md tracking-wider ${
                            ticket.modalidad === 'mixto'
                              ? 'bg-[#8B1E23]/10 dark:bg-rose-950/40 text-[#8B1E23] dark:text-rose-400'
                              : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-600/10'
                          }`}>
                            {ticket.modalidad === 'mixto' ? 'Mixto' : 'Escolarizado'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      {ticket.type === 'alumno' ? (
                        <>
                          <div className="font-medium text-slate-800 dark:text-slate-200">{ticket.carrera || 'Carrera N/A'}</div>
                          <div className="text-slate-400 dark:text-slate-500 text-[11px]">
                            Matrícula: {ticket.matricula || 'N/A'} {ticket.semestre ? `| ${ticket.semestre}` : ''}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="font-medium text-slate-800 dark:text-slate-200">{ticket.empresa || 'Empresa N/A'}</div>
                          <div className="text-slate-400 dark:text-slate-500 text-[11px]">Tel: {ticket.telefono || 'N/A'}</div>
                        </>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="font-semibold text-amber-800 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 px-2 py-0.5 rounded text-[11px]">
                        {ticket.asiento_zona || 'Sin Zona'}
                      </span>
                      <div className="text-slate-400 dark:text-slate-500 text-[11px] mt-0.5">
                        {ticket.asiento_bloque ? `Bloque: ${ticket.asiento_bloque} ` : ''}
                        {ticket.asiento_fila ? `| Fila: ${ticket.asiento_fila} ` : ''}
                        {ticket.asiento_numero ? `#${ticket.asiento_numero}` : ''}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-medium ${ticket.attended_day1 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400 dark:text-slate-500'}`}>
                          <HiOutlineCheck className="w-3.5 h-3.5" />
                          D1: {ticket.attended_day1 ? 'Asistió' : 'Pendiente'}
                        </span>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-medium ${ticket.attended_day2 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400 dark:text-slate-500'}`}>
                          <HiOutlineCheck className="w-3.5 h-3.5" />
                          D2: {ticket.attended_day2 ? 'Asistió' : 'Pendiente'}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      {ticket.estatus_pago === 'pagado' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded-full font-bold text-[10px]">
                          <HiOutlineCheckCircle className="w-3.5 h-3.5" />
                          Pagado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 px-2 py-0.5 rounded-full font-bold text-[10px]">
                          <HiOutlineClock className="w-3.5 h-3.5" />
                          Pendiente
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                      {ticket.purchased_at ? new Date(ticket.purchased_at).toLocaleDateString('es-MX', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'N/A'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ─── Navegación Estilo DataGrid (10 por página) ─── */}
        {filteredTickets.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-5 text-xs text-slate-600 dark:text-slate-400">
            <div className="font-medium">
              {startRange}-{endRange} de {filteredTickets.length}
            </div>

            <div className="flex items-center gap-1">
              {/* Primera Página |< */}
              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-1.5 rounded hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer disabled:cursor-not-allowed"
                title="Primera página"
              >
                <FirstPageIcon className="w-4 h-4" />
              </button>

              {/* Página Anterior < */}
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer disabled:cursor-not-allowed"
                title="Página anterior"
              >
                <HiChevronLeft className="w-4 h-4" />
              </button>

              {/* Página Siguiente > */}
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer disabled:cursor-not-allowed"
                title="Página siguiente"
              >
                <HiChevronRight className="w-4 h-4" />
              </button>

              {/* Última Página >| */}
              <button
                type="button"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer disabled:cursor-not-allowed"
                title="Última página"
              >
                <LastPageIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  )
}