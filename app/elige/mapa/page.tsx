'use client'

import React from 'react'
import { HiOutlineMap, HiOutlineLocationMarker } from 'react-icons/hi'
import { GlassCard } from '@/components/ui/GlassCard'

export default function MapaPage() {
  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto p-4 md:p-0">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-black tracking-tight text-[#0f172a] dark:text-white text-2xl md:text-3xl">
            <HiOutlineMap className="inline-block w-8 h-8 mr-3 text-emerald-700" />
            Mapa del{' '}
            <span className="text-emerald-700">
              Evento
            </span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-light mt-1">GLOBAL // PLANO_INTERACTIVO_DEL_CONGRESO</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-emerald-700 text-xs font-bold uppercase tracking-widest">Mapa disponible</span>
        </div>
      </header>

      {/* Map placeholder */}
      <GlassCard className="p-8 min-h-[500px] flex flex-col items-center justify-center" glowColor="emerald">
        <div className="relative mb-6">
          {/* Pulse ring */}
          <div className="absolute -inset-6 bg-emerald-100 rounded-full blur-2xl animate-pulse" />
          <div className="relative w-24 h-24 rounded-[24px] bg-emerald-50 border border-emerald-200 flex items-center justify-center">
            <HiOutlineMap className="w-12 h-12 text-emerald-700" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-[#0f172a] dark:text-white mb-2">Plano del Congreso IGE 2026</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-lg text-center mb-8 font-light">
          Visualiza la distribución de stands, salas de conferencias, zonas de
          networking y áreas de servicio dentro del evento.
        </p>

        {/* Legend preview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl">
          <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <HiOutlineLocationMarker className="w-4 h-4 text-cyan-700" />
            <span className="text-xs text-slate-500 dark:text-slate-400 font-light">Developer Land</span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <HiOutlineLocationMarker className="w-4 h-4 text-purple-700" />
            <span className="text-xs text-slate-500 dark:text-slate-400 font-light">Data Land</span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <HiOutlineLocationMarker className="w-4 h-4 text-amber-700" />
            <span className="text-xs text-slate-500 dark:text-slate-400 font-light">Cloud Land</span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <HiOutlineLocationMarker className="w-4 h-4 text-emerald-700" />
            <span className="text-xs text-slate-500 dark:text-slate-400 font-light">IA Land</span>
          </div>
        </div>

        <div className="mt-8 flex items-center gap-3 px-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-amber-700 text-xs font-light">Próximamente — Mapa interactivo con Leaflet / Mapbox</span>
        </div>
      </GlassCard>
    </div>
  )
}