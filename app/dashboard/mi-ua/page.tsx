'use client'

import React from 'react'
import { HiOutlineOfficeBuilding, HiOutlineViewGrid } from 'react-icons/hi'

// ─── GlassCard Component ─────────────────────────────────────────────────────
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

export default function MiUAPage() {
  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto p-4 md:p-0">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase">
            <HiOutlineOfficeBuilding className="inline-block w-8 h-8 mr-3 text-cyan-400" />
            Lista de{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              UA Encargada
            </span>
          </h1>
          <p className="text-gray-500 text-sm font-mono mt-1">ENCARGADO // MI_UNIDAD_ACADÉMICA_ASIGNADA</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full">
          <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
          <span className="text-cyan-400 text-xs font-bold uppercase tracking-widest">UA Asignada</span>
        </div>
      </header>

      {/* Content */}
      <GlassCard className="p-8" glowColor="cyan">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <HiOutlineOfficeBuilding className="w-16 h-16 text-cyan-500/30 mb-6" />
          <h2 className="text-2xl font-bold text-white mb-2">Mi Unidad Académica</h2>
          <p className="text-gray-400 max-w-md">
            Visualiza la información y el listado de asistentes registrados en la
            Unidad Académica que tienes asignada.
          </p>
          <div className="mt-8 flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-amber-400 text-xs font-mono">Próximamente — Datos de tu UA</span>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}