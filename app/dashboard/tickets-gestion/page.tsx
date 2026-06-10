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
        <div className="w-10 h-10 border-4 border-congreso-blue/30 border-t-congreso-blue rounded-full animate-spin" />
        <p className="text-congreso-greyMed text-xs font-mono uppercase tracking-widest">Cargando registros autorizados...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full max-w-2xl mx-auto my-12 space-y-4 px-4">
        <div className="bg-congreso-greyDark/20 border border-red-900/50 p-6 rounded-2xl text-center space-y-4 text-white">
          <HiLockClosed className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-congreso-orange font-black uppercase text-lg tracking-tight">Control de Seguridad</h2>
          <p className="text-congreso-greyLight text-sm font-medium">{error}</p>
          <button 
            onClick={cargarTickets} 
            className="px-4 py-2 bg-congreso-greyDark/40 hover:bg-congreso-greyDark/60 border border-congreso-greyDark text-congreso-greyLight rounded-xl text-xs uppercase font-bold tracking-wider transition-all"
          >
            Reintentar Solicitud
          </button>
        </div>

        {debugTrace && (
          <div className="bg-congreso-bgDark border border-congreso-yellow/30 rounded-2xl p-5 font-mono text-[11px] space-y-3 text-congreso-yellow shadow-xl">
            <div className="font-bold border-b border-congreso-yellow/10 pb-2 flex items-center gap-2 text-congreso-yellow">
              <HiTerminal className="w-4 h-4" /> MONITOR INTERNO DE DIAGNÓSTICO DE DATOS (DEBUG)
            </div>
            <div>
              <span className="text-congreso-greyMed block text-[9px] uppercase font-sans font-bold">Respuesta devuelta por el servidor:</span>
              <pre className="bg-black/60 p-3 rounded-xl text-congreso-teal overflow-x-auto border border-congreso-greyDark mt-1 whitespace-pre-wrap select-all">
                {debugTrace}
              </pre>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Encabezado Principal */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-congreso-greyDark pb-5">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tighter uppercase flex items-center gap-2">
            <HiOutlineTicket className="text-congreso-blue w-6 h-6 sm:w-8 sm:h-8" />
            Módulo de <span className="text-congreso-blue">Tickets Vendidos</span>
          </h1>
          <p className="text-congreso-greyMed text-[11px] sm:text-xs font-medium">
            Panel de supervisión activa. Modo de visualización:{' '}
            <span className="text-congreso-teal font-bold uppercase bg-congreso-teal/10 border border-congreso-teal/30 px-2 py-0.5 rounded-md text-[11px]">
              {rolVista}
            </span>
            {esUnidadEspecifica ? (
              <span className="text-congreso-emerald ml-2 text-[11px] font-bold uppercase">
                • Restringido a tu Unidad Académica
              </span>
            ) : (
              <span className="text-congreso-teal ml-2 text-[11px] font-bold uppercase">
                • Global (Todas las Unidades)
              </span>
            )}
          </p>
        </div>

        <button 
          onClick={cargarTickets}
          className="p-2.5 bg-congreso-bgDark hover:bg-congreso-greyDark border border-congreso-greyDark rounded-xl transition-all self-start md:self-center"
          title="Actualizar datos"
        >
          <HiRefresh className="w-5 h-5 text-congreso-greyMed hover:text-white" />
        </button>
      </header>

      {/* Contenedor de Métricas Financieras Inteligentes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 1: Total Recaudado (Pagados) */}
        <div className="bg-congreso-bgDark border border-congreso-greyDark p-5 rounded-2xl flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-congreso-greyMed text-xs font-mono uppercase tracking-wider">Total Recaudado</span>
            <HiCurrencyDollar className="w-5 h-5 text-congreso-emerald" />
          </div>
          <div className="flex items-baseline gap-2 mt-4">
            <span className="text-2xl sm:text-3xl font-black text-congreso-emerald">{formatearMoneda(metricas.montoTotalRecaudado)}</span>
            <span className="text-xs text-congreso-greyMed font-mono">MXN</span>
          </div>
          <span className="text-[10px] text-congreso-greyMed mt-3 block font-mono">
            • {metricas.cantidadPagados} de {metricas.totalTicketsEmitidos} boletos liquidados
          </span>
        </div>

        {/* Card 2: Monto Pendiente (Por Cobrar) */}
        <div className="bg-congreso-bgDark border border-congreso-greyDark p-5 rounded-2xl flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-congreso-greyMed text-xs font-mono uppercase tracking-wider">Monto por Cobrar</span>
            <HiClock className="w-5 h-5 text-congreso-orange" />
          </div>
          <div className="flex items-baseline gap-2 mt-4">
            <span className="text-2xl sm:text-3xl font-black text-congreso-orange">{formatearMoneda(metricas.montoTotalPendiente)}</span>
            <span className="text-xs text-congreso-greyMed font-mono">MXN</span>
          </div>
          <span className="text-[10px] text-congreso-greyMed mt-3 block font-mono">
            • {metricas.cantidadPendientes} boletos en estatus pendiente
          </span>
        </div>

        {/* Card 3: Proyección Financiera Total */}
        <div className="bg-congreso-bgDark border border-congreso-greyDark p-5 rounded-2xl flex flex-col justify-between shadow-lg sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-congreso-greyMed text-xs font-mono uppercase tracking-wider">Total Proyectado</span>
            <HiOutlineTicket className="w-5 h-5 text-congreso-blue" />
          </div>
          <div className="flex items-baseline gap-2 mt-4">
            <span className="text-2xl sm:text-3xl font-black text-congreso-blue">{formatearMoneda(metricas.montoTotalProyectado)}</span>
            <span className="text-xs text-congreso-greyMed font-mono">MXN</span>
          </div>
          <span className="text-[10px] text-congreso-greyMed mt-3 block font-mono">
            • Estimación total si se pagara el 100%
          </span>
        </div>
      </div>

      {/* Barra de Herramientas y Buscador */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-congreso-bgDark p-4 border border-congreso-greyDark rounded-2xl">
        <div className="relative flex-1 w-full sm:max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-congreso-greyMed">
            <HiSearch className="w-5 h-5" />
          </span>
          <input
            type="text"
            placeholder="Buscar por nombre, correo o número de control..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-congreso-dark border border-congreso-greyDark rounded-xl pl-10 pr-4 py-2.5 text-sm text-congreso-greyLight placeholder-congreso-greyMed focus:outline-none focus:border-congreso-blue/50 focus:ring-1 focus:ring-congreso-blue/50 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 bg-congreso-dark border border-congreso-greyDark px-3 py-2 rounded-xl text-xs font-mono text-congreso-greyMed justify-center sm:justify-start shrink-0">
          <HiOutlineUserGroup className="w-4 h-4 text-congreso-blue" />
          Filtrados: <span className="font-bold text-white">{ticketsFiltrados.length}</span>
        </div>
      </div>

      {/* Tabla de Datos - vista escritorio */}
      <div className="bg-congreso-bgDark border border-congreso-greyDark rounded-2xl overflow-hidden shadow-xl hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-congreso-greyDark bg-congreso-dark font-mono text-[11px] uppercase tracking-wider text-congreso-greyMed">
                <th className="py-4 px-4 font-bold">Asistente / Correo</th>
                <th className="py-4 px-4 font-bold">Matrícula</th>
                <th className="py-4 px-4 font-bold">Unidad Académica</th>
                <th className="py-4 px-4 font-bold">Asiento Asignado</th>
                <th className="py-4 px-4 font-bold text-center">Tipo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-congreso-greyDark/60 text-xs">
              {ticketsFiltrados.length > 0 ? (
                ticketsFiltrados.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-congreso-greyDark/20 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-bold text-congreso-greyLight uppercase tracking-tight">{ticket.nombre}</div>
                      <div className="text-congreso-greyMed font-mono text-[11px] mt-0.5">{ticket.email}</div>
                    </td>
                    <td className="py-4 px-4 font-mono text-congreso-greyLight">
                      {ticket.matricula || <span className="text-congreso-greyMed font-sans text-xs">N/A</span>}
                    </td>
                    <td className="py-4 px-4 text-congreso-greyLight font-medium">
                      {ticket.unidades_academicas?.nombre || <span className="text-congreso-greyMed font-sans text-xs">No especificado</span>}
                    </td>
                    <td className="py-4 px-4">
                      {ticket.asiento_fila && ticket.asiento_fila !== 'N/A' ? (
                        <span className="font-bold text-congreso-teal bg-congreso-teal/10 border border-congreso-teal/30 px-2 py-1 rounded-lg">
                          {ticket.asiento_zona} ({ticket.asiento_bloque}-{ticket.asiento_fila}-{ticket.asiento_numero})
                        </span>
                      ) : (
                        <span className="text-congreso-greyMed bg-congreso-dark px-2 py-1 rounded-lg border border-congreso-greyDark font-mono text-[11px]">
                          GENERAL
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                        ticket.type === 'empresa' 
                          ? 'bg-congreso-orange/10 border-congreso-orange/50 text-congreso-orange' 
                          : 'bg-congreso-blue/10 border-congreso-blue/50 text-congreso-blue'
                      }`}>
                        {ticket.type}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-congreso-greyMed font-medium">
                    No se encontraron tickets vendidos que coincidan con los criterios de búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vista móvil: Tarjetas en lugar de tabla */}
      <div className="block md:hidden space-y-3">
        {ticketsFiltrados.length > 0 ? (
          ticketsFiltrados.map((ticket) => (
            <div key={ticket.id} className="bg-congreso-bgDark border border-congreso-greyDark rounded-2xl p-4 space-y-3 shadow-lg">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-congreso-greyLight text-sm uppercase tracking-tight truncate">{ticket.nombre}</p>
                  <p className="text-congreso-greyMed font-mono text-[11px] truncate">{ticket.email}</p>
                </div>
                <span className={`shrink-0 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                  ticket.type === 'empresa' 
                    ? 'bg-congreso-orange/10 border-congreso-orange/50 text-congreso-orange' 
                    : 'bg-congreso-blue/10 border-congreso-blue/50 text-congreso-blue'
                }`}>
                  {ticket.type}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-congreso-greyMed font-mono text-[10px] uppercase tracking-wider block">Matrícula</span>
                  <span className="text-congreso-greyLight font-medium">{ticket.matricula || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-congreso-greyMed font-mono text-[10px] uppercase tracking-wider block">Unidad</span>
                  <span className="text-congreso-greyLight font-medium truncate block">{ticket.unidades_academicas?.nombre || 'No especificado'}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-congreso-greyDark/50">
                {ticket.asiento_fila && ticket.asiento_fila !== 'N/A' ? (
                  <span className="text-congreso-teal bg-congreso-teal/10 border border-congreso-teal/30 px-2 py-1 rounded-lg text-xs font-bold">
                    {ticket.asiento_zona} ({ticket.asiento_bloque}-{ticket.asiento_fila}-{ticket.asiento_numero})
                  </span>
                ) : (
                  <span className="text-congreso-greyMed bg-congreso-dark px-2 py-1 rounded-lg border border-congreso-greyDark font-mono text-[11px]">
                    GENERAL
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="py-12 text-center text-congreso-greyMed font-medium">
            No se encontraron tickets vendidos que coincidan con los criterios de búsqueda.
          </div>
        )}
      </div>
    </div>
  )
}