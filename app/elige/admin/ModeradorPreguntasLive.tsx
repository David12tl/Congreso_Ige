'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { isChatEnVivoMessage, type ChatEnVivoMessage } from '@/types/chat-en-vivo'

function getRecordId(value: unknown): string | null {
  if (typeof value === 'object' && value !== null && 'id' in value && typeof value.id === 'string') {
    return value.id
  }
  return null
}

function mergeRecentMessages(
  current: ChatEnVivoMessage[],
  incoming: ChatEnVivoMessage[],
): ChatEnVivoMessage[] {
  const messages = new Map(current.map((message) => [message.id, message]))
  for (const message of incoming) messages.set(message.id, message)

  return [...messages.values()]
    .sort((left, right) => right.created_at.localeCompare(left.created_at))
    .slice(0, 100)
}

function formatMessageTime(value: string): string {
  return new Date(value).toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'America/Mexico_City',
  })
}

export default function ModeradorPreguntasLive() {
  const supabase = useMemo(() => createClient(), [])
  const [moderator, setModerator] = useState(false)
  const [isCheckingRole, setIsCheckingRole] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [messages, setMessages] = useState<ChatEnVivoMessage[]>([])
  const [busyMessageId, setBusyMessageId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let isMounted = true
    let channel: ReturnType<typeof supabase.channel> | null = null
    let initialLoadStarted = false

    const loadMessages = async () => {
      const { data, error } = await supabase
        .from('chat_en_vivo')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

      if (!isMounted) return
      if (error) {
        console.error('Error al cargar preguntas para moderación:', error.message)
        setErrorMessage('No se pudieron cargar las preguntas.')
      } else {
        setMessages((current) => mergeRecentMessages(current, data))
      }
      setIsLoading(false)
    }

    const start = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (!isMounted) return

      if (authError) {
        console.error('Error al verificar sesión para moderación:', authError.message)
        setErrorMessage('No se pudo verificar tu sesión.')
        setIsCheckingRole(false)
        setIsLoading(false)
        return
      }

      if (!user) {
        setIsCheckingRole(false)
        setIsLoading(false)
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id_rol')
        .eq('id', user.id)
        .maybeSingle()

      if (!isMounted) return
      if (profileError) {
        console.error('Error al verificar permisos de moderación:', profileError.message)
        setErrorMessage('No se pudieron verificar los permisos de moderación.')
        setIsCheckingRole(false)
        setIsLoading(false)
        return
      }

      if (!profile || ![1, 2].includes(profile.id_rol)) {
        setIsCheckingRole(false)
        setIsLoading(false)
        return
      }

      setModerator(true)
      setIsCheckingRole(false)

      channel = supabase
        .channel('moderador-preguntas-live')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_en_vivo',
        }, (payload) => {
          const message = payload.new
          if (!isChatEnVivoMessage(message)) return
          setMessages((current) => mergeRecentMessages(current, [message]))
        })
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_en_vivo',
        }, (payload) => {
          const message = payload.new
          if (!isChatEnVivoMessage(message)) return
          setMessages((current) => mergeRecentMessages(current, [message]))
        })
        .on('postgres_changes', {
          event: 'DELETE',
          schema: 'public',
          table: 'chat_en_vivo',
        }, (payload) => {
          const deletedId = getRecordId(payload.old)
          if (deletedId) setMessages((current) => current.filter((message) => message.id !== deletedId))
        })
        .subscribe((status, error) => {
          if (status === 'SUBSCRIBED' && !initialLoadStarted) {
            initialLoadStarted = true
            void loadMessages()
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            console.error('Error en Realtime para moderación de preguntas:', error)
            setErrorMessage('No se pudo conectar la moderación en tiempo real.')
            setIsLoading(false)
          }
        })
    }

    void start().catch((error: unknown) => {
      if (!isMounted) return
      console.error('Error al inicializar la moderación de preguntas:', error)
      setErrorMessage('No se pudo iniciar el panel de moderación.')
      setIsCheckingRole(false)
      setIsLoading(false)
    })

    return () => {
      isMounted = false
      if (channel) void supabase.removeChannel(channel)
    }
  }, [supabase])

  const updateMessage = async (message: ChatEnVivoMessage, changes: { es_destacada?: boolean; visible?: boolean }) => {
    setBusyMessageId(message.id)
    setErrorMessage('')

    const { error } = await supabase
      .from('chat_en_vivo')
      .update(changes)
      .eq('id', message.id)

    if (error) {
      console.error('Error al actualizar una pregunta en moderación:', error.message)
      setErrorMessage('No se pudo actualizar el mensaje. Verifica los permisos y vuelve a intentar.')
    } else {
      setMessages((current) => current.map((item) => item.id === message.id ? { ...item, ...changes } : item))
    }

    setBusyMessageId(null)
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <header className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Moderación de preguntas en vivo</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Destaca preguntas para el ponente u oculta mensajes.</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {messages.length} recientes
        </span>
      </header>

      {errorMessage && (
        <p role="alert" className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {errorMessage}
        </p>
      )}

      {isCheckingRole ? (
        <p className="py-6 text-center text-sm text-slate-500">Verificando permisos...</p>
      ) : !moderator ? (
        <p className="py-6 text-center text-sm text-slate-500">Esta sección es solo para administradores y encargados.</p>
      ) : isLoading ? (
        <p className="py-6 text-center text-sm text-slate-500">Cargando preguntas...</p>
      ) : messages.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-500">Aún no hay preguntas.</p>
      ) : (
        <div className="max-h-[560px] space-y-3 overflow-y-auto">
          {messages.map((message) => (
            <article
              key={message.id}
              className={`rounded-xl border p-3 ${
                message.visible
                  ? message.es_destacada
                    ? 'border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/30'
                    : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/50'
                  : 'border-slate-300 bg-slate-100 opacity-70 dark:border-slate-700 dark:bg-slate-800'
              }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{message.nombre_usuario}</span>
                {message.matricula && (
                  <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                    {message.matricula}
                  </span>
                )}
                <time className="ml-auto text-xs text-slate-400">{formatMessageTime(message.created_at)}</time>
              </div>
              <p className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-700 dark:text-slate-200">{message.mensaje}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {!message.visible && (
                  <span className="text-xs font-semibold text-slate-500">Oculto</span>
                )}
                <button
                  type="button"
                  disabled={busyMessageId === message.id || !message.visible}
                  onClick={() => void updateMessage(message, { es_destacada: !message.es_destacada })}
                  className="rounded-lg border border-amber-300 px-3 py-1.5 text-xs font-semibold text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-amber-700 dark:text-amber-200 dark:hover:bg-amber-950"
                >
                  {message.es_destacada ? 'Quitar destacado' : 'Destacar'}
                </button>
                <button
                  type="button"
                  disabled={busyMessageId === message.id || !message.visible}
                  onClick={() => void updateMessage(message, { visible: false })}
                  className="rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-950"
                >
                  Ocultar
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
