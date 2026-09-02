'use client'

import { useEffect } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { SeatEstatusPago as SeatStatus } from '@/components/asientos/types'
import type { TicketInsertPayload } from '../types'
import { parseInsertedSeat, buildSeatKey } from '../utils/seatAdapters'

export interface RealtimeCallbacks {
  /** Añade una clave de asiento ocupado al conjunto de ocupados. */
  addOccupiedKey: (key: string) => void
  /** Asigna o actualiza el estatus de pago de una clave de asiento. */
  setStatus: (key: string, status: SeatStatus) => void
  /** Recarga la lista de apartados pendientes. */
  cargarApartadosPendientes: () => Promise<unknown>
}

/**
 * Suscripción en tiempo real a cambios en la tabla `tickets`.
 *
 * - On INSERT: registra el asiento como ocupado con estatus `apartado`
 *   y recarga los apartados pendientes.
 * - On UPDATE: si el estatus cambia a `pagado`, recarga los apartados pendientes.
 *
 * Incluye lógica de reconexión exponencial con tope de 8 s y gestión
 * robusta de la desconexión por logout.
 */
export function useTaquillaRealtime(
  supabase: SupabaseClient,
  callbacks: RealtimeCallbacks,
) {
  const { addOccupiedKey, setStatus, cargarApartadosPendientes } = callbacks

  useEffect(() => {
    let activeChannel: ReturnType<typeof supabase.channel> | null = null
    let isUnmounted = false
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null
    let reconnectAttempts = 0

    const { data: authSub } = supabase.auth.onAuthStateChange((event) => {
      if (isUnmounted) return
      if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
        if (activeChannel && reconnectAttempts === 0) return
        scheduleReconnect()
      } else if (event === 'SIGNED_OUT') {
        if (activeChannel) {
          void supabase.removeChannel(activeChannel)
          activeChannel = null
        }
      }
    })

    const scheduleReconnect = () => {
      if (isUnmounted) return
      if (reconnectTimer) clearTimeout(reconnectTimer)
      const delay = Math.min(8000, 1000 * Math.pow(2, reconnectAttempts))
      reconnectAttempts += 1
      reconnectTimer = setTimeout(() => {
        if (isUnmounted) return
        if (activeChannel) {
          void supabase.removeChannel(activeChannel)
          activeChannel = null
        }
        subscribeChannel()
      }, delay)
    }

    const subscribeChannel = () => {
      if (isUnmounted) return
      void supabase.auth.getSession().catch(() => {})

      const channel = supabase
        .channel('taquilla-tokens-realtime')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'tickets' },
          (payload) => {
            const row = payload.new as TicketInsertPayload
            const seat = parseInsertedSeat(row)
            if (!seat) return

            const key = buildSeatKey(seat)
            addOccupiedKey(key)
            setStatus(key, 'apartado')
            void cargarApartadosPendientes()
          },
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'tickets' },
          (payload) => {
            const row = payload.new as TicketInsertPayload & { estatus_pago?: string | null }
            if (row.estatus_pago === 'pagado') {
              void cargarApartadosPendientes()
            }
          },
        )
        .subscribe((status, error) => {
          if (isUnmounted) return
          if (status === 'SUBSCRIBED') {
            reconnectAttempts = 0
            return
          }
          if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || error) {
            scheduleReconnect()
          }
        })

      activeChannel = channel
    }

    subscribeChannel()

    return () => {
      isUnmounted = true
      if (reconnectTimer) clearTimeout(reconnectTimer)
      authSub?.subscription?.unsubscribe()
      if (activeChannel) {
        void supabase.removeChannel(activeChannel)
      }
    }
  }, [supabase, addOccupiedKey, setStatus, cargarApartadosPendientes])
}
