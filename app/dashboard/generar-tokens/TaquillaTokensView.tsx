'use client'

import React, { useState, useTransition, useMemo, useCallback, useEffect } from 'react'
import { createClient } from '@/src/lib/supabase/client'
import { AuditorioSeatMap, type SeatStatus } from '@/src/components/asientos/AuditorioSeatMap'
import { auditorioConfig, getSeatKey, getZoneByCode, type SeatIdentity, type ZoneCode } from '@/src/config/auditorioConfig'
import { createManualSeatTicket, confirmarPagoTicket, generarTokensMultiples } from './actions'
import type { AssignmentContext, UnidadAcademicaOption } from '@/src/components/asientos/types'
import {
  HiCheckCircle,
  HiExclamationCircle,
  HiOutlineCash,
  HiOutlineCheckCircle,
} from 'react-icons/hi'

// ─── Tipos ────────────────────────────────────────────────────────────

type MultiSelectionMap = Record<string, SeatIdentity>

type ViewMode = 'asignacion' | 'taquilla'

interface TicketInsertPayload {
  event_id?: string | null
  zone_id?: string | null
  asiento_zona?: string | null
  asiento_bloque?: string | null
  asiento_fila?: string | null
  asiento_numero?: number | null
}

interface TaquillaTokensViewProps {
  assignmentContext: AssignmentContext
  initialOccupiedSeatKeys: string[]
  initialSeatStatusMap: Record<string, string>
  initialStats: { total: number; disponibles: number; usados: number }
}

interface FormState {
  nombre: string
  email: string
  matricula: string
  carrera: string
  semestre: string
  telefono: string
  unidadAcademicaId: string
}

const emptyForm: FormState = {
  nombre: '',
  email: '',
  matricula: '',
  carrera: '',
  semestre: '',
  telefono: '',
  unidadAcademicaId: '',
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

  // Selección múltiple (taquilla)
  const [multiSelected, setMultiSelected] = useState<MultiSelectionMap>({})
  const multiSelectedCount = Object.keys(multiSelected).length

  // Selección simple (asignación manual)
  const [selectedSeat, setSelectedSeat] = useState<SeatIdentity | null>(null)
  const [selectedTicketInfo, setSelectedTicketInfo] = useState<{
    ticketId: string
    nombre: string
    estatusPago: string
  } | null>(null)

  // Formulario de asignación
  const [form, setForm] = useState<FormState>(() => ({
    ...emptyForm,
    unidadAcademicaId: assignmentContext.unidadAcademicaId?.toString() ?? '',
  }))

  // Caja y tokens
  const [montoAbonoGlobal, setMontoAbonoGlobal] = useState<number>(0)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [tokensGenerados, setTokensGenerados] = useState<string[]>([])
  const [mostrarModalTokens, setMostrarModalTokens] = useState(false)
  const [isPaymentMode, setIsPaymentMode] = useState(false)
  const [tokenGenerado, setTokenGenerado] = useState<string | null>(null)
  const [message, setMessage] = useState<{ kind: 'success' | 'error'; text: string } | null>(null)

  // Estadísticas
  const [stats, setStats] = useState(initialStats)

  // Vista activa
  const [viewMode, setViewMode] = useState<ViewMode>('taquilla')

  const PRECIO_POR_BOLETO = 650
  const costoTotalTeorico = multiSelectedCount * PRECIO_POR_BOLETO
  const lockedUnidad = assignmentContext.role === 'encargado'

  // ─── Realtime subscriptions ──────────────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel('taquilla-tokens-realtime')
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
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || error) {
          console.error('[TaquillaTokensView] Realtime error:', status, error)
        }
      })

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [supabase])

  // ─── Manejador de clic en asiento ────────────────────────────────────
  const handleSeatClick = useCallback(async (seat: SeatIdentity) => {
    const key = getSeatKey(seat)
    const status = seatStatusMap[key]
    const occupied = occupiedSeatKeys.has(key)

    // Si NO estamos en modo taquilla, manejar como asignación simple
    if (viewMode === 'asignacion') {
      if (occupied) {
        // Si está ocupado con estatus especial, mostrar modal de pago
        if (status === 'pre-registro' || status === 'pendiente') {
          setIsPaymentMode(true)
          setMessage(null)

          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const query = (supabase.from('tickets') as any)
              .select('id, nombre, estatus_pago')
              .eq('asiento_zona', seat.zoneCode)
              .eq('asiento_bloque', seat.bloque)
              .eq('asiento_fila', seat.fila)
              .eq('asiento_numero', seat.numero)

            const { data } = await query.maybeSingle()

            if (data) {
              const ticketData = data as { id: string; nombre: string | null; estatus_pago: string | null }
              setSelectedTicketInfo({
                ticketId: ticketData.id,
                nombre: ticketData.nombre || 'Usuario',
                estatusPago: ticketData.estatus_pago || 'pre-registro',
              })
            }
          } catch (err) {
            console.error('Error al buscar info del ticket:', err)
          }

          setSelectedSeat(seat)
          return
        }

        // Si está pagado, no hacer nada
        if (status === 'pagado') return

        // Si está ocupado sin estatus especial, no hacer nada
        if (occupied) return
      }

      // Libre: mostrar formulario
      setIsPaymentMode(false)
      setSelectedSeat(seat)
      setSelectedTicketInfo(null)
      setMessage(null)
      setForm((current) => ({
        ...emptyForm,
        unidadAcademicaId: current.unidadAcademicaId || assignmentContext.unidadAcademicaId?.toString() || '',
      }))
      return
    }

    // Modo taquilla: toggle multi-selección
    setMultiSelected((prev) => {
      const next = { ...prev }
      if (next[key]) {
        delete next[key]
      } else {
        if (!occupied) {
          next[key] = seat
        }
      }
      return next
    })
  }, [viewMode, occupiedSeatKeys, seatStatusMap, supabase, assignmentContext.unidadAcademicaId])

  // ─── Confirmar pago de ticket (pre-registro) ─────────────────────────
  const handleConfirmPayment = useCallback(() => {
    if (!selectedSeat || !selectedTicketInfo) return

    startTransition(async () => {
      const result = await confirmarPagoTicket(selectedTicketInfo.ticketId)

      if (!result.success) {
        setMessage({ kind: 'error', text: result.message })
        return
      }

      const key = getSeatKey(selectedSeat)
      setSeatStatusMap((prev) => ({ ...prev, [key]: 'pagado' }))

      if (result.tokenCode) {
        setTokenGenerado(result.tokenCode)
      }

      setMessage({ kind: 'success', text: result.message })
      setSelectedSeat(null)
      setSelectedTicketInfo(null)
      setIsPaymentMode(false)
    })
  }, [selectedSeat, selectedTicketInfo])

  // ─── Envío de formulario de asignación ───────────────────────────────
  const handleSubmit = useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedSeat) return

    startTransition(async () => {
      const result = await createManualSeatTicket({
        ...selectedSeat,
        nombre: form.nombre,
        email: form.email,
        matricula: form.matricula,
        carrera: form.carrera,
        semestre: form.semestre,
        telefono: form.telefono,
        unidadAcademicaId: form.unidadAcademicaId ? Number(form.unidadAcademicaId) : null,
      })

      if (!result.success) {
        setMessage({ kind: 'error', text: result.message })
        window.alert(result.message)
        return
      }

      setOccupiedSeatKeys((current) => {
        const next = new Set(current)
        next.add(getSeatKey(selectedSeat))
        return next
      })
      setSelectedSeat(null)
      setForm({
        ...emptyForm,
        unidadAcademicaId: assignmentContext.unidadAcademicaId?.toString() ?? '',
      })
      setMessage({ kind: 'success', text: result.message })
    })
  }, [selectedSeat, form, assignmentContext.unidadAcademicaId])

  // ─── Generar tokens y cobro ──────────────────────────────────────────
  const handleGenerarTokens = useCallback(() => {
    if (multiSelectedCount === 0) {
      setErrorMsg('Por favor, selecciona al menos un asiento en el mapa.')
      return
    }

    if (montoAbonoGlobal < costoTotalTeorico) {
      setErrorMsg(`El monto recibido ($${montoAbonoGlobal.toFixed(2)}) es insuficiente. Se requieren $${costoTotalTeorico.toFixed(2)} MXN.`)
      return
    }

    startTransition(async () => {
      try {
        setErrorMsg(null)
        setSuccessMsg(null)

        const asientosArray = Object.values(multiSelected)
        const asientosPayload = asientosArray.map((seat) => ({
          zoneId: seat.zoneId,
          zoneCode: seat.zoneCode,
          bloque: seat.bloque,
          fila: seat.fila,
          numero: seat.numero,
        }))

        const result = await generarTokensMultiples(asientosPayload, montoAbonoGlobal)

        if (!result.success) {
          setErrorMsg(result.message)
          return
        }

        if (result.tokens && result.tokens.length > 0) {
          setTokensGenerados(result.tokens)
          setMostrarModalTokens(true)
        }

        setMultiSelected({})
        setMontoAbonoGlobal(0)
        setSuccessMsg(result.message)

        // Recargar estadísticas
        const { data } = await supabase.from('tokens_canje').select('status')
        if (data) {
          const tokens = data as { status: string }[]
          setStats({
            total: tokens.length,
            disponibles: tokens.filter((t) => t.status === 'disponible').length,
            usados: tokens.length - tokens.filter((t) => t.status === 'disponible').length,
          })
        }
      } catch (err) {
        console.error('Error general:', err)
        setErrorMsg('Ocurrió un error inesperado al procesar la solicitud.')
      }
    })
  }, [multiSelectedCount, multiSelected, montoAbonoGlobal, costoTotalTeorico, supabase])

  // ─── Badge de estatus ────────────────────────────────────────────────
  const badgeVisual = useMemo(() => {
    if (multiSelectedCount === 0) return { texto: 'ESPERANDO LUGARES', clase: 'bg-slate-800 text-slate-400 border-slate-700/50' }
    if (montoAbonoGlobal <= 0) return { texto: 'SIN PAGO', clase: 'bg-red-500/10 text-red-400 border-red-500/20' }
    if (montoAbonoGlobal >= costoTotalTeorico) return { texto: 'COMPLETADO', clase: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' }
    return { texto: 'PAGO FALTANTE', clase: 'bg-amber-500/10 text-amber-400 border-amber-500/20' }
  }, [multiSelectedCount, montoAbonoGlobal, costoTotalTeorico])

  const selectedUnidadLabel = useMemo(() => {
    if (lockedUnidad) {
      return assignmentContext.unidadAcademicaNombre ?? 'Unidad no asignada'
    }
    const selectedId = Number(form.unidadAcademicaId)
    return assignmentContext.unidades.find((unidad) => unidad.id === selectedId)?.nombre ?? 'Selecciona una UA'
  }, [assignmentContext, form.unidadAcademicaId, lockedUnidad])

  const multiSeatsList = useMemo(() => {
    return Object.entries(multiSelected).map(([key, seat]) => {
      const zone = getZoneByCode(seat.zoneCode)
      return `${zone?.nombre || seat.zoneCode}-${seat.fila}${seat.numero}`
    }).sort()
  }, [multiSelected])

  const selectedZone = selectedSeat ? getZoneByCode(selectedSeat.zoneCode) : null

  return (
    <div className="min-h-screen text-white">
      {/* Encabezado */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-black uppercase tracking-wider text-emerald-400">
            Taquilla y Tokens
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Cobro de asientos, asignación manual y generación de tokens
          </p>
        </div>

        {/* Selector de modo */}
        <div className="flex rounded-lg border border-white/10 overflow-hidden">
          <button
            type="button"
            onClick={() => { setViewMode('taquilla'); setSelectedSeat(null); setMultiSelected({}) }}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
              viewMode === 'taquilla'
                ? 'bg-emerald-500/20 text-emerald-300 border-r border-white/10'
                : 'bg-transparent text-slate-400 hover:text-white border-r border-white/10'
            }`}
          >
            🎟️ Taquilla
          </button>
          <button
            type="button"
            onClick={() => { setViewMode('asignacion'); setMultiSelected({}) }}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
              viewMode === 'asignacion'
                ? 'bg-cyan-500/20 text-cyan-300'
                : 'bg-transparent text-slate-400 hover:text-white'
            }`}
          >
            ✏️ Asignar
          </button>
        </div>

        {/* Badge de permiso */}
        <div className="rounded-md border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
          <span className="block text-[10px] font-black uppercase tracking-widest text-slate-500">Permiso</span>
          <span className="font-bold uppercase text-white">{assignmentContext.role}</span>
          {selectedUnidadLabel && (
            <span className="ml-2 text-slate-400">{selectedUnidadLabel}</span>
          )}
        </div>
      </div>

      {/* Mensajes globales */}
      {errorMsg && (
        <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
          <HiExclamationCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-xs text-red-400 font-medium">{errorMsg}</p>
        </div>
      )}
      {successMsg && (
        <div className="mb-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3">
          <HiCheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <p className="text-xs text-emerald-400 font-medium">{successMsg}</p>
        </div>
      )}

      {/* LAYOUT PRINCIPAL: DOS COLUMNAS */}
      <div className="flex flex-col xl:flex-row gap-6">
        {/* ─── COLUMNA IZQUIERDA: MAPA ────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          <AuditorioSeatMap
            mode={viewMode === 'asignacion' ? 'assign' : 'assign'}
            occupiedSeatKeys={occupiedSeatKeys}
            selectedSeatKey={viewMode === 'asignacion' && selectedSeat ? getSeatKey(selectedSeat) : null}
            onSeatClick={handleSeatClick}
            seatStatusMap={seatStatusMap}
          />

          {viewMode === 'taquilla' && (
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
              <span className="inline-block h-3 w-3 rounded-sm bg-emerald-500/30 border border-emerald-400/50" />
              <span>Modo taquilla: haz clic en asientos libres para seleccionarlos</span>
            </div>
          )}
        </div>

        {/* ─── COLUMNA DERECHA: PANEL DE CONTROL ────────────────────────── */}
        <div className="w-full xl:w-[420px] shrink-0 space-y-4">

          {/* ESTADÍSTICAS */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-900 border border-white/5 rounded-xl p-3 text-center">
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Totales</p>
              <p className="text-lg font-black mt-1 text-white">{stats.total}</p>
            </div>
            <div className="bg-slate-900 border border-emerald-500/20 rounded-xl p-3 text-center">
              <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider">Disponibles</p>
              <p className="text-lg font-black mt-1 text-emerald-400">{stats.disponibles}</p>
            </div>
            <div className="bg-slate-900 border border-white/5 rounded-xl p-3 text-center">
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Usados</p>
              <p className="text-lg font-black mt-1 text-cyan-400">{stats.usados}</p>
            </div>
          </div>

          {/* MODO TAQUILLA: Panel de caja y tokens */}
          {viewMode === 'taquilla' && (
            <div className="bg-slate-900 border border-white/5 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="text-center space-y-1 border-b border-white/5 pb-3">
                <h2 className="text-xs font-black uppercase tracking-widest text-gray-300">
                  Confirmación de Registro y Caja
                </h2>
                <p className="text-[10px] text-gray-500">
                  Cada boleto: <span className="text-white font-bold">$650.00 MXN</span>
                </p>
              </div>

              {/* Contador y total */}
              <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3 rounded-xl border border-white/5 text-xs">
                <div>
                  <span className="text-gray-400 block">Asientos marcados:</span>
                  <span className="text-sm font-black text-white">{multiSelectedCount} u.</span>
                </div>
                <div className="text-right">
                  <span className="text-gray-400 block">Total a liquidar:</span>
                  <span className="text-sm font-black text-emerald-400">
                    ${costoTotalTeorico.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                  </span>
                </div>
              </div>

              {/* Input de efectivo */}
              <div className="flex flex-col gap-2">
                <label htmlFor="monto_abonado" className="text-xs font-bold text-gray-300 tracking-wide">
                  Monto total recibido en caja para esta operación ($):
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-gray-500 font-bold text-sm">$</span>
                  <input
                    id="monto_abonado"
                    type="number"
                    min="0"
                    step="0.01"
                    disabled={multiSelectedCount === 0}
                    value={montoAbonoGlobal === 0 ? '' : montoAbonoGlobal}
                    onChange={(e) => setMontoAbonoGlobal(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    placeholder="Ingresa la cantidad que abona el cliente..."
                  />
                </div>
              </div>

              {/* Badge de estatus */}
              <div className="flex justify-between items-center bg-slate-950/40 p-3 rounded-xl border border-white/5">
                <div className="flex flex-col text-xs">
                  <span className="text-gray-400 font-medium">Estatus de emisión</span>
                  {montoAbonoGlobal > 0 && montoAbonoGlobal < costoTotalTeorico && (
                    <span className="text-[10px] text-amber-400/90 mt-0.5 font-mono">
                      Deuda: ${(costoTotalTeorico - montoAbonoGlobal).toFixed(2)} MXN
                    </span>
                  )}
                </div>
                <span className={`text-[10px] font-black tracking-widest px-3 py-1 rounded-full border ${badgeVisual.clase}`}>
                  {badgeVisual.texto}
                </span>
              </div>

              {/* Resumen de asientos seleccionados */}
              <div className="bg-slate-950 rounded-xl border border-white/5 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Lugares seleccionados:
                </p>
                {multiSeatsList.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {multiSeatsList.map((seatLabel) => (
                      <span key={seatLabel} className="text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded">
                        {seatLabel}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No hay asientos apartados.</p>
                )}
              </div>

              {/* Botón de generación */}
              <button
                type="button"
                disabled={isPending || multiSelectedCount === 0}
                onClick={handleGenerarTokens}
                className="w-full py-4 bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 disabled:from-slate-800 disabled:to-slate-800 text-black disabled:text-gray-500 font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
              >
                {isPending
                  ? 'Generando tokens...'
                  : `Generar Cobro y ${multiSelectedCount} Token(s)`}
              </button>
            </div>
          )}

          {/* MODO ASIGNACIÓN: consola de asignación (compacta) */}
          {viewMode === 'asignacion' && (
            <div className="bg-slate-900 border border-white/5 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="text-center border-b border-white/5 pb-3">
                <h2 className="text-xs font-black uppercase tracking-widest text-cyan-300">
                  Asignación Manual de Asientos
                </h2>
                <p className="text-[10px] text-gray-500 mt-1">
                  Selecciona un asiento libre en el mapa para registrar a un alumno
                </p>
              </div>

              {lockedUnidad && !assignmentContext.unidadAcademicaId && (
                <div className="rounded-md border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs text-amber-200">
                  Tu usuario de encargado no tiene unidad académica asociada.
                </div>
              )}

              {message && (
                <div className={`rounded-md border px-3 py-2 text-xs ${
                  message.kind === 'success'
                    ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200'
                    : 'border-red-400/30 bg-red-400/10 text-red-200'
                }`}>
                  {message.text}
                </div>
              )}

              {!selectedSeat && (
                <div className="text-center py-6 text-slate-500 text-sm">
                  Haz clic en un asiento libre del mapa para comenzar el registro.
                </div>
              )}

              {selectedSeat && selectedZone && !isPaymentMode && (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="bg-slate-950 rounded-lg border border-white/5 p-3 text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-cyan-300">Asiento seleccionado</p>
                    <p className="text-lg font-black text-white mt-1">
                      {selectedZone.nombre} / {selectedSeat.bloque}
                    </p>
                    <p className="text-xs text-slate-400">
                      Fila {selectedSeat.fila}, Asiento {selectedSeat.numero}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      required
                      placeholder="Nombre"
                      value={form.nombre}
                      onChange={(e) => setForm((c) => ({ ...c, nombre: e.target.value }))}
                      className="col-span-2 rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-cyan-300"
                    />
                    <input
                      required
                      type="email"
                      placeholder="Email"
                      value={form.email}
                      onChange={(e) => setForm((c) => ({ ...c, email: e.target.value }))}
                      className="col-span-2 rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-cyan-300"
                    />
                    <input
                      placeholder="Matrícula"
                      value={form.matricula}
                      onChange={(e) => setForm((c) => ({ ...c, matricula: e.target.value }))}
                      className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-cyan-300"
                    />
                    <input
                      placeholder="Carrera"
                      value={form.carrera}
                      onChange={(e) => setForm((c) => ({ ...c, carrera: e.target.value }))}
                      className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-cyan-300"
                    />
                    <input
                      placeholder="Semestre"
                      value={form.semestre}
                      onChange={(e) => setForm((c) => ({ ...c, semestre: e.target.value }))}
                      className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-cyan-300"
                    />
                    <input
                      placeholder="Teléfono"
                      value={form.telefono}
                      onChange={(e) => setForm((c) => ({ ...c, telefono: e.target.value }))}
                      className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-cyan-300"
                    />
                  </div>

                  {!lockedUnidad && (
                    <select
                      required
                      value={form.unidadAcademicaId}
                      onChange={(e) => setForm((c) => ({ ...c, unidadAcademicaId: e.target.value }))}
                      className="w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300"
                    >
                      <option value="">Selecciona una UA</option>
                      {assignmentContext.unidades.map((unidad) => (
                        <option key={unidad.id} value={unidad.id}>{unidad.nombre}</option>
                      ))}
                    </select>
                  )}

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => { setSelectedSeat(null); setMessage(null) }}
                      className="flex-1 rounded-md border border-white/10 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-white/10 transition"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isPending || (lockedUnidad && !assignmentContext.unidadAcademicaId)}
                      className="flex-1 rounded-md bg-cyan-300 px-3 py-2 text-xs font-black uppercase tracking-widest text-slate-950 hover:bg-cyan-200 disabled:bg-slate-700 disabled:text-slate-400 transition"
                    >
                      {isPending ? 'Guardando...' : 'Guardar ticket'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ─── MODAL DE PAGO (pre-registro) ───────────────────────────── */}
      {selectedSeat && selectedZone && isPaymentMode && selectedTicketInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg border border-white/10 bg-slate-950 p-6 text-white shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-300">
                  {selectedTicketInfo.estatusPago === 'pre-registro' ? 'Pre-registro' : 'Pendiente de pago'}
                </p>
                <h2 className="mt-1 text-xl font-black uppercase">
                  {selectedZone.nombre} / {selectedSeat.bloque}
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Fila {selectedSeat.fila}, asiento {selectedSeat.numero}
                </p>
                <p className="mt-3 text-sm text-slate-300">
                  <strong>Registrado por:</strong> {selectedTicketInfo.nombre}
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setSelectedSeat(null); setIsPaymentMode(false) }}
                className="rounded-md border border-white/10 px-3 py-2 text-sm font-bold text-slate-300 transition hover:bg-white/10"
              >
                Cerrar
              </button>
            </div>

            <div className="space-y-4">
              <div className="rounded-lg border border-amber-400/30 bg-amber-400/10 p-4 text-center">
                <HiOutlineCash className="mx-auto h-10 w-10 text-amber-400" />
                <p className="mt-2 text-lg font-black text-amber-300">$650.00 MXN</p>
                <p className="text-xs text-amber-200/70">Monto a cobrar por el asiento</p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setSelectedSeat(null); setIsPaymentMode(false) }}
                  className="rounded-md border border-white/10 px-4 py-2 text-sm font-bold text-slate-300 transition hover:bg-white/10"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPayment}
                  disabled={isPending}
                  className="flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-black uppercase tracking-widest text-white transition hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-400"
                >
                  <HiOutlineCheckCircle className="h-4 w-4" />
                  {isPending ? 'Procesando...' : 'Confirmar pago ($650)'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL DE TOKEN GENERADO (individual) ────────────────────────── */}
      {tokenGenerado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-2xl border border-emerald-500/40 bg-slate-950 p-8 text-center shadow-2xl shadow-emerald-500/10">
            <div className="mb-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30">
                <HiOutlineCheckCircle className="h-10 w-10 text-emerald-400" />
              </div>
              <h2 className="mt-4 text-2xl font-black uppercase tracking-tight text-white">Pago confirmado</h2>
              <p className="mt-1 text-sm text-slate-400">Dicta este código al alumno:</p>
            </div>

            <div className="mx-auto my-6 inline-block rounded-xl border border-cyan-500/30 bg-cyan-500/5 px-8 py-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-400 mb-2">Token de acceso</p>
              <p className="text-5xl font-black tracking-[0.15em] text-white drop-shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                {tokenGenerado}
              </p>
            </div>

            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-sm text-amber-300">
              <p className="font-mono text-xs">
                El alumno debe ingresar este código en{' '}
                <span className="font-bold text-cyan-300">/dashboard/ingresar-token</span> para canjear su pase.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setTokenGenerado(null)}
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-3 text-sm font-black uppercase tracking-widest text-white transition hover:from-emerald-500 hover:to-emerald-600"
            >
              Cerrar y continuar
            </button>
          </div>
        </div>
      )}

      {/* ─── MODAL MASIVO DE TOKENS GENERADOS ──────────────────────────── */}
      {mostrarModalTokens && tokensGenerados.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-2xl rounded-2xl border border-emerald-500/40 bg-slate-950 p-8 shadow-2xl shadow-emerald-500/10">
            <div className="mb-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30">
                <HiCheckCircle className="h-10 w-10 text-emerald-400" />
              </div>
              <h2 className="mt-4 text-2xl font-black uppercase tracking-tight text-white">
                ¡{tokensGenerados.length} Token(s) generados!
              </h2>
              <p className="mt-1 text-sm text-slate-400">
            Los siguientes códigos de 8 dígitos se han registrado. Dicta o copia cada uno al alumno correspondiente.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 font-mono">
              {tokensGenerados.map((token, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900 border border-emerald-500/20 rounded-xl py-4 px-3 text-center"
                >
                  <p className="text-[10px] text-slate-500 mb-1">Token #{idx + 1}</p>
                  <p className="text-xl font-black tracking-widest text-white">
                    {token}
                  </p>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setMostrarModalTokens(false)}
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-3 text-sm font-black uppercase tracking-widest text-white transition hover:from-emerald-500 hover:to-emerald-600"
            >
              Cerrar y continuar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}