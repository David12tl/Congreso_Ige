'use client'

import { FormEvent, useEffect, useMemo, useState, useTransition } from 'react'
import { CONGRESO_IGE_EVENT_ID, getSeatKey, getZoneByCode, type SeatIdentity, type ZoneCode } from '@/src/config/auditorioConfig'
import { createClient } from '@/src/lib/supabase/client'
import { createManualSeatTicket } from '@/app/dashboard/asignacion-asientos/actions'
import { AuditorioSeatMap } from './AuditorioSeatMap'
import type { AssignmentContext } from './types'

interface SeatAssignmentConsoleProps {
  assignmentContext: AssignmentContext
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
}: SeatAssignmentConsoleProps) {
  const [occupiedSeatKeys, setOccupiedSeatKeys] = useState(() => new Set(initialOccupiedSeatKeys))
  const [selectedSeat, setSelectedSeat] = useState<SeatIdentity | null>(null)
  const [form, setForm] = useState<FormState>(() => ({
    ...emptyForm,
    unidadAcademicaId: assignmentContext.unidadAcademicaId?.toString() ?? '',
  }))
  const [message, setMessage] = useState<{ kind: 'success' | 'error'; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()

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

  const handleSeatClick = (seat: SeatIdentity) => {
    setSelectedSeat(seat)
    setMessage(null)
    setForm((current) => ({
      ...emptyForm,
      unidadAcademicaId: current.unidadAcademicaId || assignmentContext.unidadAcademicaId?.toString() || '',
    }))
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
            Selecciona un asiento libre y registra al alumno. Los asientos ocupados quedan bloqueados por la restriccion unica de PostgreSQL.
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
      />

      {selectedSeat && selectedZone && (
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
    </div>
  )
}
