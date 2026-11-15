'use client'

import React, { useEffect, useRef } from 'react'
import { HiOutlinePlay } from 'react-icons/hi'
import { GlassCard } from '@/components/ui/GlassCard'

// Configurable YouTube live stream ID
const YOUTUBE_LIVE_ID = 'NGBb_4N4i8U'

export default function EnVivoPage() {
  const chatFrameRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const embedDomain = encodeURIComponent(window.location.hostname)
    if (chatFrameRef.current) {
      chatFrameRef.current.src = `https://www.youtube.com/live_chat?v=${YOUTUBE_LIVE_ID}&embed_domain=${embedDomain}`
    }
  }, [])

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto p-4 md:p-0">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-black tracking-tight text-[#0f172a] dark:text-white text-2xl md:text-3xl">
            <HiOutlinePlay className="inline-block w-8 h-8 mr-3 text-emerald-700" /> Congreso En Vivo
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-light mt-1">GLOBAL // STREAMING_OFICIAL_DEL_CONGRESO</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-emerald-700 text-xs font-bold uppercase tracking-widest">● EN VIVO</span>
        </div>
      </header>

      <section className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <GlassCard className="p-5 md:p-8" glowColor="emerald">
          <div className="mb-6 aspect-video overflow-hidden rounded-2xl shadow-2xl">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${YOUTUBE_LIVE_ID}?autoplay=1&mute=1`}
              title="Transmisión en vivo del Congreso IGE"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-[#0f172a] dark:text-white">Transmisión en Vivo</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-light">
            Sigue en directo todas las conferencias y ponencias del Congreso IGE 2026
          </p>
        </GlassCard>

        <GlassCard className="p-5" glowColor="emerald">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-[#0f172a] dark:text-white">Preguntas y chat</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Envía tus preguntas y participa en la conversación en vivo.
            </p>
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700">
            <iframe
              ref={chatFrameRef}
              title="Chat en vivo de YouTube"
              className="h-[520px] w-full"
            />
          </div>
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            Inicia sesión en YouTube para enviar mensajes.
          </p>
          <a
            href={`https://www.youtube.com/live_chat?v=${YOUTUBE_LIVE_ID}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex text-sm font-semibold text-emerald-700 underline underline-offset-4 hover:text-emerald-800 dark:text-emerald-400"
          >
            Abrir el chat en YouTube
          </a>
        </GlassCard>
      </section>
    </div>
  )
}