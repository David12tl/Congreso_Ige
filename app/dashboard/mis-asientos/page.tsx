'use client'

import { FormEvent, useEffect, useMemo, useState, useTransition } from 'react'
import {
  getSeatKey,
  getZoneByCode,
  type SeatIdentity,
  type ZoneCode,
} from '@/src/config/auditorioConfig'
import { AuditorioSeatMap } from '@/src/components/asientos/AuditorioSeatMap'
import { getMiPerfilCompleto, crearPreRegistro, getMiTicketExistente } from './actions'
import { getOccupiedSeatKeys } from '@/app/monitoreo-mapa/actions'
import type { PerfilUsuarioCompleto, PreRegistroInput } from '@/src/components/asientos/types'
import {
  HiOutlineExclamationCircle,
  HiOutlineCheckCircle,
  HiOutlineArrowRight,
  HiOutlineUser,
  HiOutlineAcademicCap,
  HiOutlineOfficeBuilding,
  HiOutlineBriefcase,
  HiOutlineTicket,
} from 'react-icons/hi'

type FormTipo = 'alumno' | 'externo'

export default function MisAsientosPage() {
  const [loading, setLoading] = useState(true)
  const [perfil, setPerfil] = useState<PerfilUsuarioCompleto | null>(null)
  const [perfilError, setPerfilError] = useState(false)

  // Estado del mapa
  const [occupiedSeatKeys, setOccupiedSeatKeys] = useState<Set<string>>(new Set())
  const [selectedSeat, setSelectedSeat] = useState<SeatIdentity | null>(null)

  // Estado del ticket existente
  const [ticketInfo, setTicketInfo] = useState<{
    tieneTicket: boolean
    ticketId?: string
    estatusPago?: string
    asientoInfo?: string
  } | null>(null)

  // Formulario
  const [formTipo, setFormTipo] = useState<FormTipo>('alumno')
  const [formNombre, setFormNombre] = useState('')
  const [formMatricula, setFormMatricula] = useState('')
  const [formCarrera, setFormCarrera] = useState('')
  const [formSemestre, setFormSemestre] = useState('')
  const [formTelefono, setFormTelefono] = useState('')
  const [formOrganizacion, setFormOrganizacion] = useState('')

  const [message, setMessage] = useState<{ kind: 'success' | 'error'; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    let active = true

    async function loadData() {
      try {
        const [perfilData, keys, ticket] = await Promise.all([
          getMiPerfilCompleto(),
          getOccupiedSeatKeys(),
          getMiTicketExistente(),
        ])

        if (!active) return

        setOccupiedSeatKeys(new Set(keys))
        setTicketInfo(ticket)

        if (!perfilData) {
          setPerfilError(true)
        } else {
          setPerfil(perfilData)
          // Precargar datos del perfil
          if (perfilData.nombre) setFormNombre(perfilData.nombre)
          if (perfilData.matricula) setFormMatricula(perfilData.matricula)
          if (perfilData.carrera) setFormCarrera(perfilData.carrera)
          if (perfilData.semestre) setFormSemestre(perfilData.semestre)
          if (perfilData.telefono) setFormTelefono(perfilData.telefono)
          if (perfilData.tipo) setFormTipo(perfilData.tipo)
        }
      } catch (err) {
        console.error('[MisAsientosPage] Error:', err)
        if (active) setPerfilError(true)
      } finally {
        if (active) setLoading(false)
      }
    }

    loadData()
    return () => { active = false }
  }, [])

  const selectedSeatKey = selectedSeat ? getSeatKey(selectedSeat) : null
  const selectedZone = selectedSeat ? getZoneByCode(selectedSeat.zoneCode) : null

  const handleSeatClick = (seat: SeatIdentity) => {
    // Si ya tiene ticket, no puede seleccionar otro
    if (ticketInfo?.tieneTicket) return
    setSelectedSeat(seat)
    setMessage(null)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedSeat || !perfil) return

    startTransition(async () => {
      const input: PreRegistroInput = {
        zoneCode: selectedSeat.zoneCode,
        zoneId: selectedSeat.zoneId,
        bloque: selectedSeat.bloque,
        fila: selectedSeat.fila,
        numero: selectedSeat.numero,
        tipo: formTipo,
        nombre: formNombre,
        matricula: formTipo === 'alumno' ? formMatricula : undefined,
        carrera: formTipo === 'alumno' ? formCarrera : undefined,
        semestre: formTipo === 'alumno' ? formSemestre : undefined,
        telefono: formTelefono || undefined,
        organizacion: formTipo === 'externo' ? formOrganizacion : undefined,
      }

      const result = await crearPreRegistro(input)

      if (!result.success) {
        setMessage({ kind: 'error', text: result.message })
        return
      }

      // Actualizar estado local
      setOccupiedSeatKeys((prev) => {
        const next = new Set(prev)
        next.add(getSeatKey(selectedSeat))
        return next
      })

      setTicketInfo({
        tieneTicket: true,
        estatusPago: 'pre-registro',
        asientoInfo: `${selectedSeat.zoneCode} / ${selectedSeat.bloque} / Fila ${selectedSeat.fila} / Asiento ${selectedSeat.numero}`,
      })

      setSelectedSeat(null)
      setMessage({ kind: 'success', text: result.message })
    })
  }

  // ─── PANTALLA DE CARGA ───────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-500/20 border-t-cyan-500" />
        <p className="font-mono text-xs uppercase tracking-widest text-gray-400">Verificando perfil...</p>
      </div>
    )
  }

  // ─── ERROR AL CARGAR PERFIL ──────────────────────────────────
  if (perfilError || !perfil) {
    return (
      <div className="mx-auto max-w-4xl animate-fadeIn p-4 text-white">
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center backdrop-blur-xl">
          <HiOutlineExclamationCircle className="mx-auto h-16 w-16 text-red-400" />
          <h2 className="mt-4 text-2xl font-black uppercase tracking-tight">Error de autenticación</h2>
          <p className="mt-2 text-sm text-gray-400">No pudimos verificar tu identidad. Intenta recargar la página.</p>
        </div>
      </div>
    )
  }

  // ─── PERFIL INCOMPLETO ───────────────────────────────────────
  if (!perfil.completo) {
    return (
      <div className="mx-auto max-w-4xl animate-fadeIn p-4 text-white">
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-12 text-center backdrop-blur-xl shadow-[0_0_40px_rgba(245,158,11,0.15)]">
          <HiOutlineExclamationCircle className="mx-auto h-20 w-20 text-amber-400" />
          <h2 className="mt-6 text-3xl font-black uppercase tracking-tight">
            Perfil incompleto
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-base text-amber-200/80">
            Para poder apartar un asiento, primero debes completar tu perfil con tu Unidad Académica y datos de contacto.
          </p>
          <div className="mt-4 space-y-1 text-sm text-gray-400">
            {!perfil.unidadAcademicaId && (
              <p className="flex items-center justify-center gap-2">
                <HiOutlineOfficeBuilding className="h-4 w-4 text-amber-400" />
                <span>Falta: Unidad Académica</span>
              </p>
            )}
            {perfil.tipo === 'alumno' && !perfil.matricula && (
              <p className="flex items-center justify-center gap-2">
                <HiOutlineAcademicCap className="h-4 w-4 text-amber-400" />
                <span>Falta: Matrícula</span>
              </p>
            )}
            {!perfil.telefono && (
              <p className="flex items-center justify-center gap-2">
                <HiOutlineUser className="h-4 w-4 text-amber-400" />
                <span>Falta: Teléfono</span>
              </p>
            )}
          </div>
          <a
            href="/dashboard/perfil"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-8 py-4 text-sm font-black uppercase tracking-widest text-white shadow-lg transition-all hover:from-amber-500 hover:to-orange-500"
          >
            Ir a mi perfil
            <HiOutlineArrowRight className="h-5 w-5" />
          </a>
        </div>
      </div>
    )
  }

  // ─── YA TIENE UN TICKET ──────────────────────────────────────
  if (ticketInfo?.tieneTicket) {
    return (
      <div className="mx-auto max-w-4xl animate-fadeIn p-4 text-white">
        <div className={`rounded-2xl border p-12 text-center backdrop-blur-xl shadow-[0_0_40px_rgba(16,185,129,0.15)] ${
          ticketInfo.estatusPago === 'pagado'
            ? 'border-emerald-500/30 bg-emerald-500/10'
            : 'border-amber-500/30 bg-amber-500/10'
        }`}>
          <HiOutlineCheckCircle className={`mx-auto h-20 w-20 ${
            ticketInfo.estatusPago === 'pagado' ? 'text-emerald-400' : 'text-amber-400'
          }`} />
          <h2 className="mt-6 text-3xl font-black uppercase tracking-tight">
            {ticketInfo.estatusPago === 'pagado' ? '¡Asiento confirmado!' : 'Asiento apartado'}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-base text-gray-300">
            {ticketInfo.estatusPago === 'pagado'
              ? 'Tu pago ha sido registrado y tu acceso está garantizado.'
              : 'Tu asiento está apartado. Presenta tu pago de $650 MXN con el encargado de tu unidad para confirmar.'}
          </p>
          {ticketInfo.asientoInfo && (
            <div className="mx-auto mt-6 inline-block rounded-xl border border-white/10 bg-white/[0.03] px-6 py-4">
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-400">
                Asiento asignado
              </p>
              <p className="mt-1 text-lg font-bold text-white">{ticketInfo.asientoInfo}</p>
              <p className="mt-1 text-sm font-mono text-gray-400">
                Estatus:{' '}
                <span className={`font-bold ${
                  ticketInfo.estatusPago === 'pagado'
                    ? 'text-emerald-400'
                    : ticketInfo.estatusPago === 'pendiente'
                      ? 'text-amber-400'
                      : 'text-orange-400'
                }`}>
                  {ticketInfo.estatusPago === 'pagado' ? 'Pagado' : ticketInfo.estatusPago === 'pendiente' ? 'Pendiente de pago' : 'Pre-registro'}
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ─── FLUJO PRINCIPAL: SELECCIÓN DE ASIENTO ───────────────────
  return (
    <div className="mx-auto max-w-7xl animate-fadeIn space-y-8 p-4 text-white">
      {/* Header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-xs font-black uppercase tracking-[0.3em] text-cyan-300">
            Selección de asiento
          </p>
          <h1 className="mt-2 text-3xl font-black uppercase tracking-tight text-white">
            Aparta tu lugar
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Selecciona un asiento disponible en el mapa. Todos los asientos tienen un costo de <strong className="text-white">$650 MXN</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 md:self-auto">
          <div className="h-2 w-2 animate-pulse rounded-full bg-cyan-500" />
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
            {perfil.tipo === 'alumno' ? 'Alumno' : 'Externo'}
          </span>
        </div>
      </header>

      {/* Mensaje de feedback */}
      {message && (
        <div className={`rounded-md border px-4 py-3 text-sm ${
          message.kind === 'success'
            ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200'
            : 'border-red-400/30 bg-red-400/10 text-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Mapa de asientos */}
      <AuditorioSeatMap
        mode="assign"
        occupiedSeatKeys={occupiedSeatKeys}
        selectedSeatKey={selectedSeatKey}
        onSeatClick={handleSeatClick}
      />

      {/* Modal de pre-registro al seleccionar asiento */}
      {selectedSeat && selectedZone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-950 p-6 text-white shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
                  Pre-registro
                </p>
                <h2 className="mt-1 text-xl font-black uppercase">
                  {selectedZone.nombre} / {selectedSeat.bloque}
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Fila {selectedSeat.fila}, asiento {selectedSeat.numero}
                </p>
                <p className="mt-2 text-sm font-bold text-amber-400">
                  Costo: $650 MXN
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

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Selector de tipo alumno/externo */}
              <div className="flex gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-1">
                <button
                  type="button"
                  onClick={() => { setFormTipo('alumno'); setFormMatricula(''); setFormCarrera(''); setFormSemestre('') }}
                  className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                    formTipo === 'alumno'
                      ? 'bg-cyan-500/20 text-cyan-400 shadow-sm'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <HiOutlineAcademicCap className="inline-block h-4 w-4 mr-1" />
                  Alumno
                </button>
                <button
                  type="button"
                  onClick={() => { setFormTipo('externo'); setFormMatricula(''); setFormCarrera(''); setFormSemestre('') }}
                  className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                    formTipo === 'externo'
                      ? 'bg-purple-500/20 text-purple-400 shadow-sm'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <HiOutlineBriefcase className="inline-block h-4 w-4 mr-1" />
                  Externo
                </button>
              </div>

              {/* Campos para ALUMNO */}
              {formTipo === 'alumno' ? (
                <>
                  <label className="block space-y-1 text-sm">
                    <span className="font-bold text-slate-300">Nombre completo</span>
                    <input
                      required
                      value={formNombre}
                      onChange={(e) => setFormNombre(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-white outline-none transition focus:border-cyan-300"
                    />
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <label className="block space-y-1 text-sm">
                      <span className="font-bold text-slate-300">Matrícula</span>
                      <input
                        value={formMatricula}
                        onChange={(e) => setFormMatricula(e.target.value)}
                        placeholder={perfil.matricula || 'Núm. de control'}
                        className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-white outline-none transition focus:border-cyan-300"
                      />
                    </label>
                    <label className="block space-y-1 text-sm">
                      <span className="font-bold text-slate-300">Semestre</span>
                      <select
                        value={formSemestre}
                        onChange={(e) => setFormSemestre(e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white outline-none transition focus:border-cyan-300"
                      >
                        <option value="">Selecciona</option>
                        {[1,2,3,4,5,6,7,8,9,10,11,12].map(s => (
                          <option key={s} value={s}>{s}°</option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <label className="block space-y-1 text-sm">
                    <span className="font-bold text-slate-300">Carrera</span>
                    <input
                      value={formCarrera}
                      onChange={(e) => setFormCarrera(e.target.value)}
                      placeholder={perfil.carrera || 'Ej. Ingeniería en Gestión Empresarial'}
                      className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-white outline-none transition focus:border-cyan-300"
                    />
                  </label>

                  <label className="block space-y-1 text-sm">
                    <span className="font-bold text-slate-300">Teléfono</span>
                    <input
                      value={formTelefono}
                      onChange={(e) => setFormTelefono(e.target.value)}
                      placeholder={perfil.telefono || 'Teléfono de contacto'}
                      className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-white outline-none transition focus:border-cyan-300"
                    />
                  </label>

                  <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm">
                    <span className="block text-[10px] font-bold uppercase tracking-widest text-cyan-400">
                      Correo (automático)
                    </span>
                    <span className="text-slate-300">{perfil.email || '—'}</span>
                  </div>

                  <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm">
                    <span className="block text-[10px] font-bold uppercase tracking-widest text-cyan-400">
                      Unidad Académica (automático)
                    </span>
                    <span className="text-slate-300">{perfil.unidadAcademicaNombre || '—'}</span>
                  </div>
                </>
              ) : (
                /* Campos para EXTERNO */
                <>
                  <label className="block space-y-1 text-sm">
                    <span className="font-bold text-slate-300">Nombre completo</span>
                    <input
                      required
                      value={formNombre}
                      onChange={(e) => setFormNombre(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-white outline-none transition focus:border-purple-300"
                    />
                  </label>

                  <label className="block space-y-1 text-sm">
                    <span className="font-bold text-slate-300">Teléfono</span>
                    <input
                      value={formTelefono}
                      onChange={(e) => setFormTelefono(e.target.value)}
                      placeholder={perfil.telefono || 'Teléfono de contacto'}
                      className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-white outline-none transition focus:border-purple-300"
                    />
                  </label>

                  <label className="block space-y-1 text-sm">
                    <span className="font-bold text-slate-300">Organización / Empresa</span>
                    <input
                      value={formOrganizacion}
                      onChange={(e) => setFormOrganizacion(e.target.value)}
                      placeholder="Nombre de tu organización o empresa"
                      className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-white outline-none transition focus:border-purple-300"
                    />
                  </label>

                  <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm">
                    <span className="block text-[10px] font-bold uppercase tracking-widest text-purple-400">
                      Correo (automático)
                    </span>
                    <span className="text-slate-300">{perfil.email || '—'}</span>
                  </div>
                </>
              )}

              {/* Botones de acción */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedSeat(null)}
                  className="rounded-lg border border-white/10 px-4 py-2 text-sm font-bold text-slate-300 transition hover:bg-white/10"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-2 text-sm font-black uppercase tracking-widest text-white transition-all hover:from-cyan-500 hover:to-blue-500 disabled:cursor-not-allowed disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-400"
                >
                  <HiOutlineTicket className="h-4 w-4" />
                  {isPending ? 'Apartando...' : 'Apartar asiento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}