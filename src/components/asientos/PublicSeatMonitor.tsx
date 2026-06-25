'use client'

import { useEffect, useMemo, useState } from 'react'
import { CONGRESO_IGE_EVENT_ID, getSeatKey, type SeatIdentity, type ZoneCode } from '@/config/auditorioConfig'
import { createClient } from '@/lib/supabase/client'
import { AuditorioSeatMap } from './AuditorioSeatMap'

interface PublicSeatMonitorProps {
  initialOccupiedSeatKeys: string[]
}

interface TicketInsertPayload {
  event_id?: string | null
  zone_id?: string | null
  asiento_zona?: string | null
  asiento_bloque?: string | null
  asiento_fila?: string | null
  asiento_numero?: number | null
}

function parseInsertedSeat(row: TicketInsertPayload): SeatIdentity | null {
  if (
    row.event_id !== CONGRESO_IGE_EVENT_ID ||
    !row.zone_id ||
    !row.asiento_zona ||
    !row.asiento_bloque ||
    !row.asiento_fila ||
    !row.asiento_numero
  ) {
    return null
  }

  return {
    zoneCode: row.asiento_zona as ZoneCode,
    zoneId: row.zone_id,
    bloque: row.asiento_bloque,
    fila: row.asiento_fila,
    numero: row.asiento_numero,
  }
}

export function PublicSeatMonitor({ initialOccupiedSeatKeys }: PublicSeatMonitorProps) {
  const [occupiedSeatKeys, setOccupiedSeatKeys] = useState(() => new Set(initialOccupiedSeatKeys))
  const [connectionStatus, setConnectionStatus] = useState<'conectando' | 'activo' | 'error'>('conectando')

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('public-seat-monitor')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'tickets' },
        (payload) => {
          const seat = parseInsertedSeat(payload.new as TicketInsertPayload)
          if (!seat) return

          setOccupiedSeatKeys((current) => {
            const next = new Set(current)
            next.add(getSeatKey(seat))
            return next
          })
        },
      )
      .subscribe((status, error) => {
        if (status === 'SUBSCRIBED') setConnectionStatus('activo')
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || error) {
          console.error('[PublicSeatMonitor] Error Realtime:', status, error)
          setConnectionStatus('error')
        }
      })

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [])

  const statusLabel = useMemo(() => {
    if (connectionStatus === 'activo') return 'Realtime activo'
    if (connectionStatus === 'error') return 'Realtime no disponible'
    return 'Conectando Realtime'
  }, [connectionStatus])

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-300">
            Auditorio Metropolitano de Orizaba
          </p>
          <h1 className="mt-2 text-3xl font-black uppercase tracking-tight text-white">
            Monitoreo de asientos
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Vista publica de disponibilidad para el Congreso anual de IGE.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs font-bold uppercase tracking-widest">
          <span className="rounded-md border border-white/10 bg-white px-3 py-2 text-slate-950">
            Libre
          </span>
          <span className="rounded-md border border-gray-300/40 bg-gray-400 px-3 py-2 text-gray-800">
            Ocupado
          </span>
          <span className={`rounded-md border px-3 py-2 ${
            connectionStatus === 'activo'
              ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
              : connectionStatus === 'error'
                ? 'border-red-400/30 bg-red-400/10 text-red-300'
                : 'border-amber-400/30 bg-amber-400/10 text-amber-300'
          }`}>
            {statusLabel}
          </span>
        </div>
      </header>

      <AuditorioSeatMap
        mode="monitor"
        occupiedSeatKeys={occupiedSeatKeys}
      />
    </div>
  )
}
