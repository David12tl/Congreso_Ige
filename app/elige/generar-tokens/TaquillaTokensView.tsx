'use client'

import React, { useState, useTransition, useMemo, useCallback, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { createClient } from '@/lib/supabase/client'
import { AuditorioSeatMap, type SeatStatus } from '@/components/asientos/AuditorioSeatMap'
import { getSeatKey, getZoneByCode, type SeatIdentity, type ZoneCode } from '@/config/auditorioConfig'
import {
  cobrarAsientoYGenerarToken,
  liquidarRestoAsiento,
  getApartadoInfo,
} from './actions'
import type { AssignmentContext } from '@/components/asientos/types'
import {
  HiExclamationCircle,
  HiOutlineCheckCircle,
  HiInformationCircle,
  HiClock,
  HiSearch,
  HiUser,
  HiTrash,
  HiClipboardList,
  HiX,
  HiCurrencyDollar,
  HiRefresh,
} from 'react-icons/hi'

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

interface ApartadoInfoLocal {
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

interface TicketSelectResponse {
  id: string
  nombre: string | null
  email: string | null
  buyer_id?: string | null
  type?: string | null
}

interface ApartadoPendienteRow {
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

interface ExtendedZoneConfig {
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

// ─── Componente principal ─────────────────────────────────────────────

export function TaquillaTokensView({
  assignmentContext,
  initialOccupiedSeatKeys,
  initialSeatStatusMap,
  initialStats,
}: TaquillaTokensViewProps) {
  const supabase = useMemo(() => createClient(), [])
  const [isPending, startTransition] = useTransition()

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

  // Zona del Asiento Actual
  const selectedZone = useMemo(() => {
    if (!selectedSeat) return null
    return getZoneByCode(selectedSeat.zoneCode) as ExtendedZoneConfig | undefined
  }, [selectedSeat])

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
  const handleLiquidarDesdeTabla = useCallback(async (row: ApartadoPendienteRow) => {
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
  }, [cargarInfoApartado])

  // Handler al dar click en cualquier asiento del mapa
  const handleSeatClick = useCallback(async (seat: SeatIdentity) => {
    setErrorMsg(null)
    setTokenGenerado(null)
    setBusqueda('')
    setUsuariosPendientes([])
    setUsuarioSeleccionado(null)

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
            <h2 className="text-lg font-black uppercase tracking-wider text-[#00a354]">Taquilla Física y Control de Asientos</h2>
            <p className="text-xs text-[#4a4a4a]">Haz clic en un asiento disponible para registrar una venta, apartado o cargar un pre-registro.</p>
            <span className="mt-2 inline-block rounded-md bg-white dark:bg-[#2a2a2f] border border-[#e5e5e5] px-3 py-1.5 text-xs text-[#4a4a4a] font-medium shadow-sm">
              Rol: <strong className="text-[#1a1a1a]">{assignmentContext.role}</strong> {assignmentContext.unidadAcademicaNombre && `(${assignmentContext.unidadAcademicaNombre})`}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl bg-white dark:bg-[#2a2a2f] p-4 border border-[#e5e5e5] shadow-inner">
          <AuditorioSeatMap
            mode="assign"
            occupiedSeatKeys={occupiedSeatKeys}
            selectedSeatKey={selectedSeat ? getSeatKey(selectedSeat) : null}
            onSeatClick={handleSeatClick}
            seatStatusMap={seatStatusMap}
          />
        </div>

        {/* ─── Panel inferior: Lista de Apartados Pendientes ─── */}
        <div className="mt-6 rounded-2xl border border-amber-500/30 bg-white dark:bg-[#2a2a2f] shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-[#e5e5e5]">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                <HiClipboardList className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-amber-600">Apartados Pendientes</h3>
                <p className="text-[10px] text-[#4a4a4a]">Personas que aún deben liquidar el resto de su asiento.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-[9px] uppercase tracking-widest text-[#4a4a4a] font-bold">Pendientes</p>
                <p className="text-lg font-black text-amber-600 leading-none">{totalPendientes}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] uppercase tracking-widest text-[#4a4a4a] font-bold">Adeudo Total</p>
                <p className="text-lg font-black text-rose-600 leading-none">${totalAdeudo.toLocaleString('es-MX')} MXN</p>
              </div>
              <button
                type="button"
                onClick={() => void cargarApartadosPendientes()}
                className="bg-[#f5f5f5] hover:bg-[#e5e5e5] border border-[#e5e5e5] text-[#1a1a1a] rounded-lg p-2 transition shadow-sm"
                title="Refrescar lista"
              >
                <HiRefresh className={`h-4 w-4 ${loadingApartados ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {errorApartados && (
            <div className="m-4 bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2 text-[11px] text-red-600">
              <HiExclamationCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorApartados}</span>
            </div>
          )}

          <div className="p-4">
            <div className="mb-3 flex items-center gap-2 bg-[#f5f5f5] border border-[#e5e5e5] rounded-xl px-3 py-2">
              <HiSearch className="w-4 h-4 text-[#4a4a4a]" />
              <input
                type="text"
                value={filtroNombre}
                onChange={(e) => setFiltroNombre(e.target.value)}
                placeholder="Filtrar por nombre o correo..."
                className="flex-1 bg-transparent text-xs text-[#1a1a1a] focus:outline-none placeholder:text-[#4a4a4a]/60"
              />
              {filtroNombre && (
                <button
                  type="button"
                  onClick={() => setFiltroNombre('')}
                  className="text-[#4a4a4a] hover:text-[#1a1a1a]"
                >
                  <HiX className="w-3 h-3" />
                </button>
              )}
            </div>

            {loadingApartados && apartadosPendientes.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-8 h-8 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin mx-auto mb-3" />
                <p className="text-xs text-[#4a4a4a] font-mono">Cargando lista de apartados pendientes...</p>
              </div>
            ) : apartadosFiltrados.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-[#e5e5e5] rounded-xl">
                <HiOutlineCheckCircle className="mx-auto h-8 w-8 text-[#00a354]/40 mb-2" />
                <p className="text-xs font-bold uppercase tracking-wider text-[#4a4a4a]">
                  {totalPendientes === 0 ? '¡No hay apartados pendientes!' : 'Sin coincidencias para el filtro.'}
                </p>
                {totalPendientes === 0 && (
                  <p className="mt-1 text-[11px] text-[#4a4a4a]/70">Todos los asientos apartados han sido liquidados.</p>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-[#e5e5e5]">
                <table className="w-full text-[11px]">
                  <thead className="bg-[#f5f5f5] border-b border-[#e5e5e5] text-[#4a4a4a] uppercase tracking-wider text-[9px]">
                    <tr>
                      <th className="px-3 py-2.5 text-left font-black">Alumno</th>
                      <th className="px-3 py-2.5 text-left font-black">Correo</th>
                      <th className="px-3 py-2.5 text-left font-black">Asiento</th>
                      <th className="px-3 py-2.5 text-right font-black">Abonado</th>
                      <th className="px-3 py-2.5 text-right font-black">Restante</th>
                      <th className="px-3 py-2.5 text-center font-black">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e5e5]">
                    {apartadosFiltrados.map((row) => (
                      <tr key={row.ticketId} className="hover:bg-[#f5f5f5]/30 transition">
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center font-black text-[10px] shrink-0">
                              {row.nombre?.charAt(0).toUpperCase() || '?'}
                            </div>
                            <span className="font-bold text-[#1a1a1a] truncate max-w-[140px]" title={row.nombre ?? ''}>
                              {row.nombre || '—'}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-[#4a4a4a] font-mono text-[10px] truncate max-w-[180px]" title={row.email ?? ''}>
                          {row.email || '—'}
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex flex-col">
                            <span className="text-[#1a1a1a] font-black">
                              {row.zoneCode} · {row.bloque}{row.fila}{row.numero}
                            </span>
                            <span className="text-[#4a4a4a] text-[9px]">
                              Bloque {row.bloque} · Fila {row.fila} · Num {row.numero}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <span className="text-[#00a354] font-black">${row.totalAbonado.toLocaleString('es-MX')}</span>
                          <span className="text-[#4a4a4a] text-[9px] block">de ${row.total.toLocaleString('es-MX')}</span>
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <span className="text-rose-600 font-black">${row.montoRestante.toLocaleString('es-MX')}</span>
                          <span className="text-[#4a4a4a] text-[9px] block">MXN</span>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => void handleLiquidarDesdeTabla(row)}
                            disabled={isPending}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 text-white font-black uppercase tracking-wider text-[10px] px-3 py-1.5 hover:opacity-90 disabled:opacity-50 transition shadow-sm"
                          >
                            <HiCurrencyDollar className="w-3 h-3" />
                            Liquidar Saldo
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Columna Derecha: Panel de Control Dinámico */}
      <div className="space-y-6">
        {tokenGenerado ? (
          /* PANTALLA DE ÉXITO */
          <div className="rounded-3xl border border-[#00a354]/30 bg-white dark:bg-[#2a2a2f] p-6 text-center shadow-md animate-fadeIn">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#00a354]/10 text-[#00a354]">
              <HiOutlineCheckCircle className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-sm font-black uppercase tracking-wider text-[#00a354]">
              {metodoRegistro === 'apartado' && modalMode === 'nuevo' ? '¡Apartado Registrado!' : '¡Pago Procesado Exitosamente!'}
            </h3>
            <p className="mt-1 text-xs text-[#4a4a4a]">Proporciona este código de acceso al alumno:</p>

            <div className="mx-auto my-5 inline-block rounded-xl border border-[#00a354]/20 bg-[#00a354]/5 px-6 py-4">
              <p className="text-[9px] font-bold uppercase tracking-widest text-[#00a354] mb-1">Token de Inscripción</p>
              <p className="text-4xl font-black tracking-wider text-[#1a1a1a]">
                {tokenGenerado}
              </p>
            </div>
            
            <div className="mx-auto my-5 inline-block rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <QRCodeSVG
                value={tokenGenerado}
                size={160}
                bgColor="#ffffff"
                fgColor="#0f172a"
                level="H"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                setTokenGenerado(null)
                setSelectedSeat(null)
                setSelectedTicketId(null)
                setModalMode(null)
              }}
              className="mt-5 w-full rounded-xl bg-[#1a1a1a] py-3 text-xs font-bold text-white hover:bg-[#4a4a4a] transition"
            >
              Cerrar Ventana
            </button>
          </div>
        ) : modalMode === 'nuevo' && selectedSeat && selectedZone ? (
          /* REGISTRAR UN NUEVO ASIENTO */
          <div className="rounded-3xl border border-[#e5e5e5] bg-[#f5f5f5]/60 p-6 backdrop-blur-xl shadow-sm animate-fadeIn">
            <div className="mb-4 border-b border-[#e5e5e5] pb-3">
              <span className="inline-block rounded-full bg-[#00a354]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#00a354]">
                Selección Activa
              </span>
              <h3 className="mt-1 text-sm font-black uppercase text-[#1a1a1a]">
                Zona {selectedZone.name} — Bloque {selectedSeat.bloque} Fila {selectedSeat.fila} Num {selectedSeat.numero}
              </h3>
              <p className="text-[11px] text-[#4a4a4a] mt-0.5">Precio Neto: <span className="text-[#00a354] font-bold">${selectedZone.price} MXN</span></p>
            </div>

            {errorMsg && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2 text-[11px] text-red-600">
                <HiExclamationCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* BUSCADOR DE PRE-REGISTROS */}
            <div className="mb-4 bg-white dark:bg-[#2a2a2f] p-3 rounded-xl border border-[#e5e5e5] shadow-sm">
              <label className="block text-[10px] font-black uppercase tracking-widest text-[#00a354] mb-1.5">
                ¿Tiene Pre-Registro? Buscar Usuario
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar por Correo o Nombre..."
                  className="flex-1 bg-[#f5f5f5] border border-[#e5e5e5] rounded-lg px-3 py-1.5 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#00a354]"
                />
                <button
                  type="button"
                  onClick={handleBuscarPreRegistro}
                  className="bg-[#1a1a1a] text-white px-3 py-1.5 rounded-lg font-bold text-xs hover:bg-[#4a4a4a] transition flex items-center gap-1"
                >
                  <HiSearch className="w-3 h-3" /> Buscar
                </button>
              </div>

              {usuariosPendientes.length > 0 && (
                <div className="mt-2 max-h-32 overflow-y-auto border border-[#e5e5e5] bg-white dark:bg-[#2a2a2f] rounded-lg divide-y divide-[#e5e5e5] text-[11px]">
                  {usuariosPendientes.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        setUsuarioSeleccionado(u)
                        setNombreAlumno(u.nombre || '')
                        setEmailAlumno(u.email || '')
                        setUsuariosPendientes([])
                        setBusqueda('')
                      }}
                      className="w-full text-left px-2.5 py-2 hover:bg-[#f5f5f5] transition flex justify-between items-center"
                    >
                      <div className="truncate pr-2">
                        <span className="font-bold text-[#1a1a1a] block truncate">{u.nombre}</span>
                        <span className="text-[#4a4a4a] font-mono text-[10px] block truncate">{u.email}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {usuarioSeleccionado && (
                <div className="mt-2 bg-[#00a354]/10 border border-[#00a354]/20 rounded-lg p-2 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5 text-[#00a354] truncate">
                    <HiUser className="w-4 h-4 shrink-0" />
                    <p className="truncate">
                      Vinculado: <span className="font-bold text-[#1a1a1a]">{usuarioSeleccionado.nombre}</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setUsuarioSeleccionado(null)
                      setNombreAlumno('')
                      setEmailAlumno('')
                    }}
                    className="text-red-600 hover:text-red-500 p-1"
                  >
                    <HiTrash className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {/* FORMULARIO DE COBRO */}
            <form onSubmit={handleConfirmarNuevoCobro} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#4a4a4a] mb-1">Nombre del Asistente</label>
                <input
                  type="text"
                  required
                  value={nombreAlumno}
                  onChange={(e) => setNombreAlumno(e.target.value)}
                  className="w-full bg-white dark:bg-[#2a2a2f] border border-[#e5e5e5] rounded-xl px-4 py-2 text-[#1a1a1a] focus:outline-none focus:border-[#00a354]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#4a4a4a] mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  value={emailAlumno}
                  onChange={(e) => setEmailAlumno(e.target.value)}
                  className="w-full bg-white dark:bg-[#2a2a2f] border border-[#e5e5e5] rounded-xl px-4 py-2 text-[#1a1a1a] focus:outline-none focus:border-[#00a354]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#4a4a4a] mb-1.5">Esquema de Adquisición</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMetodoRegistro('pago')}
                    className={`p-2.5 rounded-xl font-bold border transition text-center ${metodoRegistro === 'pago' ? 'bg-[#00a354]/10 border-[#00a354] text-[#00a354]' : 'bg-white dark:bg-[#2a2a2f] border-[#e5e5e5] text-[#4a4a4a]'}`}
                  >
                    Pago Total
                  </button>
                  <button
                    type="button"
                    onClick={() => setMetodoRegistro('apartado')}
                    className={`p-2.5 rounded-xl font-bold border transition text-center ${metodoRegistro === 'apartado' ? 'bg-amber-500/10 border-amber-500 text-amber-600' : 'bg-white dark:bg-[#2a2a2f] border-[#e5e5e5] text-[#4a4a4a]'}`}
                  >
                    Dejar Apartado
                  </button>
                </div>
              </div>

              {metodoRegistro === 'apartado' && (
                <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-3 space-y-2 animate-fadeIn">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-amber-600">Monto del Anticipo (MXN)</label>
                  <input
                    type="number"
                    min={200}
                    max={(selectedZone.price ?? 650) - 50}
                    value={montoApartado}
                    onChange={(e) => setMontoApartado(Number(e.target.value))}
                    className="w-full bg-white dark:bg-[#2a2a2f] border border-amber-300 rounded-lg px-3 py-1.5 text-[#1a1a1a] focus:outline-none"
                  />
                  <p className="text-[10px] text-[#4a4a4a]">Monto Restante: <span className="text-[#1a1a1a] font-bold">${(selectedZone.price ?? 650) - montoApartado} MXN</span></p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setSelectedSeat(null); setModalMode(null) }}
                  className="w-1/3 bg-[#f5f5f5] border border-[#e5e5e5] text-[#1a1a1a] rounded-xl font-bold py-3 hover:bg-[#e5e5e5] transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 bg-gradient-to-r from-[#00a354] to-[#00a34d] text-white font-black uppercase tracking-wider rounded-xl py-3 hover:opacity-90 disabled:opacity-50 transition"
                >
                  {isPending ? 'Procesando...' : metodoRegistro === 'apartado' ? 'Registrar Apartado' : 'Completar Inscripción'}
                </button>
              </div>
            </form>
          </div>
        ) : modalMode === 'liquidar' && selectedSeat && selectedTicketId && infoApartado ? (
          /* LIQUIDACIÓN DE UN APARTADO EXISTENTE */
          <div className="rounded-3xl border border-amber-500/30 bg-[#f5f5f5]/60 p-6 backdrop-blur-xl shadow-sm animate-fadeIn">
            <div className="mb-4 border-b border-amber-500/20 pb-3">
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-600">
                <HiClock className="w-3 h-3" /> Asiento Apartado
              </span>
              <h3 className="mt-1 text-sm font-black uppercase text-[#1a1a1a]">
                Bloque {selectedSeat.bloque} — Fila {selectedSeat.fila} Num {selectedSeat.numero}
              </h3>
            </div>

            <div className="bg-white dark:bg-[#2a2a2f] rounded-xl p-4 border border-[#e5e5e5] space-y-2.5 text-xs mb-4 shadow-sm">
              <div>
                <p className="text-[10px] text-[#4a4a4a] uppercase tracking-widest font-bold">Asistente</p>
                <p className="text-[#1a1a1a] font-bold text-sm">{infoApartado.nombre || '—'}</p>
                <p className="text-[#4a4a4a] font-mono text-[11px]">{infoApartado.email || '—'}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 border-t border-[#e5e5e5] pt-2 text-center">
                <div className="bg-[#f5f5f5] p-2 rounded-lg border border-[#e5e5e5]">
                  <p className="text-[9px] text-[#4a4a4a] uppercase font-bold">Abonado</p>
                  <p className="text-[#00a354] font-black text-sm">${infoApartado.totalAbonado} MXN</p>
                </div>
                <div className="bg-amber-500/5 p-2 rounded-lg border border-amber-500/20">
                  <p className="text-[9px] text-amber-600 uppercase font-bold">Saldo Restante</p>
                  <p className="text-[#1a1a1a] font-black text-sm">${infoApartado.montoRestante} MXN</p>
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 text-[11px] text-red-600 flex items-start gap-2">
                <HiExclamationCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#4a4a4a] mb-1.5">Método para Liquidar Saldo</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTipoPagoLiquidacion('efectivo')}
                    className={`p-2 text-xs font-bold border transition text-center rounded-xl ${tipoPagoLiquidacion === 'efectivo' ? 'bg-[#00a354]/10 border-[#00a354] text-[#00a354]' : 'bg-white dark:bg-[#2a2a2f] border-[#e5e5e5] text-[#4a4a4a]'}`}
                  >
                    Efectivo
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipoPagoLiquidacion('transferencia')}
                    className={`p-2 text-xs font-bold border transition text-center rounded-xl ${tipoPagoLiquidacion === 'transferencia' ? 'bg-purple-50 border-purple-200 text-purple-600' : 'bg-white dark:bg-[#2a2a2f] border-[#e5e5e5] text-[#4a4a4a]'}`}
                  >
                    Transferencia
                  </button>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => { setSelectedSeat(null); setModalMode(null) }}
                  className="w-1/3 bg-[#f5f5f5] border border-[#e5e5e5] text-[#1a1a1a] rounded-xl font-bold py-3 text-xs hover:bg-[#e5e5e5] transition"
                >
                  Regresar
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={handleConfirmarLiquidacion}
                  className="flex-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-black uppercase tracking-wider text-xs rounded-xl py-3 hover:opacity-90 transition shadow-md"
                >
                  {isPending ? 'Liquidando...' : `Liquidar $${infoApartado.montoRestante} MXN`}
                </button>
              </div>
            </div>
          </div>
        ) : loadingApartado ? (
          /* LOADING APARTADO */
          <div className="rounded-3xl border border-[#e5e5e5] bg-[#f5f5f5]/40 p-8 text-center backdrop-blur-xl">
            <div className="w-8 h-8 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin mx-auto mb-3" />
            <p className="text-xs text-[#4a4a4a] font-mono">Consultando historial de abonos y pre-registros...</p>
          </div>
        ) : (
          /* PANEL VACÍO */
          <div className="rounded-3xl border border-dashed border-[#e5e5e5] bg-[#f5f5f5]/10 p-8 text-center shadow-inner">
            {errorMsg && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 text-[11px] text-red-600 flex items-start gap-2 text-left">
                <HiExclamationCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}
            <HiInformationCircle className="mx-auto h-8 w-8 text-[#4a4a4a]/40 mb-2" />
            <p className="text-xs font-bold uppercase tracking-wider text-[#4a4a4a]">Monitoreo de Asientos</p>
            <p className="mt-1 text-[11px] text-[#4a4a4a]/70">Selecciona cualquier asiento en el mapa del teatro para desplegar los controles de taquilla física, buscador de pre-registros y cobro.</p>
          </div>
        )}
      </div>
    </div>
  )
}