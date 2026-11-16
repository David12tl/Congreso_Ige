'use client'

import React, { useEffect, useRef, useState } from 'react'
import { HiOutlinePlay } from 'react-icons/hi'
import { GlassCard } from '@/components/ui/GlassCard'
import { isLiveStreamConfig, type LiveStreamConfig } from '@/types/live-stream'

function getErrorMessage(value: unknown, fallback: string): string {
  if (typeof value === 'object' && value !== null && 'error' in value && typeof value.error === 'string') {
    return value.error
  }
  return fallback
}

export default function EnVivoPage() {
  const chatFrameRef = useRef<HTMLIFrameElement>(null)
  const [streamState, setStreamState] = useState<LiveStreamConfig | null>(null)
  const [streamError, setStreamError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const fetchStreamConfig = async () => {
      try {
        const response = await fetch('/api/stream', { cache: 'no-store' })
        const result: unknown = await response.json()

        if (!response.ok) {
          throw new Error(getErrorMessage(result, 'No se pudo cargar la transmisión.'))
        }
        if (!isLiveStreamConfig(result)) {
          throw new Error('La configuración de transmisión no tiene un formato válido.')
        }

        if (isMounted) {
          setStreamState(result)
          setStreamError('')
          setIsLoading(false)
        }
      } catch (error) {
        if (isMounted) {
          setStreamError(error instanceof Error ? error.message : 'No se pudo cargar la transmisión.')
          setIsLoading(false)
        }
      }
    }

    void fetchStreamConfig()
    const pollId = window.setInterval(() => {
      void fetchStreamConfig()
    }, 30_000)

    return () => {
      isMounted = false
      window.clearInterval(pollId)
    }
  }, [])

  const isLive = streamState?.isLive === true
  const videoId = isLive ? streamState.videoId : null

  useEffect(() => {
    const chatFrame = chatFrameRef.current
    if (!videoId || !chatFrame) return

    const embedDomain = encodeURIComponent(window.location.hostname)
    chatFrame.src = `https://www.youtube.com/live_chat?v=${videoId}&embed_domain=${embedDomain}`
  }, [videoId])

  const unavailableMessage = streamError || (
    isLoading
      ? 'Cargando transmisión...'
      : 'La transmisión no está disponible en este momento.'
  )

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto p-4 md:p-0">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-black tracking-tight text-[#0f172a] dark:text-white text-2xl md:text-3xl">
            <HiOutlinePlay className="inline-block w-8 h-8 mr-3 text-emerald-700" /> Congreso En Vivo
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-light mt-1">GLOBAL // STREAMING_OFICIAL_DEL_CONGRESO</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${isLive ? 'bg-emerald-50 border border-emerald-200' : 'bg-slate-100 border border-slate-200 dark:bg-slate-800 dark:border-slate-700'}`}>
          <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
          <span className={`text-xs font-bold uppercase tracking-widest ${isLive ? 'text-emerald-700' : 'text-slate-500 dark:text-slate-300'}`}>
            {isLoading ? 'CONECTANDO' : isLive ? 'EN VIVO' : 'FUERA DEL AIRE'}
          </span>
        </div>
      </header>

      <section className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <GlassCard className="p-5 md:p-8" glowColor="emerald">
          <div className="mb-6 aspect-video overflow-hidden rounded-2xl shadow-2xl">
            {videoId ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1`}
                title={streamState?.titulo || 'Transmisión en vivo del Congreso IGE'}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-slate-950 px-6 text-center text-sm text-white">
                {unavailableMessage}
              </div>
            )}
          </div>
          <h2 className="mb-2 text-2xl font-bold text-[#0f172a] dark:text-white">
            {streamState?.titulo || 'Transmisión en Vivo'}
          </h2>
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
            {videoId ? (
              <iframe
                ref={chatFrameRef}
                title="Chat en vivo de YouTube"
                className="h-[520px] w-full"
              />
            ) : (
              <div className="flex h-[520px] items-center justify-center px-6 text-center text-sm text-slate-500">
                {unavailableMessage}
              </div>
            )}
          </div>
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            Inicia sesión en YouTube para enviar mensajes.
          </p>
          {videoId && (
            <a
              href={`https://www.youtube.com/live_chat?v=${videoId}`}
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
