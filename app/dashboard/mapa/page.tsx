'use client'

import React from 'react'
import { HiOutlineMap, HiOutlineLocationMarker } from 'react-icons/hi'

function GlassCard({ children, className = '', glowColor = 'emerald' }: {
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

export default function MapaPage() {
  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto p-4 md:p-0">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase">
            <HiOutlineMap className="inline-block w-8 h-8 mr-3 text-emerald-400" />
            Mapa del{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
              Evento
            </span>
          </h1>
          <p className="text-gray-500 text-sm font-mono mt-1">GLOBAL // PLANO_INTERACTIVO_DEL_CONGRESO</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">Mapa disponible</span>
        </div>
      </header>

      {/* Map placeholder */}
      <GlassCard className="p-8 min-h-[500px] flex flex-col items-center justify-center" glowColor="emerald">
        <div className="relative mb-6">
          {/* Pulse ring */}
          <div className="absolute -inset-6 bg-emerald-500/10 rounded-full blur-2xl animate-pulse" />
          <div className="relative w-24 h-24 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <HiOutlineMap className="w-12 h-12 text-emerald-400" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">Plano del Congreso IGE 2026</h2>
        <p className="text-gray-400 text-sm max-w-lg text-center mb-8">
          Visualiza la distribución de stands, salas de conferencias, zonas de
          networking y áreas de servicio dentro del evento.
        </p>

        {/* Legend preview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl">
          <div className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <HiOutlineLocationMarker className="w-4 h-4 text-cyan-400" />
            <span className="text-xs text-gray-400">Developer Land</span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <HiOutlineLocationMarker className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-gray-400">Data Land</span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <HiOutlineLocationMarker className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-gray-400">Cloud Land</span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <HiOutlineLocationMarker className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-gray-400">IA Land</span>
          </div>
        </div>

        <div className="mt-8 flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-lg">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-amber-400 text-xs font-mono">Próximamente — Mapa interactivo con Leaflet / Mapbox</span>
        </div>
      </GlassCard>
    </div>
  )
}