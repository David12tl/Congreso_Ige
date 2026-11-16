'use client'

import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { isChatEnVivoMessage, type ChatEnVivoMessage } from '@/types/chat-en-vivo'

function mergeVisibleMessages(
  current: ChatEnVivoMessage[],
  incoming: ChatEnVivoMessage[],
): ChatEnVivoMessage[] {
  const messages = new Map(current.map((message) => [message.id, message]))
  for (const message of incoming) {
    if (message.visible) messages.set(message.id, message)
    else messages.delete(message.id)
  }

  return [...messages.values()]
    .sort((left, right) => left.created_at.localeCompare(right.created_at))
    .slice(-100)
}

function getRecordId(value: unknown): string | null {
  if (typeof value === 'object' && value !== null && 'id' in value && typeof value.id === 'string') {
    return value.id
  }
  return null
}

function getUserName(user: User): string {
  const metadataName = user.user_metadata?.full_name || user.user_metadata?.name
  if (typeof metadataName === 'string' && metadataName.trim()) return metadataName.trim()
  return user.email?.split('@')[0] || 'Asistente'
}

function getMatricula(email: string | undefined): string | null {
  if (!email || !email.toLowerCase().endsWith('@zongolica.tecnm.mx')) return null
  return email.split('@')[0].toUpperCase()
}

function formatMessageTime(value: string): string {
  return new Date(value).toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'America/Mexico_City',
  })
}

export default function ChatEnVivoSupabase() {
  const supabase = useMemo(() => createClient(), [])
  const [user, setUser] = useState<User | null>(null)
  const [messages, setMessages] = useState<ChatEnVivoMessage[]>([])
  const [draft, setDraft] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [cooldownSeconds, setCooldownSeconds] = useState(0)
  const [errorMessage, setErrorMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const sendingRef = useRef(false)
  const cooldownRef = useRef(false)
  const cooldownTimerRef = useRef<number | null>(null)

  useEffect(() => {
    let isMounted = true
    let observedUserId: string | null | undefined

    const applyUser = (nextUser: User | null) => {
      if (!isMounted) return
      const nextUserId = nextUser?.id ?? null
      if (nextUserId !== observedUserId) {
        observedUserId = nextUserId
        setIsLoading(Boolean(nextUser))
        setErrorMessage('')
        if (!nextUser) setMessages([])
      }
      setUser(nextUser)
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      applyUser(session?.user ?? null)
    })

    void supabase.auth.getUser().then(({ data, error }) => {
      if (error) {
        if (isMounted) {
          setErrorMessage('No se pudo verificar tu sesión. Vuelve a iniciar sesión.')
          setIsLoading(false)
        }
        return
      }
      applyUser(data.user)
    }).catch((error: unknown) => {
      if (isMounted) {
        console.error('Error al verificar sesión para el chat en vivo:', error)
        setErrorMessage('No se pudo verificar tu sesión. Vuelve a iniciar sesión.')
        setIsLoading(false)
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [supabase])

  const userId = user?.id

  useEffect(() => {
    if (!userId) return

    let isMounted = true
    let initialLoadStarted = false
    const loadMessages = async () => {
      const { data, error } = await supabase
        .from('chat_en_vivo')
        .select('*')
        .eq('visible', true)
        .order('created_at', { ascending: false })
        .limit(100)

      if (!isMounted) return
      if (error) {
        console.error('Error al cargar los mensajes del chat en vivo:', error.message)
        setErrorMessage('No se pudieron cargar las preguntas. Intenta de nuevo.')
      } else {
        setMessages((current) => mergeVisibleMessages(current, [...data].reverse()))
      }
      setIsLoading(false)
    }

    const channel = supabase
      .channel('chat-congreso-live')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_en_vivo',
      }, (payload) => {
        const message = payload.new
        if (!isChatEnVivoMessage(message)) return
        setMessages((current) => mergeVisibleMessages(current, [message]))
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'chat_en_vivo',
      }, (payload) => {
        const message = payload.new
        if (!isChatEnVivoMessage(message)) return
        setMessages((current) => mergeVisibleMessages(current, [message]))
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
          console.error('Error en la suscripción Realtime del chat en vivo:', error)
          setErrorMessage('No se pudo conectar el chat en tiempo real.')
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
      void supabase.removeChannel(channel)
    }
  }, [supabase, userId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages])

  useEffect(() => () => {
    if (cooldownTimerRef.current !== null) {
      window.clearInterval(cooldownTimerRef.current)
    }
  }, [])

  const startCooldown = () => {
    cooldownRef.current = true
    setCooldownSeconds(3)
    let secondsRemaining = 3
    cooldownTimerRef.current = window.setInterval(() => {
      secondsRemaining -= 1
      if (secondsRemaining <= 0) {
        if (cooldownTimerRef.current !== null) window.clearInterval(cooldownTimerRef.current)
        cooldownTimerRef.current = null
        cooldownRef.current = false
        setCooldownSeconds(0)
      } else {
        setCooldownSeconds(secondsRemaining)
      }
    }, 1000)
  }

  const sendMessage = async () => {
    const mensaje = draft.trim()
    if (!user || !mensaje || Array.from(mensaje).length > 400 || sendingRef.current || cooldownRef.current) return

    sendingRef.current = true
    setIsSending(true)
    setErrorMessage('')

    const { error } = await supabase.from('chat_en_vivo').insert({
      user_id: user.id,
      nombre_usuario: getUserName(user),
      matricula: getMatricula(user.email),
      mensaje,
    })

    sendingRef.current = false
    setIsSending(false)

    if (error) {
      console.error('Error al enviar una pregunta al chat en vivo:', error.message)
      setErrorMessage('No se pudo enviar el mensaje. Intenta de nuevo.')
      return
    }

    setDraft('')
    startCooldown()
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void sendMessage()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      void sendMessage()
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <header className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Preguntas y Chat en Vivo</h2>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {messages.length} mensajes
        </span>
      </header>

      {errorMessage && (
        <p role="alert" className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {errorMessage}
        </p>
      )}

      <div className="max-h-[440px] min-h-40 space-y-3 overflow-y-auto rounded-xl bg-slate-50 p-3 dark:bg-slate-950/50">
        {isLoading ? (
          <p className="py-8 text-center text-sm text-slate-500">Cargando mensajes...</p>
        ) : messages.length > 0 ? (
          messages.map((message) => (
            <article
              key={message.id}
              className={`rounded-xl border p-3 ${
                message.es_destacada
                  ? 'border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/30'
                  : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
              }`}
            >
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{message.nombre_usuario}</span>
                {message.matricula && (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    {message.matricula}
                  </span>
                )}
                <time className="ml-auto text-xs text-slate-400">{formatMessageTime(message.created_at)}</time>
              </div>
              {message.es_destacada && (
                <span className="mb-1 inline-block rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-900 dark:bg-amber-800 dark:text-amber-100">
                  Pregunta Destacada
                </span>
              )}
              <p className="whitespace-pre-wrap break-words text-sm text-slate-700 dark:text-slate-200">{message.mensaje}</p>
            </article>
          ))
        ) : user ? (
          <p className="py-8 text-center text-sm text-slate-500">Aún no hay preguntas. ¡Sé el primero en participar!</p>
        ) : (
          <p className="py-8 text-center text-sm text-slate-500">Inicia sesión para ver las preguntas y participar.</p>
        )}
        <div ref={messagesEndRef} />
      </div>

      {user ? (
        <form onSubmit={handleSubmit} className="mt-4 space-y-2">
          <label htmlFor="chat-en-vivo-mensaje" className="sr-only">Escribe tu pregunta</label>
          <textarea
            id="chat-en-vivo-mensaje"
            value={draft}
            onChange={(event) => {
              if (Array.from(event.target.value).length <= 400) setDraft(event.target.value)
            }}
            onKeyDown={handleKeyDown}
            maxLength={400}
            rows={3}
            placeholder="Escribe tu pregunta... (Enter para enviar, Shift+Enter para nueva línea)"
            className="w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
          <div className="flex items-center justify-between gap-3">
            <span className={`text-xs ${Array.from(draft).length >= 400 ? 'text-amber-600' : 'text-slate-400'}`}>
              {Array.from(draft).length}/400
            </span>
            <button
              type="submit"
              disabled={isSending || cooldownSeconds > 0 || !draft.trim()}
              className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSending ? 'Enviando...' : cooldownSeconds > 0 ? `Enviar (${cooldownSeconds}s)` : 'Enviar'}
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center dark:border-emerald-900 dark:bg-emerald-950/30">
          <p className="mb-3 text-sm text-slate-700 dark:text-slate-200">Inicia sesión en la plataforma para enviar preguntas.</p>
          <Link
            href="/login"
            className="inline-flex rounded-lg bg-emerald-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-800"
          >
            Iniciar sesión
          </Link>
        </div>
      )}
    </section>
  )
}
