'use client'

import React from 'react'
import { HiOutlineTicket, HiOutlineViewGrid } from 'react-icons/hi'

function GlassCard({ children, className = '', glowColor = 'cyan' }: {
  children: React.ReactNode
  className?: string
  glowColor?: 'blue' | 'purple' | 'amber' | 'cyan' | 'emerald'
}) {
  const glowStyles: Record<string, string> = {
    blue: 'border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.15)]',
    purple: 'border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.15)]',
    amber: 'border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.15)]',
    cyan: 'border-cyan-500/30 shadow-[0_0_20px_rgba(34,211,238,0.15)]',
    emerald: 'border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.15)]',
  }

  return (
    <div className={`relative rounded-2xl border bg-slate-900/40 backdrop-blur-xl overflow-hidden transition-all duration-300 ${glowStyles[glowColor]} ${className}`}>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      {children}
    </div>
  )
}

export default function TicketsGestionPage() {
  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto p-4 md:p-0">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase">
            <HiOutlineTicket className="inline-block w-8 h-8 mr-3 text-cyan-400" />
            Gestión de{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Tickets
            </span>
          </h1>
          <p className="text-gray-500 text-sm font-mono mt-1">ENCARGADO // CONTROL_DE_TICKETS_Y_REGISTROS</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full">
          <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
          <span className="text-cyan-400 text-xs font-bold uppercase tracking-widest">Tickets activos</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="p-6" glowColor="blue">
          <div className="flex items-center gap-3 mb-4 text-blue-400">
            <HiOutlineTicket className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest text-blue-400/80">Registrados Hoy</span>
          </div>
          <span className="text-6xl font-black text-white drop-shadow-[0_0_15px_rgba(59,130,246,0.4)]">—</span>
          <p className="text-[10px] text-blue-400 mt-2 font-mono">Escaneos del día</p>
        </GlassCard>

        <GlassCard className="p-6" glowColor="emerald">
          <div className="flex items-center gap-3 mb-4 text-emerald-400">
            <HiOutlineTicket className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400/80">Pendientes</span>
          </div>
          <span className="text-6xl font-black text-white drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]">—</span>
          <p className="text-[10px] text-emerald-400 mt-2 font-mono">Por validar</p>
        </GlassCard>

        <GlassCard className="p-6" glowColor="amber">
          <div className="flex items-center gap-3 mb-4 text-amber-400">
            <HiOutlineTicket className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400/80">Total UA</span>
          </div>
          <span className="text-6xl font-black text-white drop-shadow-[0_0_15px_rgba(245,158,11,0.4)]">—</span>
          <p className="text-[10px] text-amber-400 mt-2 font-mono">Tickets de tu UA</p>
        </GlassCard>
      </div>

      <GlassCard className="p-8" glowColor="cyan">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <HiOutlineViewGrid className="w-16 h-16 text-cyan-500/30 mb-6" />
          <h2 className="text-2xl font-bold text-white mb-2">Panel de Tickets</h2>
          <p className="text-gray-400 max-w-md">
            Administra y valida los tickets de los asistentes registrados en tu
            Unidad Académica. Escanea códigos QR y gestiona ingresos.
          </p>
          <div className="mt-8 flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-amber-400 text-xs font-mono">Próximamente — Escáner y validación en vivo</span>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}