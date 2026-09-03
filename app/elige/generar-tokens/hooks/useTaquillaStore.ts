'use client'

import React, { useState, useTransition, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getSeatKey, ZONE_UUIDS, getZoneUuid } from '@/config/auditorioConfig'
import type { SeatIdentity, ZoneCode } from '@/config/auditorioConfig'
import type { SeatEstatusPago as SeatStatus, AssignmentContext } from '@/components/asientos/types'
import { type SeatSelectionInfo } from '@/components/asientos/zonaExternos'
import { type ZonaSeatSelectionInfo } from '@/components/asientos/ZonaGrid'
import {
  cobrarAsientoYGenerarToken,
  liquidarRestoAsiento,
  getApartadoInfo,
} from '../actions'
import {
  resolveSeatIdentityFromModal,
  buildAsientosOcupados,
  getZonaOcupados,
  getZonaStatuses,
  resolveZoneConfig,
} from '../utils/seatAdapters'
import { useZonasSupabase } from './useZonasSupabase'
import { useApartadosPendientes } from './useApartadosPendientes'
import { useTaquillaRealtime } from './useTaquillaRealtime'
import { PRECIO_POR_BOLETO, ZONA_TABS } from '../types'
import type {
  TaquillaTokensViewProps,
  TaquillaStoreResult,
  TicketSelectResponse,
  ApartadoInfoLocal,
  ApartadoPendienteRow,
  ExtendedZoneConfig,
  ModalMode,
  MetodoRegistro,
  TipoPagoLiquidacion,
    ZonaSupabaseRow,
} from '../types'

export { ZONA_TABS, PRECIO_POR_BOLETO }
export type {
  SeatIdentity,
  ZoneCode,
  SeatStatus,
  AssignmentContext,
  SeatSelectionInfo,
  ZonaSeatSelectionInfo,
  TicketSelectResponse,
  ApartadoInfoLocal,
  ApartadoPendienteRow,
  ExtendedZoneConfig,
  ModalMode,
  MetodoRegistro,
  TipoPagoLiquidacion,
  ZonaSupabaseRow,
}

/**
 * Hook principal de la taquilla de tokens.
 *
 * Centraliza **todo** el estado, los efectos secundarios y los manejadores
 * de la vista `TaquillaTokensView`.  El componente que lo consume se reduce
 * a un grosso render declarativo.
 */
export function useTaquillaStore({
  initialOccupiedSeatKeys,
  initialSeatStatusMap,
  initialStats,
}: TaquillaTokensViewProps): TaquillaStoreResult {
  const supabase = useMemo(() => createClient(), [])
  const [isPending, startTransition] = useTransition()

  // ── Sub-hooks de datos ──────────────────────────────────────────────
  const { zonasSupabase, getZonaRow } = useZonasSupabase(supabase)
  const {
    apartadosPendientes,
    loadingApartados,
    errorApartados,
    cargarApartadosPendientes,
  } = useApartadosPendientes(supabase)

  // ── Estado de zonas ─────────────────────────────────────────────────
  const [zonaActiva, setZonaActiva] = useState<string>('EXTERNOS')

  // ── Estado del mapa ─────────────────────────────────────────────────
  const [occupiedSeatKeys, setOccupiedSeatKeys] = useState<Set<string>>(
    () => new Set(initialOccupiedSeatKeys),
  )
  const [seatStatusMap, setSeatStatusMap] = useState<Record<string, SeatStatus>>(
    initialSeatStatusMap as Record<string, SeatStatus>,
  )

  // ── Asiento / modal seleccionado ────────────────────────────────────
  const [selectedSeat, setSelectedSeat] = useState<SeatIdentity | null>(null)
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)
  const [modalMode, setModalMode] = useState<ModalMode>(null)

  // ── Buscador de pre-registros ───────────────────────────────────────
  const [busqueda, setBusqueda] = useState('')
  const [usuariosPendientes, setUsuariosPendientes] = useState<TicketSelectResponse[]>([])
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<TicketSelectResponse | null>(null)

  // ── Formulario nuevo cobro ──────────────────────────────────────────
  const [nombreAlumno, setNombreAlumno] = useState('')
  const [emailAlumno, setEmailAlumno] = useState('')
  const [metodoRegistro, setMetodoRegistro] = useState<MetodoRegistro>('pago')
  const [montoApartado, setMontoApartado] = useState<number>(350)

  // ── Estadísticas ────────────────────────────────────────────────────
  const [stats, setStats] = useState(initialStats)

  // ── Apartado / liquidación ──────────────────────────────────────────
  const [infoApartado, setInfoApartado] = useState<ApartadoInfoLocal | null>(null)
  const [loadingApartado, setLoadingApartado] = useState(false)
  const [tipoPagoLiquidacion, setTipoPagoLiquidacion] = useState<TipoPagoLiquidacion>('efectivo')

  // ── Lista de apartados pendientes ───────────────────────────────────
  const [filtroNombre, setFiltroNombre] = useState('')

  // ── Feedback ────────────────────────────────────────────────────────
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [tokenGenerado, setTokenGenerado] = useState<string | null>(null)

  // ── Asiento seleccionado (etiqueta legible) ─────────────────────────
  const [asientoSeleccionado, setAsientoSeleccionado] = useState<string | null>(null)

  // ── Estado derivado: asientos ocupados formateados ───────────────────
  const asientosOcupados = useMemo(
    () => buildAsientosOcupados(occupiedSeatKeys),
    [occupiedSeatKeys],
  )

  // ── Estado derivado: zona activa ─────────────────────────────────────
  const zonaActivaRow = useMemo(
    () => (zonaActiva === 'EXTERNOS' ? null : getZonaRow(zonaActiva)),
    [zonaActiva, getZonaRow],
  )
  const zonaActivaOcupados = useMemo<string[]>(
    () => getZonaOcupados(occupiedSeatKeys, zonaActiva),
    [zonaActiva, occupiedSeatKeys],
  )
  const zonaActivaStatuses = useMemo<Record<string, string>>(
    () => (zonaActiva === 'EXTERNOS' ? {} : getZonaStatuses(seatStatusMap, zonaActiva)),
    [zonaActiva, seatStatusMap],
  )

  // ── Estado derivado: zona seleccionada para panel lateral ────────────
  const selectedZone = useMemo(
    (): ExtendedZoneConfig | null => resolveZoneConfig(selectedSeat, zonasSupabase),
    [selectedSeat, zonasSupabase],
  )

  // ── Estado derivado: apartados filtrados ─────────────────────────────
  const apartadosFiltrados = useMemo(() => {
    if (!filtroNombre.trim()) return apartadosPendientes
    const f = filtroNombre.toLowerCase()
    return apartadosPendientes.filter(
      (r) => r.nombre?.toLowerCase().includes(f) || r.email?.toLowerCase().includes(f),
    )
  }, [apartadosPendientes, filtroNombre])

  const totalPendientes = apartadosPendientes.length
  const totalAdeudo = apartadosPendientes.reduce((acc, r) => acc + r.montoRestante, 0)

  // ── Helper: refrescar estadísticas de tokens ────────────────────────
  const refreshTokenStats = useCallback(async () => {
    const { data: tokenStats } = await supabase.from('tokens_canje').select('status')
    if (tokenStats) {
      const tokens = tokenStats as { status: string }[]
      setStats({
        total: tokens.length,
        disponibles: tokens.filter((t) => t.status === 'disponible').length,
        usados: tokens.length - tokens.filter((t) => t.status === 'disponible').length,
      })
    }
  }, [supabase])

  // ── Realtime subscription ───────────────────────────────────────────
    useTaquillaRealtime(supabase, {
    addOccupiedKey: useCallback((key: string) => {
      setOccupiedSeatKeys((current) => {
        const next = new Set(current)
        next.add(key)
        return next
      })
    }, []),
    setStatus: useCallback((key: string, status: SeatStatus) => {
      setSeatStatusMap((prev) => ({ ...prev, [key]: status }))
    }, []),
    cargarApartadosPendientes,
  })

  // ── Cargar información de un asiento ya apartado ─────────────────────
  const cargarInfoApartado = useCallback(
    async (ticketId: string, ticketRow: TicketSelectResponse | null) => {
      setLoadingApartado(true)
      setErrorMsg(null)
      try {
        const res = await getApartadoInfo(ticketId)
        if (res.success && res.info) {
          setInfoApartado(res.info)
          setMontoApartado(res.info.montoRestante)
        } else {
          const zonaRow = selectedSeat ? getZonaRow(selectedSeat.zoneCode) : null
          const defaultPrice = zonaRow?.price ?? PRECIO_POR_BOLETO
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
    },
    [selectedSeat, getZonaRow],
  )

  // ── Handler: abrir liquidación desde la tabla de pendientes ──────────
  const handleLiquidarDesdeTabla = useCallback(
    async (row: ApartadoPendienteRow) => {
      setErrorMsg(null)
      setTokenGenerado(null)
      setInfoApartado(null)
      setSelectedTicketId(null)

      if (!row.zoneCode || !row.bloque || !row.fila || row.numero === null || !row.zoneId) {
        setErrorMsg('No se pudo reconstruir la información del asiento para liquidar.')
        return
      }

      const seat: SeatIdentity = {
        zoneCode: row.zoneCode,
        zoneId: row.zoneId,
        bloque: row.bloque,
        fila: row.fila,
        numero: row.numero,
      }

      setSelectedSeat(seat)
      setSelectedTicketId(row.ticketId)
      setNombreAlumno(row.nombre ?? '')
      setEmailAlumno(row.email ?? '')

      await cargarInfoApartado(row.ticketId, {
        id: row.ticketId,
        nombre: row.nombre,
        email: row.email,
      })

      setModalMode('liquidar')
    },
        [cargarInfoApartado],
  )

  // ── Handler: click en cualquier asiento del mapa ─────────────────────
  const handleSeatClick = useCallback(
    async (seat: SeatIdentity) => {
      setErrorMsg(null)
      setTokenGenerado(null)
      setBusqueda('')
      setUsuariosPendientes([])
      setUsuarioSeleccionado(null)

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
    },
    [occupiedSeatKeys, seatStatusMap, supabase, cargarInfoApartado],
  )

  // ── Handler: selección desde el mapa trapezoidal de EXTERNOS ─────────
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
    [handleSeatClick],
  )

  // ── Handler: selección directa desde grids ZONA_1…ZONA_4 ──────────────
  const handleZonaSeatSelect = useCallback(
    (
      zonaCode: string,
      zoneId: string,
      seatId: string,
      info: ZonaSeatSelectionInfo | SeatSelectionInfo,
    ) => {
      setAsientoSeleccionado(seatId)
      const resolvedZoneId =
        getZoneUuid(zoneId) ||
        getZoneUuid(zonaCode) ||
        getZonaRow(zonaCode)?.id ||
        ZONE_UUIDS[zonaCode.toLowerCase().replace(/[\s_-]/g, '')] ||
        ''
      const bloque =
        'bloque' in info && info.bloque
          ? info.bloque === 'top'
            ? `${zonaCode}-TOP`
            : info.bloque === 'bottom'
              ? `${zonaCode}-INF`
              : info.bloque
          : zonaCode
      void handleSeatClick({
        zoneCode: zonaCode as ZoneCode,
        zoneId: resolvedZoneId,
        bloque,
        fila: info.fila,
        numero: info.numero,
      })
    },
    [handleSeatClick, getZonaRow],
  )

  // ── Handler: seleccionar usuario pre-registrado ──────────────────────
  const handleSeleccionarUsuario = useCallback((u: TicketSelectResponse) => {
    setUsuarioSeleccionado(u)
    setNombreAlumno(u.nombre || '')
    setEmailAlumno(u.email || '')
    setUsuariosPendientes([])
    setBusqueda('')
  }, [])

  // ── Handler: deseleccionar usuario pre-registrado ────────────────────
  const handleDeseleccionarUsuario = useCallback(() => {
    setUsuarioSeleccionado(null)
    setNombreAlumno('')
    setEmailAlumno('')
  }, [])

  // ── Handler: cerrar pantalla de éxito del token ──────────────────────
  const cerrarVentanaToken = useCallback(() => {
    setTokenGenerado(null)
    setSelectedSeat(null)
    setSelectedTicketId(null)
    setModalMode(null)
    setAsientoSeleccionado(null)
  }, [])

  // ── Handler: cancelar registro de nuevo asiento ──────────────────────
  const cancelarNuevoCobro = useCallback(() => {
    setSelectedSeat(null)
    setModalMode(null)
    setAsientoSeleccionado(null)
  }, [])

  // ── Handler: regresar desde liquidación ──────────────────────────────
  const regresarLiquidacion = useCallback(() => {
    setSelectedSeat(null)
    setModalMode(null)
  }, [])

  // ── Handler: buscar pre-registros en Supabase ────────────────────────
  const handleBuscarPreRegistro = useCallback(async () => {
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
  }, [busqueda, supabase])

  // ── Handler: confirmar venta directa o apartado inicial ──────────────
  const handleConfirmarNuevoCobro = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (!selectedSeat || !selectedZone) return
      setErrorMsg(null)
      if (!nombreAlumno.trim() || !emailAlumno.trim()) {
        setErrorMsg('El nombre y el correo electrónico son obligatorios.')
        return
      }
      startTransition(async () => {
        try {
          const zonaRow = selectedSeat ? getZonaRow(selectedSeat.zoneCode) : null
          const totalAPagar = zonaRow?.price ?? PRECIO_POR_BOLETO
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
            await refreshTokenStats()
          } else {
            setErrorMsg(res.message || 'Ocurrió un error al procesar el asiento.')
          }
        } catch {
          setErrorMsg('Error de red al procesar el cobro.')
        }
      })
    },
    [
      selectedSeat,
      selectedZone,
      getZonaRow,
      nombreAlumno,
      emailAlumno,
      metodoRegistro,
      montoApartado,
      usuarioSeleccionado,
      cargarApartadosPendientes,
      refreshTokenStats,
    ],
  )

  // ── Handler: confirmar liquidación de apartado ───────────────────────
  const handleConfirmarLiquidacion = useCallback(() => {
    if (!selectedTicketId || !selectedSeat || !infoApartado) {
      setErrorMsg('No se pudo identificar el asiento para liquidar. Vuelve a seleccionarlo.')
      return
    }
    setErrorMsg(null)
    startTransition(async () => {
      try {
        const res = await liquidarRestoAsiento(selectedTicketId, infoApartado.montoRestante)
        if (res.success) {
          setTokenGenerado(res.tokenCode ?? 'TOKEN-LIQ')
          const seatKey = getSeatKey(selectedSeat)
          setSeatStatusMap((prev) => ({
            ...prev,
            [seatKey]: 'completo' as SeatStatus,
          }))
          void cargarApartadosPendientes()
          await refreshTokenStats()
          setModalMode(null)
          setSelectedSeat(null)
        } else {
          setErrorMsg(res.message || 'Error al liquidar el apartado.')
        }
      } catch {
        setErrorMsg('Error de comunicación con el servidor al liquidar.')
      }
    })
  }, [
    selectedTicketId,
    selectedSeat,
    infoApartado,
    cargarApartadosPendientes,
    refreshTokenStats,
  ])
  return {
    zonaActiva,
    onZonaActivaChange: setZonaActiva,
    occupiedSeatKeys,
    seatStatusMap,
    asientosOcupados,
    selectedSeat,
    selectedTicketId,
    modalMode,
    busqueda,
    usuariosPendientes,
    usuarioSeleccionado,
    nombreAlumno,
    emailAlumno,
    metodoRegistro,
    montoApartado,
    infoApartado,
    loadingApartado,
    tipoPagoLiquidacion,
    apartadosPendientes,
    loadingApartados,
    errorApartados,
    filtroNombre,
    errorMsg,
    tokenGenerado,
    isPending,
    stats,
    asientoSeleccionado,
    zonaActivaRow,
    zonaActivaOcupados,
    zonaActivaStatuses,
    selectedZone,
    apartadosFiltrados,
    totalPendientes,
    totalAdeudo,
    onNombreAlumnoChange: setNombreAlumno,
    onEmailAlumnoChange: setEmailAlumno,
    onMetodoRegistroChange: setMetodoRegistro,
    onMontoApartadoChange: setMontoApartado,
    onBusquedaChange: setBusqueda,
    onFiltroNombreChange: setFiltroNombre,
    onSeleccionarUsuario: handleSeleccionarUsuario,
    onDeseleccionarUsuario: handleDeseleccionarUsuario,
    onBuscarPreRegistro: () => void handleBuscarPreRegistro(),
    onSeleccionarAsiento: handleModalSeatSelect,
    onSeleccionarAsientoCuadro: handleZonaSeatSelect,
    onLiquidarDesdeTabla: (row: ApartadoPendienteRow) => void handleLiquidarDesdeTabla(row),
    onConfirmarNuevoCobro: handleConfirmarNuevoCobro,
    onConfirmarLiquidacion: handleConfirmarLiquidacion,
    onCancelarNuevoCobro: cancelarNuevoCobro,
    onRegresarLiquidacion: regresarLiquidacion,
    onCerrarToken: cerrarVentanaToken,
    onTipoPagoLiquidacionChange: setTipoPagoLiquidacion,
    onRecargarApartados: () => void cargarApartadosPendientes(),
  }
}
