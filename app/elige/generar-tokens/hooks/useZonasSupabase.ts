'use client'

import { useState, useEffect, useCallback } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { CONGRESO_IGE_EVENT_ID } from '@/config/auditorioConfig'
import type { ZonaSupabaseRow } from '../types'

/**
 * Carga las zonas ZONA_1…ZONA_4 desde la tabla `zones` de Supabase
 * (capacidad y precio por zona) al montar el componente.
 */
export function useZonasSupabase(supabase: SupabaseClient) {
  const [zonasSupabase, setZonasSupabase] = useState<ZonaSupabaseRow[]>([])

  useEffect(() => {
    void (async () => {
      const { data, error } = await (supabase
        .from('zones')
        .select('id, name, price, capacity')
        .eq('event_id', CONGRESO_IGE_EVENT_ID) as unknown as Promise<{
          data: ZonaSupabaseRow[] | null
          error: { message: string } | null
        }>)

      if (error) {
        console.error('[cargarZonas] Error:', error.message)
        return
      }

      setZonasSupabase(data ?? [])
    })()
  }, [supabase])

  const getZonaRow = useCallback(
    (code: string): ZonaSupabaseRow | null => {
      const digit = code.replace('ZONA_', '').trim()
      return (
        zonasSupabase.find(
          (z) => z.name.replace(/[\s_-]/g, '').toLowerCase() === `zona${digit}`,
        ) ?? null
      )
    },
    [zonasSupabase],
  )

  return { zonasSupabase, getZonaRow }
}
