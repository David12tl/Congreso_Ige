'use client'

import React from 'react'
import { HiOutlineTicket, HiOutlineChartBar } from 'react-icons/hi'

// ─── GlassCard Component ─────────────────────────────────────────────────────
function GlassCard({ children, className = '', glowColor = 'amber' }: {
  children: React.ReactNode
  className?: string
  glowColor?: 'blue' | 'purple' | 'amber' | 'cyan' | 'emerald'
}) {
  const glowStyles: Record<string, string> = {
    blue: 'border-congreso-blue/30 shadow-[0_0_20px_rgba(13,71,161,0.15)]',
    purple: 'border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.15)]',
    amber: 'border-congreso-orange/30 shadow-[0_0_20px_rgba(255,122,0,0.15)]',
    cyan: 'border-congreso-teal/30 shadow-[0_0_20px_rgba(0,151,167,0.15)]',
    emerald: 'border-congreso-emerald/30 shadow-[0_0_20px_rgba(0,184,148,0.15)]',
  }

  return (
    <div className={`relative rounded-2xl border bg-congreso-bgDark/60 backdrop-blur-xl overflow-hidden transition-all duration-300 ${glowStyles[glowColor]} ${className}`}>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      {children}
    </div>
  )
}

export default function TicketsVendidosPage() {
  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto p-4 md:p-0">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
      <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tighter uppercase">
            <HiOutlineTicket className="inline-block w-6 h-6 sm:w-8 sm:h-8 mr-3 text-congreso-orange" />
            Tickets{' '}
            <span className="bg-gradient-to-r from-congreso-orange to-congreso-yellow bg-clip-text text-transparent">
              Vendidos
            </span>
          </h1>
          <p className="text-gray-500 text-sm font-mono mt-1">ADMIN // MÉTRICAS_DE_VENTAS_Y_EMISIÓN</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-congreso-orange/10 border border-congreso-orange/30 rounded-full">
          <div className="w-2 h-2 rounded-full bg-congreso-orange animate-pulse" />
          <span className="text-congreso-orange text-xs font-bold uppercase tracking-widest">Actualizado</span>
        </div>
      </header>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stat Cards */}
        <GlassCard className="p-6" glowColor="blue">
          <div className="flex items-center gap-3 mb-4 text-blue-400">
            <HiOutlineTicket className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-widest text-congreso-blue/80">Total Emitidos</span>
          </div>
          <span className="text-6xl font-black text-white drop-shadow-[0_0_15px_rgba(59,130,246,0.4)]">—</span>
          <p className="text-[10px] text-blue-400 mt-2 font-mono">Cargando desde DB...</p>
        </GlassCard>

        <GlassCard className="p-6" glowColor="amber">
          <div className="flex items-center gap-3 mb-4 text-amber-400">
            <HiOutlineChartBar className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-widest text-congreso-orange/80">Capacidad Utilizada</span>
          </div>
          <span className="text-6xl font-black text-white drop-shadow-[0_0_15px_rgba(245,158,11,0.4)]">—%</span>
          <p className="text-[10px] text-amber-400 mt-2 font-mono">Evento — Aforo total</p>
        </GlassCard>

        <GlassCard className="p-6" glowColor="purple">
          <div className="flex items-center gap-3 mb-4 text-purple-400">
            <HiOutlineTicket className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest text-purple-400/80">Zona Más Vendida</span>
          </div>
          <span className="text-2xl font-black text-white drop-shadow-[0_0_15px_rgba(168,85,247,0.4)] uppercase tracking-tighter block truncate">—</span>
          <p className="text-[10px] text-purple-400 mt-2 font-mono">Esperando datos...</p>
        </GlassCard>
      </div>

      {/* Main Content Area */}
      <GlassCard className="p-8" glowColor="amber">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <HiOutlineChartBar className="w-16 h-16 text-amber-500/30 mb-6" />
          <h2 className="text-2xl font-bold text-white mb-2">Panel de Tickets Vendidos</h2>
          <p className="text-gray-400 max-w-md">
            Visualiza estadísticas detalladas de venta de boletos, zonas más populares
            y capacidad restante del evento.
          </p>
          <div className="mt-8 flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-amber-400 text-xs font-mono">Próximamente — Integración con DB de ventas</span>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}