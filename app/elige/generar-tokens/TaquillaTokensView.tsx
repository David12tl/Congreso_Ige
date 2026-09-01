'use client'

import React, { useState, useTransition, useMemo, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CONGRESO_IGE_EVENT_ID, getSeatKey, getZoneByCode, auditorioConfig, type SeatIdentity, type ZoneCode } from '@/config/auditorioConfig'
import type { SeatEstatusPago as SeatStatus } from '@/components/asientos/types'
import SeatMap, { type SeatSelectionInfo } from '@/components/asientos/zonaExternos'
import {
  cobrarAsientoYGenerarToken,
  liquidarRestoAsiento,
  getApartadoInfo,
} from './actions'
import type { AssignmentContext } from '@/components/asientos/types'
import ZonaGrid, { type ZonaSeatSelectionInfo } from '@/components/asientos/ZonaGrid'
import { ApartadosPendientesPanel } from './ApartadosPendientesPanel'
import { PanelCobroLateral } from './PanelCobroLateral'
// ─── Interfaces de Datos Estrictas ────────────────────────────────────

interface TicketInsertPayload {
  event_id?: string | null
  zone_id?: string | null
  asiento_zona?: string | null
  asiento_bloque?: string | null
  asiento_fila?: string | null
  asiento_numero?: number | null
  purchase_id?: string | null
  estatus_pago?: string | null
}

export interface ApartadoInfoLocal {
  ticketId: string
  purchaseId: string | null
  totalAbonado: number
  montoRestante: number
  status: string
  total: number
  tokenCode: string | null
  nombre: string | null
  email: string | null
}

interface TaquillaTokensViewProps {
  assignmentContext: AssignmentContext
  initialOccupiedSeatKeys: string[]
  initialSeatStatusMap: Record<string, string>
  initialStats: { total: number; disponibles: number; usados: number }
}

export interface TicketSelectResponse {
  id: string
  nombre: string | null
  email: string | null
  buyer_id?: string | null
  type?: string | null
}

export interface ApartadoPendienteRow {
  ticketId: string
  purchaseId: string | null
  zoneId: string | null
  zoneCode: ZoneCode | null
  bloque: string | null
  fila: string | null
  numero: number | null
  nombre: string | null
  email: string | null
  totalAbonado: number
  montoRestante: number
  total: number
  estatusPago: string
  purchasedAt: string | null
}

export interface ExtendedZoneConfig {
  id: string
  code: ZoneCode
  name?: string
  price?: number
  [key: string]: unknown
}

function parseInsertedSeat(row: TicketInsertPayload): SeatIdentity | null {
  if (
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

// Pestañas de zonas visibles en la taquilla (interacción directa, sin modales).
const ZONA_TABS = ['EXTERNOS', 'ZONA_1', 'ZONA_2', 'ZONA_3', 'ZONA_4'] as const

// Fila de la tabla `zones` de Supabase para las zonas ZONA_1…ZONA_4.
interface ZonaSupabaseRow {
  id: string
  name: string
  price: number
  capacity: number
}

// ─── Componente principal ─────────────────────────────────────────────

export function TaquillaTokensView({
  assignmentContext,
  initialOccupiedSeatKeys,
  initialSeatStatusMap,
  initialStats,
}: TaquillaTokensViewProps) {
  const supabase = useMemo(() => createClient(), [])
  const [isPending, startTransition] = useTransition()

  // Zona activa visible en pantalla (pestañas directas, sin modales)
  const [zonaActiva, setZonaActiva] = useState<string>('EXTERNOS')

  // Zonas ZONA_1…ZONA_4 traídas de Supabase (capacidad y precio por zona)
  const [zonasSupabase, setZonasSupabase] = useState<ZonaSupabaseRow[]>([])

  // Estado del mapa
  const [occupiedSeatKeys, setOccupiedSeatKeys] = useState(() => new Set(initialOccupiedSeatKeys))
  const [seatStatusMap, setSeatStatusMap] = useState<Record<string, SeatStatus>>(initialSeatStatusMap as Record<string, SeatStatus>)

  // Asiento seleccionado para cobro
  const [selectedSeat, setSelectedSeat] = useState<SeatIdentity | null>(null)
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)
  const [modalMode, setModalMode] = useState<'nuevo' | 'liquidar' | null>(null)

  // Estados del Buscador de Pre-Registros
  const [busqueda, setBusqueda] = useState('')
  const [usuariosPendientes, setUsuariosPendientes] = useState<TicketSelectResponse[]>([])
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<TicketSelectResponse | null>(null)

  // Formulario para Nuevo Asiento (Venta Directa o Apartado Inicial)
  const [nombreAlumno, setNombreAlumno] = useState('')
  const [emailAlumno, setEmailAlumno] = useState('')
  const [metodoRegistro, setMetodoRegistro] = useState<'pago' | 'apartado'>('pago')
  const [montoApartado, setMontoApartado] = useState<number>(350)

  // Estado de Información de un Asiento ya Apartado (Para liquidación)
  const [infoApartado, setInfoApartado] = useState<ApartadoInfoLocal | null>(null)
  const [loadingApartado, setLoadingApartado] = useState(false)
  const [tipoPagoLiquidacion, setTipoPagoLiquidacion] = useState<'efectivo' | 'transferencia'>('efectivo')
  // ─── Estados para la sección "Lista de Apartados Pendientes" ─────────
  const [apartadosPendientes, setApartadosPendientes] = useState<ApartadoPendienteRow[]>([])
  const [loadingApartados, setLoadingApartados] = useState(false)
  const [errorApartados, setErrorApartados] = useState<string | null>(null)
  const [filtroNombre, setFiltroNombre] = useState('')

  // Estados de Transición y Feedback
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [tokenGenerado, setTokenGenerado] = useState<string | null>(null)

  // Estadísticas
  const [, setStats] = useState(initialStats)

  // Asiento seleccionado vía los mapas de zona (formato FILA-NUMERO, ej. "A-5")
  const [asientoSeleccionado, setAsientoSeleccionado] = useState<string | null>(null)

  // Asientos ocupados en el formato que esperan zonaExternos / ZonaGrid ("FILA-NUMERO")
  const asientosOcupados = useMemo(
    () =>
      Array.from(occupiedSeatKeys).map((key) => {
        const [, , fila, numero] = key.split('|')
        return fila && numero ? `${fila}-${numero}` : key
      }),
    [occupiedSeatKeys],
  )

  // Carga de zonas ZONA_1…ZONA_4 desde Supabase (tabla `zones` del evento actual).
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

  // Localiza la fila de Supabase correspondiente a un código de zona (ZONA_1…ZONA_4).
  // Acepta nombres como "Zona 1", "ZONA_1" o "zona-1".
  const getZonaRow = useCallback((code: string): ZonaSupabaseRow | null => {
    const digit = code.replace('ZONA_', '').trim()
    return (
      zonasSupabase.find(
        (z) => z.name.replace(/[\s_-]/g, '').toLowerCase() === `zona${digit}`,
      ) ?? null
    )
  }, [zonasSupabase])

  // Ocupación de una zona en formato "FILA-NUMERO" (igual que zonaExternos / ZonaGrid).
  const getZonaOcupados = useCallback((code: string): string[] => {
    const prefix = `${code}|`
    return Array.from(occupiedSeatKeys)
      .filter((key) => key.startsWith(prefix))
      .map((key) => {
        const [, , fila, numero] = key.split('|')
        return fila && numero ? `${fila}-${numero}` : key
      })
  }, [occupiedSeatKeys])

  // Estatus de pago por asiento de una zona en formato "FILA-NUMERO".
  const getZonaStatuses = useCallback((code: string): Record<string, string> => {
    const prefix = `${code}|`
    const out: Record<string, string> = {}
    for (const [key, status] of Object.entries(seatStatusMap)) {
      if (!key.startsWith(prefix)) continue
      const [, , fila, numero] = key.split('|')
      if (fila && numero) {
        // eslint-disable-next-line security/detect-object-injection -- clave derivada de getSeatKey
        out[`${fila}-${numero}`] = status
      }
    }
    return out
  }, [seatStatusMap])

  // Datos de la zona activa para el render condicional del mapa central.
  const zonaActivaRow = useMemo(
    () => (zonaActiva === 'EXTERNOS' ? null : getZonaRow(zonaActiva)),
    [zonaActiva, getZonaRow],
  )
  const zonaActivaOcupados = useMemo<string[]>(
    () => (zonaActiva === 'EXTERNOS' ? [] : getZonaOcupados(zonaActiva)),
    [zonaActiva, getZonaOcupados],
  )
  const zonaActivaStatuses = useMemo<Record<string, string>>(
    () => (zonaActiva === 'EXTERNOS' ? {} : getZonaStatuses(zonaActiva)),
    [zonaActiva, getZonaStatuses],
  )

  // Convierte la estructura del mapa abstracto del modal (bloque/fila/numero)
  // en un SeatIdentity real de la configuración del auditorio.
  // Nota: las filas A–E → PREFERENTE, F–J → LUNETA y K–O → GENERAL PLANTA BAJA
  // son únicas por zona, por lo que la resolución de la zona es determinista.
  const resolveSeatIdentityFromModal = useCallback((info: SeatSelectionInfo): SeatIdentity | null => {
    for (const zone of auditorioConfig) {
      for (const bloque of zone.bloques) {
        const filaConfig = bloque.filas.find((f) => f.fila === info.fila)
        if (filaConfig && info.numero <= filaConfig.asientos) {
          return {
            zoneCode: zone.code,
            zoneId: zone.zoneId,
            bloque: bloque.id,
            fila: info.fila,
            numero: info.numero,
          }
        }
      }
    }
    return null
  }, [])


  // Zona del Asiento Actual. Las zonas ZONA_1…ZONA_4 no viven en
  // auditorioConfig, así que se resuelven contra los datos de Supabase
  // para que el panel lateral de cobro tenga nombre y precio.
  const selectedZone = useMemo((): ExtendedZoneConfig | null => {
    if (!selectedSeat) return null
    const configZone = getZoneByCode(selectedSeat.zoneCode)
    if (configZone) {
      return { id: configZone.zoneId, code: configZone.code, name: configZone.nombre }
    }
    const zonaRow = getZonaRow(selectedSeat.zoneCode)
    if (zonaRow) {
      return { id: zonaRow.id, code: selectedSeat.zoneCode, name: zonaRow.name, price: zonaRow.price }
    }
    return null
  }, [selectedSeat, getZonaRow])

  // ─── Cargar lista de Apartados Pendientes desde Supabase ────────────
  const cargarApartadosPendientes = useCallback(async () => {
    setLoadingApartados(true)
    setErrorApartados(null)
    try {
      const { data, error } = await (supabase
        .from('tickets')
        .select('id, nombre, email, zone_id, asiento_zona, asiento_bloque, asiento_fila, asiento_numero, purchase_id, estatus_pago, purchased_at, purchases(amount_paid, total, status)')
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

      const rows = (data ?? []) as Array<{
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
      }>

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

  // Cargar información si el asiento está apartado
  const cargarInfoApartado = useCallback(async (ticketId: string, ticketRow: TicketSelectResponse | null) => {
    setLoadingApartado(true)
    setErrorMsg(null)
    try {
      const res = await getApartadoInfo(ticketId)
      if (res.success && res.info) {
        setInfoApartado(res.info)
        setMontoApartado(res.info.montoRestante)
      } else {
        const defaultPrice = selectedZone?.price ?? 650
        setInfoApartado({
          ticketId,
          purchaseId: null,
          totalAbonado: 0,
          montoRestante: defaultPrice,
          status: 'pendiente',
          total: defaultPrice,
          tokenCode: null,
          nombre: ticketRow?.nombre ?? null,
          email: ticketRow?.email ?? null,
        })
        setMontoApartado(defaultPrice)
      }
    } catch {
      setErrorMsg('Error de red al consultar el apartado.')
    } finally {
      setLoadingApartado(false)
    }
  }, [selectedZone])

  // Handler para abrir el panel de liquidación desde la tabla de pendientes
  // ─── Acción de la Tabla a Liquidación (Tu función original integrada) ───
const handleLiquidarDesdeTabla = useCallback(async (row: ApartadoPendienteRow) => {
  setErrorMsg(null)
  setTokenGenerado(null)
  setInfoApartado(null)
  setSelectedTicketId(null)

  // Validación estricta del asiento antes de proceder
  if (!row.zoneCode || !row.bloque || !row.fila || row.numero === null || !row.zoneId) {
    setErrorMsg('No se pudo reconstruir la información del asiento para liquidar.')
    return
  }

  const seat = {
    zoneCode: row.zoneCode,
    zoneId: row.zoneId,
    bloque: row.bloque,
    fila: row.fila,
    numero: row.numero,
  }

  // Seteo de estados concurrentes para la interfaz reactiva
  setSelectedSeat(seat)
  setSelectedTicketId(row.ticketId)
  setNombreAlumno(row.nombre ?? '')
  setEmailAlumno(row.email ?? '')

  // Carga de la información financiera del backend/Supabase
  await cargarInfoApartado(row.ticketId, {
    id: row.ticketId,
    nombre: row.nombre,
    email: row.email,
  })

  // Transición visual al formulario lateral de cobro
  setModalMode('liquidar')
}, [cargarInfoApartado])

  // Handler al dar click en cualquier asiento del mapa
  const handleSeatClick = useCallback(async (seat: SeatIdentity) => {
    setErrorMsg(null)
    setTokenGenerado(null)
    setBusqueda('')
    setUsuariosPendientes([])
    setUsuarioSeleccionado(null)

    // Sincroniza la selección con el feedback del modal de asientos
    setAsientoSeleccionado(`${seat.fila}-${seat.numero}`)

    const key = getSeatKey(seat)
    const occupied = occupiedSeatKeys.has(key)
    const status = seatStatusMap[key]

    if (status === 'pagado' || status === 'completo') {
      setErrorMsg('Este asiento ya está completamente liquidado.')
      return
    }

    if (!occupied) {
      setSelectedSeat(seat)
      setSelectedTicketId(null)
      setModalMode('nuevo')
      setNombreAlumno('')
      setEmailAlumno('')
      setMetodoRegistro('pago')
      return
    }

    if (status === 'apartado' || status === 'pendiente') {
      setSelectedSeat(seat)
      setSelectedTicketId(null)
      setInfoApartado(null)
      setLoadingApartado(true)
      setModalMode('liquidar')

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
          .from('tickets')
          .select('id, nombre, email, buyer_id')
          .eq('asiento_zona', seat.zoneCode)
          .eq('asiento_bloque', seat.bloque)
          .eq('asiento_fila', seat.fila)
          .eq('asiento_numero', seat.numero)
          .order('purchased_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (error || !data) {
          setErrorMsg('No se encontró el ticket asociado al asiento apartado.')
          setLoadingApartado(false)
          setSelectedSeat(null)
          setSelectedTicketId(null)
          setInfoApartado(null)
          setModalMode(null)
          return
        }

        const ticketRow: TicketSelectResponse = {
          id: data.id,
          nombre: data.nombre,
          email: data.email,
        }
        setSelectedTicketId(ticketRow.id)
        setNombreAlumno(ticketRow.nombre ?? '')
        setEmailAlumno(ticketRow.email ?? '')

        await cargarInfoApartado(ticketRow.id, ticketRow)
      } catch {
        setErrorMsg('Error al consultar datos en tiempo real.')
        setLoadingApartado(false)
      }
    }
  }, [occupiedSeatKeys, seatStatusMap, supabase, cargarInfoApartado])

  // Handler de selección desde el mapa trapezoidal de EXTERNOS (SeatMap):
  // guarda la etiqueta legible y delega en handleSeatClick para abrir el panel
  // de cobro, apartado o liquidación.
  const handleModalSeatSelect = useCallback(
    (seatId: string, seatInfo: SeatSelectionInfo) => {
      setAsientoSeleccionado(seatId)

      const identity = resolveSeatIdentityFromModal(seatInfo)
      if (!identity) {
        setErrorMsg('No se pudo mapear el asiento seleccionado a una zona del auditorio.')
        return
      }

      void handleSeatClick(identity)
    },
    [resolveSeatIdentityFromModal, handleSeatClick],
  )

  // Handler de selección directa desde los grids de ZONA_1…ZONA_4: construye la
  // identidad completa del asiento y abre de inmediato el panel lateral de
  // venta, apartado o liquidación (sin ningún modal flotante).
  const handleZonaSeatSelect = useCallback(
    (zonaCode: string, zoneId: string, seatId: string, info: ZonaSeatSelectionInfo) => {
      setAsientoSeleccionado(seatId)

      void handleSeatClick({
        zoneCode: zonaCode as ZoneCode,
        zoneId,
        bloque: zonaCode,
        fila: info.fila,
        numero: info.numero,
      })
    },
    [handleSeatClick],
  )

  // Selecciona un usuario pre-registrado y lo vincula al formulario de cobro
  const handleSeleccionarUsuario = useCallback((u: TicketSelectResponse) => {
    setUsuarioSeleccionado(u)
    setNombreAlumno(u.nombre || '')
    setEmailAlumno(u.email || '')
    setUsuariosPendientes([])
    setBusqueda('')
  }, [])

  // Desvincula el usuario pre-registrado del formulario
  const handleDeseleccionarUsuario = useCallback(() => {
    setUsuarioSeleccionado(null)
    setNombreAlumno('')
    setEmailAlumno('')
  }, [])

  // Cierra la pantalla de éxito del token y limpia la selección
  const cerrarVentanaToken = useCallback(() => {
    setTokenGenerado(null)
    setSelectedSeat(null)
    setSelectedTicketId(null)
    setModalMode(null)
    setAsientoSeleccionado(null)
  }, [])

  // Cancela el registro de un nuevo asiento
  const cancelarNuevoCobro = useCallback(() => {
    setSelectedSeat(null)
    setModalMode(null)
    setAsientoSeleccionado(null)
  }, [])

  // Regresa desde la pantalla de liquidación
  const regresarLiquidacion = useCallback(() => {
    setSelectedSeat(null)
    setModalMode(null)
  }, [])

  // Realtime Subscriptions
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

            const key = getSeatKey(seat)
            setOccupiedSeatKeys((current) => {
              const next = new Set(current)
              next.add(key)
              return next
            })
            setSeatStatusMap((prev) => ({ ...prev, [key]: (prev[key] ?? 'apartado') as SeatStatus }))

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
  }, [supabase, cargarApartadosPendientes])

  // Buscar Pre-Registros en la Base de Datos
  const handleBuscarPreRegistro = async () => {
    if (!busqueda.trim()) return
    setErrorMsg(null)

    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('id, nombre, email, buyer_id')
        .is('asiento_numero', null)
        .or(`email.ilike.%${busqueda.trim()}%,nombre.ilike.%${busqueda.trim()}%`)
        .limit(5)

      if (error) throw error
      setUsuariosPendientes((data as TicketSelectResponse[]) || [])
      if (!data || data.length === 0) {
        setErrorMsg('No se encontraron usuarios pre-registrados con esos criterios.')
      }
    } catch {
      setErrorMsg('Error al buscar en la base de datos de pre-registros.')
    }
  }

  // Confirmar Acción de Venta Directa o Apartado Inicial
  const handleConfirmarNuevoCobro = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSeat || !selectedZone) return
    setErrorMsg(null)

    if (!nombreAlumno.trim() || !emailAlumno.trim()) {
      setErrorMsg('El nombre y el correo electrónico son obligatorios.')
      return
    }

    startTransition(async () => {
      try {
        const totalAPagar = selectedZone.price ?? 650
        const cobroMonto = metodoRegistro === 'pago' ? totalAPagar : montoApartado

        const res = await cobrarAsientoYGenerarToken(
          {
            zoneId: selectedSeat.zoneId,
            zoneCode: selectedSeat.zoneCode,
            bloque: selectedSeat.bloque,
            fila: selectedSeat.fila,
            numero: selectedSeat.numero,
          },
          cobroMonto,
          nombreAlumno.trim(),
          emailAlumno.trim().toLowerCase(),
          usuarioSeleccionado?.id,
          metodoRegistro,
        )

        if (res.success) {
          setTokenGenerado(res.token ?? 'TOKEN-OK')
          const seatKey = getSeatKey(selectedSeat)
          setOccupiedSeatKeys((current) => {
            const next = new Set(current)
            next.add(seatKey)
            return next
          })
          setSeatStatusMap((prev) => ({
            ...prev,
            [seatKey]: (metodoRegistro === 'apartado' ? 'apartado' : 'completo') as SeatStatus,
          }))

          void cargarApartadosPendientes()

          const { data: tokenStats } = await supabase.from('tokens_canje').select('status')
          if (tokenStats) {
            const tokens = tokenStats as { status: string }[]
            setStats({
              total: tokens.length,
              disponibles: tokens.filter((t) => t.status === 'disponible').length,
              usados: tokens.length - tokens.filter((t) => t.status === 'disponible').length,
            })
          }
        } else {
          setErrorMsg(res.message || 'Ocurrió un error al procesar el asiento.')
        }
      } catch {
        setErrorMsg('Error de red al procesar el cobro.')
      }
    })
  }

  // Confirmar Liquidación de un Asiento Reservado/Apartado
  const handleConfirmarLiquidacion = () => {
    if (!selectedTicketId || !selectedSeat || !infoApartado) {
      setErrorMsg('No se pudo identificar el asiento para liquidar. Vuelve a seleccionarlo.')
      return
    }
    setErrorMsg(null)

    startTransition(async () => {
      try {
        const res = await liquidarRestoAsiento(
          selectedTicketId,
          infoApartado.montoRestante
        )

        if (res.success) {
          setTokenGenerado(res.tokenCode ?? 'TOKEN-LIQ')
          const seatKey = getSeatKey(selectedSeat)
          setSeatStatusMap((prev) => ({
            ...prev,
            [seatKey]: 'completo' as SeatStatus,
          }))

          void cargarApartadosPendientes()

          const { data: tokenStats } = await supabase.from('tokens_canje').select('status')
          if (tokenStats) {
            const tokens = tokenStats as { status: string }[]
            setStats({
              total: tokens.length,
              disponibles: tokens.filter((t) => t.status === 'disponible').length,
              usados: tokens.length - tokens.filter((t) => t.status === 'disponible').length,
            })
          }

          setModalMode(null)
          setSelectedSeat(null)
        } else {
          setErrorMsg(res.message || 'Error al liquidar el apartado.')
        }
      } catch {
        setErrorMsg('Error de comunicación con el servidor al liquidar.')
      }
    })
  }

  const apartadosFiltrados = useMemo(() => {
    if (!filtroNombre.trim()) return apartadosPendientes
    const f = filtroNombre.toLowerCase()
    return apartadosPendientes.filter(
      (r) => r.nombre?.toLowerCase().includes(f) || r.email?.toLowerCase().includes(f),
    )
  }, [apartadosPendientes, filtroNombre])

  const totalPendientes = apartadosPendientes.length
  const totalAdeudo = apartadosPendientes.reduce((acc, r) => acc + r.montoRestante, 0)

  return (
    <div className="grid grid-cols-1 gap-8 xl:grid-cols-3 min-h-screen bg-white dark:bg-[#2a2a2f] text-[#1a1a1a] p-4">
      {/* Columna Izquierda: Mapa del Auditorio */}
      <div className="rounded-3xl border border-[#e5e5e5] bg-[#f5f5f5]/60 p-6 backdrop-blur-xl xl:col-span-2 shadow-sm">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black uppercase tracking-wider text-[#00a354]">
              Taquilla Física y Control de Asientos
            </h2>
            <p className="text-xs text-[#4a4a4a]">
              Haz clic en un asiento disponible para registrar una venta, apartado o cargar un pre-registro.
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className="inline-block rounded-md bg-white dark:bg-[#2a2a2f] border border-[#e5e5e5] px-3 py-1.5 text-xs text-[#4a4a4a] font-medium shadow-sm">
                Rol: <strong className="text-[#1a1a1a]">{assignmentContext.role}</strong> {assignmentContext.unidadAcademicaNombre && `(${assignmentContext.unidadAcademicaNombre})`}
              </span>

              {/* Barra de pestañas de zonas: cada pestaña activa su mapa
                  directamente en pantalla, sin modales ni portales. */}
              <div className="flex flex-wrap items-center gap-2">
                {ZONA_TABS.map((tab) => {
                  const isActive = zonaActiva === tab
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setZonaActiva(tab)}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all duration-150 ${
                        isActive
                          ? 'bg-[#00a354] border-[#00a354] text-white shadow-md'
                          : 'bg-white dark:bg-[#2a2a2f] border-[#e5e5e5] text-[#4a4a4a] hover:border-[#00a354] hover:text-[#00a354]'
                      }`}
                    >
                      {tab === 'EXTERNOS' ? 'Externos' : `Zona ${tab.replace('ZONA_', '')}`}
                    </button>
                  )
                })}
              </div>
            </div>

            {asientoSeleccionado && (
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-lg">
                <span>Asiento asignado:</span>
                <span className="font-mono text-sm bg-emerald-200/60 px-2 py-0.5 rounded text-emerald-950">
                  {asientoSeleccionado}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Mapa interactivo de la zona activa. El clic en cualquier butaca
            dispara de inmediato el panel lateral de venta, apartado o
            liquidación (sin modales flotantes). */}
        <div
          id="taquilla-zona-interaccion"
          className="rounded-2xl bg-white dark:bg-[#2a2a2f] p-4 border border-[#e5e5e5] shadow-inner"
        >
          {zonaActiva === 'EXTERNOS' ? (
            <SeatMap
              occupiedSeats={asientosOcupados}
              onSeatSelect={handleModalSeatSelect}
            />
          ) : zonaActivaRow ? (
            <ZonaGrid
              zoneCode={zonaActiva}
              zoneName={zonaActivaRow.name}
              capacity={zonaActivaRow.capacity}
              occupiedSeats={zonaActivaOcupados}
              seatStatuses={zonaActivaStatuses}
              onSeatSelect={(seatId, info) =>
                handleZonaSeatSelect(zonaActiva, zonaActivaRow.id, seatId, info)
              }
            />
          ) : (
            <div className="py-12 text-center text-sm text-[#4a4a4a]">
              No se encontró la zona <strong>{zonaActiva}</strong> en la tabla{' '}
              <code>zones</code> de Supabase. Verifica su nombre y capacidad.
            </div>
          )}
        </div>

        {/* ─── Panel inferior: Lista de Apartados Pendientes ─── */}
        <ApartadosPendientesPanel
          apartadosFiltrados={apartadosFiltrados}
          totalPendientes={totalPendientes}
          totalAdeudo={totalAdeudo}
          filtroNombre={filtroNombre}
          onFiltroNombreChange={setFiltroNombre}
          loadingApartados={loadingApartados}
          errorApartados={errorApartados}
          isPending={isPending}
          onRecargar={() => void cargarApartadosPendientes()}
          onLiquidar={(row) => void handleLiquidarDesdeTabla(row)}
        />

      {/* Columna Derecha: Panel de Control Dinámico */}
      <PanelCobroLateral
        tokenGenerado={tokenGenerado}
        modalMode={modalMode}
        selectedSeat={selectedSeat}
        selectedTicketId={selectedTicketId}
        selectedZone={selectedZone}
        infoApartado={infoApartado}
        loadingApartado={loadingApartado}
        errorMsg={errorMsg}
        isPending={isPending}
        nombreAlumno={nombreAlumno}
        onNombreAlumnoChange={setNombreAlumno}
        emailAlumno={emailAlumno}
        onEmailAlumnoChange={setEmailAlumno}
        metodoRegistro={metodoRegistro}
        onMetodoRegistroChange={setMetodoRegistro}
        montoApartado={montoApartado}
        onMontoApartadoChange={setMontoApartado}
        busqueda={busqueda}
        onBusquedaChange={setBusqueda}
        usuariosPendientes={usuariosPendientes}
        usuarioSeleccionado={usuarioSeleccionado}
        onSeleccionarUsuario={handleSeleccionarUsuario}
        onDeseleccionarUsuario={handleDeseleccionarUsuario}
        onBuscarPreRegistro={() => void handleBuscarPreRegistro()}
        onConfirmarNuevoCobro={handleConfirmarNuevoCobro}
        onCancelarNuevoCobro={cancelarNuevoCobro}
        tipoPagoLiquidacion={tipoPagoLiquidacion}
        onTipoPagoLiquidacionChange={setTipoPagoLiquidacion}
        onConfirmarLiquidacion={handleConfirmarLiquidacion}
        onRegresarLiquidacion={regresarLiquidacion}
        onCerrarToken={cerrarVentanaToken}
      />
      </div>
    </div>
  )
}