'use client'

import React, { useEffect, useState, type KeyboardEvent } from 'react'
import { HiOutlinePlay } from 'react-icons/hi'
import { GlassCard } from '@/components/ui/GlassCard'
import { isLiveStreamConfig, type LiveStreamConfig } from '@/types/live-stream'
import ChatEnVivoSupabase from './ChatEnVivoSupabase'

function getErrorMessage(value: unknown, fallback: string): string {
  if (typeof value === 'object' && value !== null && 'error' in value && typeof value.error === 'string') {
    return value.error
  }
  return fallback
}

export default function EnVivoPage() {
  const [streamState, setStreamState] = useState<LiveStreamConfig | null>(null)
  const [streamError, setStreamError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [activeChatTab, setActiveChatTab] = useState<'questions' | 'youtube'>('questions')
  const [hostname, setHostname] = useState('')

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

  const unavailableMessage = streamError || (
    isLoading
      ? 'Cargando transmisión...'
      : 'La transmisión no está disponible en este momento.'
  )

  const selectChatTab = (tab: 'questions' | 'youtube') => {
    if (tab === 'youtube') setHostname(window.location.hostname)
    setActiveChatTab(tab)
  }

  const handleChatTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    let nextTab: 'questions' | 'youtube' | null = null
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      nextTab = activeChatTab === 'questions' ? 'youtube' : 'questions'
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      nextTab = activeChatTab === 'questions' ? 'youtube' : 'questions'
    } else if (event.key === 'Home') {
      nextTab = 'questions'
    } else if (event.key === 'End') {
      nextTab = 'youtube'
    }

    if (nextTab) {
      event.preventDefault()
      selectChatTab(nextTab)
      document.getElementById(`chat-tab-${nextTab}`)?.focus()
    }
  }

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

        <aside className="flex h-[500px] min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 lg:h-[540px]">
          <div
            role="tablist"
            aria-label="Chats de la transmisión"
            className="grid shrink-0 grid-cols-2 border-b border-slate-200 dark:border-slate-700"
          >
            <button
              id="chat-tab-questions"
              type="button"
              role="tab"
              aria-selected={activeChatTab === 'questions'}
              aria-controls="chat-panel-questions"
              tabIndex={activeChatTab === 'questions' ? 0 : -1}
              onClick={() => selectChatTab('questions')}
              onKeyDown={handleChatTabKeyDown}
              className={`px-3 py-3 text-sm font-bold transition ${
                activeChatTab === 'questions'
                  ? 'border-b-2 border-emerald-700 text-emerald-800 dark:text-emerald-300'
                  : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              Preguntas y Chat
            </button>
            <button
              id="chat-tab-youtube"
              type="button"
              role="tab"
              aria-selected={activeChatTab === 'youtube'}
              aria-controls="chat-panel-youtube"
              tabIndex={activeChatTab === 'youtube' ? 0 : -1}
              onClick={() => selectChatTab('youtube')}
              onKeyDown={handleChatTabKeyDown}
              className={`px-3 py-3 text-sm font-bold transition ${
                activeChatTab === 'youtube'
                  ? 'border-b-2 border-emerald-700 text-emerald-800 dark:text-emerald-300'
                  : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              Chat YouTube
            </button>
          </div>

          <div
            id="chat-panel-questions"
            role="tabpanel"
            aria-labelledby="chat-tab-questions"
            hidden={activeChatTab !== 'questions'}
            className={`min-h-0 flex-1 ${activeChatTab === 'questions' ? 'flex flex-col' : 'hidden'}`}
          >
            <ChatEnVivoSupabase />
          </div>

          <div
            id="chat-panel-youtube"
            role="tabpanel"
            aria-labelledby="chat-tab-youtube"
            hidden={activeChatTab !== 'youtube'}
            className={`min-h-0 flex-1 p-3 ${activeChatTab === 'youtube' ? 'flex flex-col' : 'hidden'}`}
          >
            {videoId && hostname ? (
              <iframe
                src={`https://www.youtube.com/live_chat?v=${videoId}&embed_domain=${hostname}`}
                title="Chat de YouTube de la transmisión en vivo"
                allow="autoplay"
                className="min-h-0 w-full flex-1 rounded-xl border-0"
              />
            ) : (
              <div className="flex min-h-0 flex-1 items-center justify-center rounded-xl bg-slate-50 px-4 text-center text-sm text-slate-500 dark:bg-slate-950/50 dark:text-slate-400">
                {unavailableMessage}
              </div>
            )}
            {videoId && (
              <a
                href={`https://www.youtube.com/live_chat?is_popout=1&v=${videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 shrink-0 text-center text-xs text-slate-500 underline decoration-slate-300 underline-offset-2 hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-300"
              >
                Abrir chat en ventana externa
              </a>
            )}
          </div>
        </aside>
      </section>
    </div>
  )
}
