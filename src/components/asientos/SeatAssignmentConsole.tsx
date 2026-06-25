'use client'

import { FormEvent, useEffect, useMemo, useState, useTransition } from 'react'
import { CONGRESO_IGE_EVENT_ID, getSeatKey, getZoneByCode, type SeatIdentity, type ZoneCode } from '@/config/auditorioConfig'
import { createClient } from '@/lib/supabase/client'
import { createManualSeatTicket, confirmarPagoTicket } from '@/app/dashboard/generar-tokens/actions'
import { AuditorioSeatMap } from './AuditorioSeatMap'
import type { AssignmentContext } from './types'
import type { SeatStatus } from './AuditorioSeatMap'
import { HiOutlineCheckCircle, HiOutlineCash } from 'react-icons/hi'

interface SeatAssignmentConsoleProps {
  assignmentContext: AssignmentContext
  initialOccupiedSeatKeys: string[]
  initialSeatStatusMap?: Record<string, string>
}

interface TicketInsertPayload {
  event_id?: string | null
  zone_id?: string | null
  asiento_zona?: string | null
  asiento_bloque?: string | null
  asiento_fila?: string | null
  asiento_numero?: number | null
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

export function SeatAssignmentConsole({
  assignmentContext,
  initialOccupiedSeatKeys,
  initialSeatStatusMap = {},
}: SeatAssignmentConsoleProps) {
  const [occupiedSeatKeys, setOccupiedSeatKeys] = useState(() => new Set(initialOccupiedSeatKeys))
  const [seatStatusMap, setSeatStatusMap] = useState<Record<string, SeatStatus>>(initialSeatStatusMap as Record<string, SeatStatus>)
  const [selectedSeat, setSelectedSeat] = useState<SeatIdentity | null>(null)
  const [selectedTicketInfo, setSelectedTicketInfo] = useState<{
    ticketId: string
    nombre: string
    estatusPago: string
  } | null>(null)
  const [form, setForm] = useState<FormState>(() => ({
    ...emptyForm,
    unidadAcademicaId: assignmentContext.unidadAcademicaId?.toString() ?? '',
  }))
  const [message, setMessage] = useState<{ kind: 'success' | 'error'; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()
  const [isPaymentMode, setIsPaymentMode] = useState(false)
  const [tokenGenerado, setTokenGenerado] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('assignment-seat-console')
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
          console.error('[SeatAssignmentConsole] Error Realtime:', status, error)
        }
      })

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [])

  const selectedSeatKey = selectedSeat ? getSeatKey(selectedSeat) : null
  const selectedZone = selectedSeat ? getZoneByCode(selectedSeat.zoneCode) : null
  const lockedUnidad = assignmentContext.role === 'encargado'

  const selectedUnidadLabel = useMemo(() => {
    if (lockedUnidad) {
      return assignmentContext.unidadAcademicaNombre ?? 'Unidad no asignada'
    }

    const selectedId = Number(form.unidadAcademicaId)
    return assignmentContext.unidades.find((unidad) => unidad.id === selectedId)?.nombre ?? 'Selecciona una UA'
  }, [assignmentContext, form.unidadAcademicaId, lockedUnidad])

  const handleSeatClick = async (seat: SeatIdentity) => {
    const key = getSeatKey(seat)
    const status = seatStatusMap[key]

    // Si el asiento está ocupado con estatus (pre-registro o pendiente), mostrar modal de pago
    if (status === 'pre-registro' || status === 'pendiente') {
      setIsPaymentMode(true)
      setMessage(null)

      // Buscar info del ticket
      try {
        const supabase = createClient()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const query = (supabase.from('tickets') as any)
          .select('id, nombre, estatus_pago')
          .eq('asiento_zona', seat.zoneCode)
          .eq('asiento_bloque', seat.bloque)
          .eq('asiento_fila', seat.fila)
          .eq('asiento_numero', seat.numero)

        const { data, error } = await query.maybeSingle()

        if (data && !error) {
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

    // Si está ocupado y pagado, no hacer nada
    if (status === 'pagado') return

    // Si está libre, mostrar formulario de registro
    setIsPaymentMode(false)
    setSelectedSeat(seat)
    setSelectedTicketInfo(null)
    setMessage(null)
    setForm((current) => ({
      ...emptyForm,
      unidadAcademicaId: current.unidadAcademicaId || assignmentContext.unidadAcademicaId?.toString() || '',
    }))
  }

  const handleConfirmPayment = () => {
    if (!selectedSeat || !selectedTicketInfo) return

    startTransition(async () => {
      const result = await confirmarPagoTicket(selectedTicketInfo.ticketId)

      if (!result.success) {
        setMessage({ kind: 'error', text: result.message })
        return
      }

      // Actualizar estado local
      const key = getSeatKey(selectedSeat)
      setSeatStatusMap((prev) => ({ ...prev, [key]: 'pagado' }))

      // Si se generó un token de 8 dígitos, mostrarlo
      if (result.tokenCode) {
        setTokenGenerado(result.tokenCode)
      }

      setMessage({ kind: 'success', text: result.message })
      setSelectedSeat(null)
      setSelectedTicketInfo(null)
      setIsPaymentMode(false)
    })
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
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
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-300">
            Consola de staff
          </p>
          <h1 className="mt-2 text-3xl font-black uppercase tracking-tight text-white">
            Asignacion de asientos
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Selecciona un asiento libre y registra al alumno, o haz clic en un asiento naranja para confirmar el pago.
          </p>
        </div>

        <div className="rounded-md border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
          <span className="block text-[10px] font-black uppercase tracking-widest text-slate-500">
            Permiso activo
          </span>
          <span className="font-bold uppercase text-white">{assignmentContext.role}</span>
          <span className="ml-2 text-slate-400">{selectedUnidadLabel}</span>
        </div>
      </header>

      {message && (
        <div className={`rounded-md border px-4 py-3 text-sm ${
          message.kind === 'success'
            ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200'
            : 'border-red-400/30 bg-red-400/10 text-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {lockedUnidad && !assignmentContext.unidadAcademicaId && (
        <div className="rounded-md border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
          Tu usuario de encargado no tiene unidad academica asociada. Un administrador debe asignarla antes de registrar boletos.
        </div>
      )}

      <AuditorioSeatMap
        mode="assign"
        occupiedSeatKeys={occupiedSeatKeys}
        selectedSeatKey={selectedSeatKey}
        onSeatClick={handleSeatClick}
        seatStatusMap={seatStatusMap}
      />

      {/* MODAL DE PAGO PARA ASIENTOS EN PRE-REGISTRO / PENDIENTE */}
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
                  className="flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-black uppercase tracking-widest text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
                >
                  <HiOutlineCheckCircle className="h-4 w-4" />
                  {isPending ? 'Procesando...' : 'Confirmar pago ($650)'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE REGISTRO PARA ASIENTOS LIBRES */}
      {selectedSeat && selectedZone && !isPaymentMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-lg border border-white/10 bg-slate-950 p-6 text-white shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
                  Registro manual
                </p>
                <h2 className="mt-1 text-xl font-black uppercase">
                  {selectedZone.nombre} / {selectedSeat.bloque}
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Fila {selectedSeat.fila}, asiento {selectedSeat.numero}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSeat(null)}
                className="rounded-md border border-white/10 px-3 py-2 text-sm font-bold text-slate-300 transition hover:bg-white/10"
              >
                Cerrar
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1 text-sm">
                <span className="font-bold text-slate-300">Nombre</span>
                <input
                  required
                  value={form.nombre}
                  onChange={(event) => setForm((current) => ({ ...current, nombre: event.target.value }))}
                  className="w-full rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-white outline-none transition focus:border-cyan-300"
                />
              </label>

              <label className="space-y-1 text-sm">
                <span className="font-bold text-slate-300">Email</span>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  className="w-full rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-white outline-none transition focus:border-cyan-300"
                />
              </label>

              <label className="space-y-1 text-sm">
                <span className="font-bold text-slate-300">Matricula</span>
                <input
                  value={form.matricula}
                  onChange={(event) => setForm((current) => ({ ...current, matricula: event.target.value }))}
                  className="w-full rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-white outline-none transition focus:border-cyan-300"
                />
              </label>

              <label className="space-y-1 text-sm">
                <span className="font-bold text-slate-300">Carrera</span>
                <input
                  value={form.carrera}
                  onChange={(event) => setForm((current) => ({ ...current, carrera: event.target.value }))}
                  className="w-full rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-white outline-none transition focus:border-cyan-300"
                />
              </label>

              <label className="space-y-1 text-sm">
                <span className="font-bold text-slate-300">Semestre</span>
                <input
                  value={form.semestre}
                  onChange={(event) => setForm((current) => ({ ...current, semestre: event.target.value }))}
                  className="w-full rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-white outline-none transition focus:border-cyan-300"
                />
              </label>

              <label className="space-y-1 text-sm">
                <span className="font-bold text-slate-300">Telefono</span>
                <input
                  value={form.telefono}
                  onChange={(event) => setForm((current) => ({ ...current, telefono: event.target.value }))}
                  className="w-full rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-white outline-none transition focus:border-cyan-300"
                />
              </label>

              {lockedUnidad ? (
                <div className="space-y-1 text-sm md:col-span-2">
                  <span className="font-bold text-slate-300">Unidad academica</span>
                  <div className="rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-slate-300">
                    {assignmentContext.unidadAcademicaNombre ?? 'Unidad no asignada'}
                  </div>
                </div>
              ) : (
                <label className="space-y-1 text-sm md:col-span-2">
                  <span className="font-bold text-slate-300">Unidad academica</span>
                  <select
                    required
                    value={form.unidadAcademicaId}
                    onChange={(event) => setForm((current) => ({ ...current, unidadAcademicaId: event.target.value }))}
                    className="w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-white outline-none transition focus:border-cyan-300"
                  >
                    <option value="">Selecciona una unidad academica</option>
                    {assignmentContext.unidades.map((unidad) => (
                      <option key={unidad.id} value={unidad.id}>
                        {unidad.nombre}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <div className="flex justify-end gap-3 pt-2 md:col-span-2">
                <button
                  type="button"
                  onClick={() => setSelectedSeat(null)}
                  className="rounded-md border border-white/10 px-4 py-2 text-sm font-bold text-slate-300 transition hover:bg-white/10"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending || (lockedUnidad && !assignmentContext.unidadAcademicaId)}
                  className="rounded-md bg-cyan-300 px-4 py-2 text-sm font-black uppercase tracking-widest text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
                >
                  {isPending ? 'Guardando...' : 'Guardar ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL DE TOKEN GENERADO - Se muestra en grande tras confirmar pago */}
      {tokenGenerado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-2xl border border-emerald-500/40 bg-slate-950 p-8 text-center shadow-2xl shadow-emerald-500/10">
            <div className="mb-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30">
                <HiOutlineCheckCircle className="h-10 w-10 text-emerald-400" />
              </div>
              <h2 className="mt-4 text-2xl font-black uppercase tracking-tight text-white">
                Pago confirmado
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                El asiento ya está marcado como pagado. Dicta este código al alumno:
              </p>
            </div>

            <div className="mx-auto my-6 inline-block rounded-xl border border-cyan-500/30 bg-cyan-500/5 px-8 py-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-400 mb-2">
                Token de acceso
              </p>
              <p className="text-5xl font-black tracking-[0.15em] text-white drop-shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                {tokenGenerado}
              </p>
            </div>

            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-sm text-amber-300">
              <p className="font-mono text-xs">
                El alumno debe ingresar este código en{' '}
                <span className="font-bold text-cyan-300">/dashboard/ingresar-token</span>{' '}
                para canjear su pase.
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
    </div>
  )
}
