'use client'

import React, { useEffect, useState } from 'react'
import { HiOutlineDocumentReport, HiOutlineChartBar, HiOutlineTrendingUp, HiOutlineTicket, HiOutlineUserGroup, HiOutlineBriefcase } from 'react-icons/hi'
import { GlassCard } from '@/components/ui/GlassCard'
import { getReportesData, UAMetrica, ResumenGlobal } from './actions'

export default function ReportesPage() {
  const [metricasUA, setMetricasUA] = useState<UAMetrica[]>([])
  const [global, setGlobal] = useState<ResumenGlobal | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function fetchData() {
      const res = await getReportesData()
      if (isMounted) {
        setMetricasUA(res.uas)
        setGlobal(res.global)
        setLoading(false)
      }
    }

    fetchData()

    return () => {
      isMounted = false
    }
  }, [])

  if (loading || !global) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-emerald-200 border-t-emerald-500 animate-spin" />
        <p className="text-slate-500 font-light text-xs uppercase tracking-widest">Calculando métricas en DB...</p>
      </div>
    )
  }

  // Paleta de colores reutilizables para las barras de la gráfica
  const coloresBarras = ['bg-cyan-500', 'bg-purple-500', 'bg-amber-500', 'bg-emerald-500', 'bg-pink-500', 'bg-blue-500']

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto p-4 md:p-0">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-black tracking-tight text-[#0f172a] text-2xl md:text-3xl">
            <HiOutlineDocumentReport className="inline-block w-8 h-8 mr-3 text-emerald-700" />
            Centro de{' '}
            <span className="text-emerald-700">
              Reportes
            </span>
          </h1>
          <p className="text-slate-500 text-sm font-light mt-1">ADMIN // ANALÍTICA_Y_EXPORTACIÓN_DE_DATOS</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-emerald-700 text-xs font-bold uppercase tracking-widest">Sincronizado con DB</span>
        </div>
      </header>

      {/* Grid Superior: Tarjetas de Exportación */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-6" glowColor="blue">
          <div className="flex items-center gap-3 mb-4 text-blue-700">
            <HiOutlineDocumentReport className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest text-blue-700/80">Reporte General</span>
          </div>
          <p className="text-slate-500 text-sm mb-4 font-light">Exporta el listado completo de asistentes, tickets y métricas del evento.</p>
          <button className="px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-blue-100 transition-all">
            Generar PDF
          </button>
        </GlassCard>

        <GlassCard className="p-6" glowColor="purple">
          <div className="flex items-center gap-3 mb-4 text-purple-700">
            <HiOutlineChartBar className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest text-purple-700/80">Reporte por UA</span>
          </div>
          <p className="text-slate-500 text-sm mb-4 font-light">Estadísticas detalladas de cada Unidad Académica y su rendimiento.</p>
          <button className="px-4 py-2 bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-purple-100 transition-all">
            Generar CSV
          </button>
        </GlassCard>
      </div>

      {/* Secciones de Gráficas Reales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Gráfica 1: Distribución Real por UA */}
        <GlassCard className="p-6 lg:col-span-2" glowColor="emerald">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <HiOutlineTrendingUp className="w-5 h-5 text-emerald-700" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#0f172a]">Tickets por Unidad Académica (DB)</h3>
            </div>
            <span className="text-[10px] font-light text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">Real-Time</span>
          </div>

          <div className="space-y-5">
            {metricasUA.length === 0 ? (
              <p className="text-xs text-slate-500 font-light py-8 text-center">No hay registros de tickets comprados en la base de datos.</p>
            ) : (
              metricasUA.map((item, index) => (
                <div key={item.nombre} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-light">
                    <span className="text-slate-700 font-light">{item.nombre}</span>
                    <span className="text-slate-500">{item.totalTickets} {item.totalTickets === 1 ? 'ticket' : 'tickets'} ({item.porcentaje}%)</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 border border-slate-200 rounded-full">
                    <div 
                      className={`h-full ${coloresBarras[index % coloresBarras.length]} rounded-full transition-all duration-500`}
                      style={{ width: `${item.porcentaje}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>

        {/* Gráfica 2: Distribución de Segmentos Alumno vs Empresa */}
        <GlassCard className="p-6" glowColor="cyan">
          <div className="flex items-center gap-2 mb-6">
            <HiOutlineTicket className="w-5 h-5 text-cyan-700" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#0f172a]">Segmentación por Tipo</h3>
          </div>

          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center py-2">
              <div className="w-28 h-28 rounded-full border-4 border-dashed border-cyan-200 flex flex-col items-center justify-center bg-cyan-50">
                <span className="text-2xl font-black text-[#0f172a]">{global.totalTickets}</span>
                <span className="text-[9px] font-light text-slate-500 uppercase tracking-widest">Total Global</span>
              </div>
            </div>

            {/* Barra Combinada según los tipos del constraint check (alumno / empresa) */}
            <div className="space-y-4">
              <div className="w-full h-4 bg-slate-100 border border-slate-200 rounded-md flex overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500" style={{ width: `${global.porcentajeAlumnos}%` }} />
                <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500" style={{ width: `${global.porcentajeEmpresas}%` }} />
              </div>
              
              {/* Desglose Detallado */}
              <div className="space-y-2 text-xs font-light pt-2">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <div className="flex items-center gap-2">
                    <HiOutlineUserGroup className="text-cyan-700 w-4 h-4" />
                    <span className="text-slate-700 font-light">Alumnos</span>
                  </div>
                  <span className="text-[#0f172a] font-bold">{global.totalAlumnos} ({global.porcentajeAlumnos}%)</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HiOutlineBriefcase className="text-purple-700 w-4 h-4" />
                    <span className="text-slate-700 font-light">Empresas</span>
                  </div>
                  <span className="text-[#0f172a] font-bold">{global.totalEmpresas} ({global.porcentajeEmpresas}%)</span>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Footer con Métricas Rápidas */}
      <GlassCard className="p-6" glowColor="amber">
        <p className="text-slate-500 text-sm font-light">
          Los datos reflejados se leen dinámicamente de la tabla <code className="text-amber-700 font-light bg-amber-50 px-1 py-0.5 rounded border border-amber-200">public.tickets</code> filtrando en tiempo real por los constraints de validación estructural.
        </p>
      </GlassCard>
    </div>
  )
}