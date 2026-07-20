'use client'

import React from 'react'
import { HiOutlineTicket, HiOutlineChartBar } from 'react-icons/hi'
import { GlassCard } from '@/components/ui/GlassCard'

export default function TicketsVendidosPage() {
  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto p-4 md:p-0">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
        <h1 className="font-black tracking-tight text-[#0f172a] text-2xl md:text-3xl">
            <HiOutlineTicket className="inline-block w-6 h-6 sm:w-8 sm:h-8 mr-3 text-amber-700" />
            Tickets{' '}
            <span className="text-amber-700">
              Vendidos
            </span>
          </h1>
          
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-amber-700 text-xs font-bold uppercase tracking-widest">Actualizado</span>
        </div>
      </header>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stat Cards */}
        <GlassCard className="p-6" glowColor="blue">
          <div className="flex items-center gap-3 mb-4 text-blue-700">
            <HiOutlineTicket className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-widest text-blue-700/80">Total Emitidos</span>
          </div>
          <span className="text-6xl font-black text-[#0f172a]">—</span>
          <p className="text-[10px] text-blue-700 mt-2 font-light">Cargando desde DB...</p>
        </GlassCard>

        <GlassCard className="p-6" glowColor="amber">
          <div className="flex items-center gap-3 mb-4 text-amber-700">
            <HiOutlineChartBar className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-widest text-amber-700/80">Capacidad Utilizada</span>
          </div>
          <span className="text-6xl font-black text-[#0f172a]">—%</span>
          <p className="text-[10px] text-amber-700 mt-2 font-light">Evento — Aforo total</p>
        </GlassCard>

        <GlassCard className="p-6" glowColor="purple">
          <div className="flex items-center gap-3 mb-4 text-purple-700">
            <HiOutlineTicket className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest text-purple-700/80">Zona Más Vendida</span>
          </div>
          <span className="text-2xl font-black text-[#0f172a] uppercase tracking-tight block truncate">—</span>
          <p className="text-[10px] text-purple-700 mt-2 font-light">Esperando datos...</p>
        </GlassCard>
      </div>

      {/* Main Content Area */}
      <GlassCard className="p-8" glowColor="amber">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <HiOutlineChartBar className="w-16 h-16 text-amber-200 mb-6" />
          <h2 className="text-2xl font-bold text-[#0f172a] mb-2">Panel de Tickets Vendidos</h2>
          <p className="text-slate-500 max-w-md font-light">
            Visualiza estadísticas detalladas de venta de boletos, zonas más populares
            y capacidad restante del evento.
          </p>
          <div className="mt-8 flex items-center gap-3 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-amber-700 text-xs font-light">Próximamente — Integración con DB de ventas</span>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}