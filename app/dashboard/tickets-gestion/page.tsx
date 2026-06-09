'use client'

import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { HiOutlineTicket, HiOutlineUserGroup, HiSearch, HiLockClosed, HiRefresh, HiTerminal, HiCurrencyDollar, HiClock } from 'react-icons/hi'
import { obtenerTicketsPorRol, type TicketGestionado, type MetricasFinancieras } from './actions'

export default function TicketsGestionPage() {
  const [tickets, setTickets] = useState<TicketGestionado[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [debugTrace, setDebugTrace] = useState<string | null>(null)
  
  const [rolVista, setRolVista] = useState<string>('')
  const [esUnidadEspecifica, setEsUnidadEspecifica] = useState(false)
  const [busqueda, setBusqueda] = useState('')

  // Estado para almacenar las métricas dinámicas
  const [metricas, setMetricas] = useState<MetricasFinancieras>({
    totalTicketsEmitidos: 0,
    cantidadPagados: 0,
    cantidadPendientes: 0,
    montoTotalRecaudado: 0,
    montoTotalPendiente: 0,
    montoTotalProyectado: 0
  })

  const cargarTickets = useCallback(async () => {
    setLoading(true)
    setError(null)
    setDebugTrace(null)
    try {
      const res = await obtenerTicketsPorRol()
      if (res.success) {
        setTickets(res.tickets)
        setMetricas(res.metricas)
        setRolVista(res.vista)
        setEsUnidadEspecifica(!!res.unidadEspecifica)
      }
    } catch (err) {
      console.error('🔴 Error capturado en el componente:', err)
      setError(err instanceof Error ? err.message : 'Error de comunicación con el servidor.')
      
      if (err instanceof Error) {
        setDebugTrace(JSON.stringify({
          name: err.name,
          message: err.message,
          stack: err.stack ? err.stack.split('\n').slice(0, 3).join(' | ') : 'No stack trace'
        }, null, 2))
      } else {
        setDebugTrace(JSON.stringify(err, null, 2))
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let activo = true
    
    const ejecutarCargaDiferida = async () => {
      await Promise.resolve()
      if (activo) {
        cargarTickets()
      }
    }

    ejecutarCargaDiferida()

    return () => {
      activo = false
    }
  }, [cargarTickets])

  const ticketsFiltrados = useMemo(() => {
    const termino = busqueda.toLowerCase().trim()
    if (!termino) return tickets

    return tickets.filter(t => 
      t.nombre.toLowerCase().includes(termino) ||
      (t.matricula && t.matricula.toLowerCase().includes(termino)) ||
      t.email.toLowerCase().includes(termino)
    )
  }, [busqueda, tickets])

  // Formateador de moneda auxiliar
  const formatearMoneda = (cantidad: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(cantidad)
  }

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-3 text-white">
        <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
        <p className="text-slate-400 text-xs font-mono uppercase tracking-widest">Cargando registros autorizados...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto my-12 space-y-4 p-4">
        <div className="bg-rose-950/20 border border-rose-900/50 p-6 rounded-2xl text-center space-y-4 text-white">
          <HiLockClosed className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-rose-400 font-black uppercase text-lg tracking-tight">Control de Seguridad</h2>
          <p className="text-slate-300 text-sm font-medium">{error}</p>
          <button 
            onClick={cargarTickets} 
            className="px-4 py-2 bg-rose-900/40 hover:bg-rose-900/60 border border-rose-800 text-rose-200 rounded-xl text-xs uppercase font-bold tracking-wider transition-all"
          >
            Reintentar Solicitud
          </button>
        </div>

        {debugTrace && (
          <div className="bg-slate-950 border border-yellow-600/30 rounded-2xl p-5 font-mono text-[11px] space-y-3 text-yellow-500 shadow-xl">
            <div className="font-bold border-b border-yellow-600/10 pb-2 flex items-center gap-2 text-yellow-400">
              <HiTerminal className="w-4 h-4" /> MONITOR INTERNO DE DIAGNÓSTICO DE DATOS (DEBUG)
            </div>
            <div>
              <span className="text-slate-500 block text-[9px] uppercase font-sans font-bold">Respuesta devuelta por el servidor:</span>
              <pre className="bg-black/60 p-3 rounded-xl text-cyan-400 overflow-x-auto border border-slate-900 mt-1 whitespace-pre-wrap select-all">
                {debugTrace}
              </pre>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 text-white">
      {/* Encabezado Principal */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter uppercase flex items-center gap-2">
            <HiOutlineTicket className="text-purple-500 w-8 h-8" />
            Módulo de <span className="text-purple-500">Tickets Vendidos</span>
          </h1>
          <p className="text-slate-400 text-xs font-medium">
            Panel de supervisión activa. Modo de visualización:{' '}
            <span className="text-purple-400 font-bold uppercase bg-purple-950/40 border border-purple-900/50 px-2 py-0.5 rounded-md text-[11px]">
              {rolVista}
            </span>
            {esUnidadEspecifica ? (
              <span className="text-emerald-400 ml-2 text-[11px] font-bold uppercase">
                • Restringido a tu Unidad Académica
              </span>
            ) : (
              <span className="text-cyan-400 ml-2 text-[11px] font-bold uppercase">
                • Global (Todas las Unidades)
              </span>
            )}
          </p>
        </div>

        <button 
          onClick={cargarTickets}
          className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition-all self-start md:self-center"
          title="Actualizar datos"
        >
          <HiRefresh className="w-5 h-5 text-slate-400 hover:text-white" />
        </button>
      </header>

      {/* NUEVO: Contenedor de Métricas Financieras Inteligentes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Total Recaudado (Pagados) */}
        <div className="bg-[#0f172a] border border-slate-800 p-5 rounded-2xl flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-mono uppercase tracking-wider">Total Recaudado</span>
            <HiCurrencyDollar className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-4">
            <span className="text-3xl font-black text-emerald-400">{formatearMoneda(metricas.montoTotalRecaudado)}</span>
            <span className="text-xs text-slate-500 font-mono">MXN</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-3 block font-mono">
            • {metricas.cantidadPagados} de {metricas.totalTicketsEmitidos} boletos liquidados
          </span>
        </div>

        {/* Card 2: Monto Pendiente (Por Cobrar) */}
        <div className="bg-[#0f172a] border border-slate-800 p-5 rounded-2xl flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-mono uppercase tracking-wider">Monto por Cobrar</span>
            <HiClock className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-4">
            <span className="text-3xl font-black text-amber-500">{formatearMoneda(metricas.montoTotalPendiente)}</span>
            <span className="text-xs text-slate-500 font-mono">MXN</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-3 block font-mono">
            • {metricas.cantidadPendientes} boletos en estatus pendiente
          </span>
        </div>

        {/* Card 3: Proyección Financiera Total */}
        <div className="bg-[#0f172a] border border-slate-800 p-5 rounded-2xl flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-mono uppercase tracking-wider">Total Proyectado</span>
            <HiOutlineTicket className="w-5 h-5 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-4">
            <span className="text-3xl font-black text-purple-400">{formatearMoneda(metricas.montoTotalProyectado)}</span>
            <span className="text-xs text-slate-500 font-mono">MXN</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-3 block font-mono">
            • Estimación total si se pagara el 100%
          </span>
        </div>
      </div>

      {/* Barra de Herramientas y Buscador */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-[#0f172a] p-4 border border-slate-800 rounded-2xl">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
            <HiSearch className="w-5 h-5" />
          </span>
          <input
            type="text"
            placeholder="Buscar por nombre, correo o número de control..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs font-mono text-slate-400 justify-center">
          <HiOutlineUserGroup className="w-4 h-4 text-purple-400" />
          Filtrados: <span className="font-bold text-white">{ticketsFiltrados.length}</span>
        </div>
      </div>

      {/* Tabla de Datos */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950 font-mono text-[11px] uppercase tracking-wider text-slate-400">
                <th className="py-4 px-4 font-bold">Asistente / Correo</th>
                <th className="py-4 px-4 font-bold">Matrícula</th>
                <th className="py-4 px-4 font-bold">Unidad Académica</th>
                <th className="py-4 px-4 font-bold">Asiento Asignado</th>
                <th className="py-4 px-4 font-bold text-center">Tipo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {ticketsFiltrados.length > 0 ? (
                ticketsFiltrados.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-200 uppercase tracking-tight">{ticket.nombre}</div>
                      <div className="text-slate-500 font-mono text-[11px] mt-0.5">{ticket.email}</div>
                    </td>
                    <td className="py-4 px-4 font-mono text-slate-300">
                      {ticket.matricula || <span className="text-slate-600 font-sans text-xs">N/A</span>}
                    </td>
                    <td className="py-4 px-4 text-slate-300 font-medium">
                      {ticket.unidades_academicas?.nombre || <span className="text-slate-600 font-sans text-xs">No especificado</span>}
                    </td>
                    <td className="py-4 px-4">
                      {ticket.asiento_fila && ticket.asiento_fila !== 'N/A' ? (
                        <span className="font-bold text-purple-400 bg-purple-950/30 border border-purple-900/40 px-2 py-1 rounded-lg">
                          {ticket.asiento_zona} ({ticket.asiento_bloque}-{ticket.asiento_fila}-{ticket.asiento_numero})
                        </span>
                      ) : (
                        <span className="text-slate-500 bg-slate-950 px-2 py-1 rounded-lg border border-slate-900 font-mono text-[11px]">
                          GENERAL
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                        ticket.type === 'empresa' 
                          ? 'bg-amber-950/40 border-amber-800 text-amber-400' 
                          : 'bg-blue-950/40 border-blue-800 text-blue-400'
                      }`}>
                        {ticket.type}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500 font-medium">
                    No se encontraron tickets vendidos que coincidan con los criterios de búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}