'use client'

import { useState, useEffect, useCallback } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { ZoneCode } from '@/config/auditorioConfig'
import type { ApartadoPendienteRow } from '../types'

interface RawTicketRow {
  id: string
  nombre: string | null
  email: string | null
  zone_id: string | null
  asiento_zona: string | null
  asiento_bloque: string | null
  asiento_fila: string | null
  asiento_numero: number | null
  purchase_id: string | null
  estatus_pago: string | null
  purchased_at: string | null
  purchases: { amount_paid: number; total: number; status: string } | null
}

/**
 * Carga la lista de apartados pendientes (estatus `apartado` o `pendiente`)
 * desde Supabase y expone un callback para recargar bajo demanda.
 */
export function useApartadosPendientes(supabase: SupabaseClient) {
  const [apartadosPendientes, setApartadosPendientes] = useState<ApartadoPendienteRow[]>([])
  const [loadingApartados, setLoadingApartados] = useState(false)
  const [errorApartados, setErrorApartados] = useState<string | null>(null)

  const cargarApartadosPendientes = useCallback(async () => {
    setLoadingApartados(true)
    setErrorApartados(null)
    try {
      const { data, error } = await (supabase
        .from('tickets')
        .select(
          'id, nombre, email, zone_id, asiento_zona, asiento_bloque, asiento_fila, asiento_numero, purchase_id, estatus_pago, purchased_at, purchases(amount_paid, total, status)',
        )
        .in('estatus_pago', ['apartado', 'pendiente'])
        .order('purchased_at', { ascending: false }) as unknown as Promise<{
          data: Record<string, unknown>[] | null
          error: { message: string } | null
        }>)

      if (error) {
        console.error('[cargarApartadosPendientes] Error:', error.message)
        setErrorApartados('No se pudieron cargar los apartados pendientes.')
        setApartadosPendientes([])
        return
      }

      const rows = (data ?? []) as unknown as RawTicketRow[]

      const lista: ApartadoPendienteRow[] = rows
        .filter((r) => r.asiento_zona && r.asiento_bloque && r.asiento_fila && r.asiento_numero !== null)
        .map((r) => {
          const totalAbonado = r.purchases?.amount_paid ?? 0
          const total = r.purchases?.total ?? 650
          return {
            ticketId: r.id,
            purchaseId: r.purchase_id,
            zoneId: r.zone_id,
            zoneCode: r.asiento_zona as ZoneCode,
            bloque: r.asiento_bloque,
            fila: r.asiento_fila,
            numero: r.asiento_numero,
            nombre: r.nombre,
            email: r.email,
            totalAbonado,
            montoRestante: Math.max(0, total - totalAbonado),
            total,
            estatusPago: r.estatus_pago ?? 'pendiente',
            purchasedAt: r.purchased_at,
          }
        })

      setApartadosPendientes(lista)
    } catch (err) {
      console.error('[cargarApartadosPendientes] Error general:', err)
      setErrorApartados('Error de red al consultar los apartados pendientes.')
    } finally {
      setLoadingApartados(false)
    }
  }, [supabase])

  // Carga automática al montar el componente
  useEffect(() => {
    void (async () => {
      await cargarApartadosPendientes()
    })()
  }, [cargarApartadosPendientes])

  return { apartadosPendientes, loadingApartados, errorApartados, cargarApartadosPendientes }
}
