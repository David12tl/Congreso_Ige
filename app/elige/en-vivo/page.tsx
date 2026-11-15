'use client'

import React, { useEffect, useRef, useState } from 'react'
import { HiOutlinePlay } from 'react-icons/hi'
import { GlassCard } from '@/components/ui/GlassCard'

export default function EnVivoPage() {
  const chatFrameRef = useRef<HTMLIFrameElement>(null)
  const [youtubeVideoId, setYoutubeVideoId] = useState<string | null>(null)
  const [streamError, setStreamError] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadStreamConfig = async () => {
      try {
        const response = await fetch('/api/live-stream', { cache: 'no-store' })
        const result: { youtubeVideoId?: unknown; error?: unknown } = await response.json()

        if (!response.ok) {
          throw new Error(typeof result.error === 'string' ? result.error : 'No se pudo cargar la transmisión.')
        }
        if (typeof result.youtubeVideoId !== 'string') {
          throw new Error('La configuración de transmisión no tiene un formato válido.')
        }

        if (isMounted) setYoutubeVideoId(result.youtubeVideoId)
      } catch (error) {
        if (isMounted) {
          setStreamError(error instanceof Error ? error.message : 'No se pudo cargar la transmisión.')
        }
      }
    }

    void loadStreamConfig()
    return () => { isMounted = false }
  }, [])

  useEffect(() => {
    if (!youtubeVideoId || !chatFrameRef.current) return

    const embedDomain = encodeURIComponent(window.location.hostname)
    chatFrameRef.current.src = `https://www.youtube.com/live_chat?v=${youtubeVideoId}&embed_domain=${embedDomain}`
  }, [youtubeVideoId])

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
            {youtubeVideoId ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${youtubeVideoId}?autoplay=1&mute=1`}
                title="Transmisión en vivo del Congreso IGE"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-slate-950 px-6 text-center text-sm text-white">
                {streamError || 'Cargando transmisión...'}
              </div>
            )}
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
            {youtubeVideoId ? (
              <iframe
                ref={chatFrameRef}
                title="Chat en vivo de YouTube"
                className="h-[520px] w-full"
              />
            ) : (
              <div className="flex h-[520px] items-center justify-center px-6 text-center text-sm text-slate-500">
                {streamError || 'Cargando chat...'}
              </div>
            )}
          </div>
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            Inicia sesión en YouTube para enviar mensajes.
          </p>
          {youtubeVideoId && (
            <a
              href={`https://www.youtube.com/live_chat?v=${youtubeVideoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex text-sm font-semibold text-emerald-700 underline underline-offset-4 hover:text-emerald-800 dark:text-emerald-400"
            >
              Abrir el chat en YouTube
            </a>
          )}
        </GlassCard>
      </section>
    </div>
  )
}