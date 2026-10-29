'use client'

import React from 'react'
import { HiOutlinePlay } from 'react-icons/hi'
import { GlassCard } from '@/components/ui/GlassCard'

// Configurable YouTube live stream ID
const YOUTUBE_LIVE_ID = 'TU_VIDEO_ID'

export default function MapaPage() {
  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto p-4 md:p-0">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-black tracking-tight text-[#0f172a] dark:text-white text-2xl md:text-3xl">
            <HiOutlinePlay className="inline-block w-8 h-8 mr-3 text-emerald-700" /> Congreso En Vivo
            <span className="text-emerald-700">
              Evento
            </span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-light mt-1">GLOBAL // STREAMING_OFICIAL_DEL_CONGRESO</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-emerald-700 text-xs font-bold uppercase tracking-widest">● EN VIVO</span>
        </div>
      </header>

      {/* Map placeholder */}
      <GlassCard className="p-8 min-h-[500px] flex flex-col items-center justify-center" glowColor="emerald">
        <div className="relative mb-6">
          <iframe
            width="560"
            height="315"
            src={`https://www.youtube-nocookie.com/embed/${YOUTUBE_LIVE_ID}?autoplay=1&mute=1`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="aspect-video w-full rounded-2xl overflow-hidden shadow-2xl"
          />
        </div>

        <h2 className="text-2xl font-bold text-[#0f172a] dark:text-white mb-2">Transmisión en Vivo</h2>
        <p className="text-slate-500 dark:text-slate-400 data-sm text-center mb-8 font-light">
          Sigue en directo todas las conferencias y ponencias del Congreso IGE 2026
        </p>

        
      </GlassCard>
    </div>
  )
}