'use client'

import { FormEvent, useEffect, useMemo, useState, useTransition } from 'react'
import {
  getSeatKey,
  getZoneByCode,
  type SeatIdentity,
} from '@/src/config/auditorioConfig'
import { AuditorioSeatMap } from '@/src/components/asientos/AuditorioSeatMap'
import { getMiPerfilCompleto, crearPreRegistro, getMiTicketExistente } from './actions'
import { getOccupiedSeatKeys } from '@/app/monitoreo-mapa/actions'
import type { PerfilUsuarioCompleto } from '@/src/components/asientos/types'
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

  // Mi ticket si ya tengo uno asignado
  const [miTicket, setMiTicket] = useState<unknown | null>(null)

  // Formulario
  const [tipo, setTipo] = useState<FormTipo>('alumno')
  const [nombre, setNombre] = useState('')
  const [matricula, setMatricula] = useState('')
  const [carrera, setCarrera] = useState('')
  const [empresa, setEmpresa] = useState('')
  const [puesto, setPuesto] = useState('')

  const [isPending, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Carga inicial resiliente
  useEffect(() => {
    let isMounted = true

    async function initData() {
      await new Promise((resolve) => setTimeout(resolve, 250))

      let perfilData: PerfilUsuarioCompleto | null = null
      let keysData: string[] = []
      let ticketData: unknown | null = null
      let lastError: unknown = null

      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          perfilData = await getMiPerfilCompleto()
          if (perfilData) {
            lastError = null
            break
          }
        } catch (err) {
          lastError = err
          await new Promise((resolve) => setTimeout(resolve, 200 * (attempt + 1)))
        }
      }

      if (!isMounted) return

      if (lastError || !perfilData) {
        console.error('Error crítico al validar identidad:', lastError)
        setPerfilError(true)
        setLoading(false)
        return
      }

      setPerfil(perfilData)

      try {
        const [k, t] = await Promise.all([
          getOccupiedSeatKeys().catch(() => [] as string[]),
          getMiTicketExistente().catch(() => null)
        ])
        keysData = k
        ticketData = t
      } catch (err) {
        console.warn('Error no crítico cargando mapa/tickets secundarios:', err)
      }

      if (!isMounted) return

      setOccupiedSeatKeys(new Set(keysData))
      setMiTicket(ticketData)
      setLoading(false)
    }

    void initData()

    return () => {
      isMounted = false
    }
  }, [])

  // Zona del asiento seleccionado
  const selectedZone = useMemo(() => {
    if (!selectedSeat) return null
    return getZoneByCode(selectedSeat.zoneCode)
  }, [selectedSeat])

  const handleSeatClick = (seat: SeatIdentity) => {
    if (miTicket) return

    const key = getSeatKey(seat)
    if (occupiedSeatKeys.has(key)) {
      setErrorMsg('Este asiento ya está ocupado o apartado por otro asistente.')
      setSuccessMsg(null)
      return
    }

    setErrorMsg(null)
    setSuccessMsg(null)
    setSelectedSeat(seat)

    if (perfil) {
      setNombre(perfil.nombre || '')
      setMatricula('')
      setCarrera('')
      setEmpresa('')
      setPuesto('')
      setTipo(perfil.tipo === 'externo' ? 'externo' : 'alumno')
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!selectedSeat || !selectedZone) return

    setErrorMsg(null)
    setSuccessMsg(null)

    startTransition(async () => {
      const payload = {
        zoneId: selectedSeat.zoneId,
        asientoZona: selectedSeat.zoneCode,
        asientoBloque: selectedSeat.bloque,
        asientoFila: selectedSeat.fila,
        asientoNumero: selectedSeat.numero,
        nombre: nombre.trim(),
        matricula: tipo === 'alumno' ? (matricula.trim() || null) : null,
        carrera: tipo === 'alumno' ? (carrera.trim() || null) : null,
        empresa: tipo === 'externo' ? (empresa.trim() || null) : null,
        puesto: tipo === 'externo' ? (puesto.trim() || null) : null,
      }

      try {
        const res = await crearPreRegistro(payload)
        if (res.success) {
          setSuccessMsg(res.message)
          setOccupiedSeatKeys((prev) => {
            const next = new Set(prev)
            next.add(getSeatKey(selectedSeat))
            return next
          })
          setMiTicket({ asignado: true })
          setSelectedSeat(null)
        } else {
          setErrorMsg(res.message)
        }
      } catch {
        setErrorMsg('Error de conexión con el servidor. Intenta de nuevo.')
      }
    })
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-white">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-500/20 border-t-cyan-400" />
        <p className="mt-4 font-mono text-xs text-slate-400">Verificando sesión y cargando mapa del auditorio...</p>
      </div>
    )
  }

  if (perfilError || !perfil) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-red-500/20 bg-slate-900/80 p-6 text-center text-white backdrop-blur-xl">
        <HiOutlineExclamationCircle className="mx-auto h-12 w-12 text-red-400" />
        <h3 className="mt-4 text-base font-black uppercase tracking-wider text-red-400">
          Error de autenticación
        </h3>
        <p className="mt-2 text-xs text-slate-400 leading-relaxed">
          No pudimos verificar tu identidad de forma segura. Esto puede ocurrir por intermitencias en la red o si tu sesión expiró.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <button
            onClick={() => window.location.reload()}
            className="w-full rounded-xl bg-slate-800 py-2.5 text-xs font-bold transition hover:bg-slate-700"
          >
            Reintentar
          </button>
          <a
            href="/login"
            className="w-full block rounded-xl bg-gradient-to-r from-red-600 to-orange-600 py-2.5 text-xs font-bold text-white transition hover:opacity-95 text-center"
          >
            Iniciar sesión de nuevo
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:gap-8 text-white xl:grid-cols-3">
      {/* MAPA PRINCIPAL */}
      <div className="rounded-3xl border border-white/5 bg-congreso-bgDark/60 p-4 sm:p-6 backdrop-blur-xl xl:col-span-2">
        <div className="mb-4">
          <h2 className="text-lg font-black uppercase tracking-wider text-cyan-400">
            Reserva de Asiento (Pre-Registro)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {miTicket
              ? 'Ya cuentas con un asiento pre-registrado para el congreso.'
              : 'Selecciona tu lugar preferido en el mapa del auditorio. Recuerda que este apartado es provisional hasta realizar el pago.'}
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl bg-congreso-dark/40 p-4 border border-white/5">
          <AuditorioSeatMap
            mode="assign"
            occupiedSeatKeys={occupiedSeatKeys}
            selectedSeatKey={selectedSeat ? getSeatKey(selectedSeat) : null}
            onSeatClick={handleSeatClick}
          />
        </div>
      </div>

      {/* DETALLES Y FORMULARIO */}
      <div className="space-y-6">
        {successMsg && (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 flex items-start gap-3 text-emerald-400 text-xs">
            <HiOutlineCheckCircle className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-bold uppercase tracking-wider">¡Apartado Exitoso!</p>
              <p className="mt-1 text-slate-300 leading-relaxed">{successMsg}</p>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 flex items-start gap-3 text-red-400 text-xs">
            <HiOutlineExclamationCircle className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-bold uppercase tracking-wider">Aviso</p>
              <p className="mt-1 text-slate-300 leading-relaxed">{errorMsg}</p>
            </div>
          </div>
        )}

        {selectedSeat && selectedZone ? (
          <div className="rounded-3xl border border-white/10 bg-congreso-bgDark/60 p-4 sm:p-6 backdrop-blur-xl animate-fadeIn">
            <div className="border-b border-white/5 pb-3 mb-4">
              <span className="inline-block rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                Lugar Seleccionado
              </span>
              <h3 className="mt-1 text-sm font-black uppercase text-white">
                Zona: {selectedSeat.zoneCode} — Fila {selectedSeat.fila}, Num {selectedSeat.numero}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Bloque: <span className="text-white font-bold">{selectedSeat.bloque}</span>
              </p>
            </div>

            {/* Selector de tipo */}
            <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl bg-congreso-dark p-1 border border-white/5">
              <button
                type="button"
                onClick={() => setTipo('alumno')}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition ${
                  tipo === 'alumno'
                    ? 'bg-white/10 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <HiOutlineAcademicCap className="h-4 w-4" /> Alumno IGE
              </button>
              <button
                type="button"
                onClick={() => setTipo('externo')}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition ${
                  tipo === 'externo'
                    ? 'bg-white/10 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <HiOutlineOfficeBuilding className="h-4 w-4" /> Externo / Empresa
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Nombre Completo
                </label>
                <div className="relative">
                  <HiOutlineUser className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Tu nombre completo"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
              </div>

              {tipo === 'alumno' ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Número de Control
                      </label>
                      <input
                        type="text"
                        required={tipo === 'alumno'}
                        value={matricula}
                        onChange={(e) => setMatricula(e.target.value)}
                        placeholder="Ex. 216W0000"
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Semestre / Grupo
                      </label>
                      <input
                        type="text"
                        required={tipo === 'alumno'}
                        value={carrera}
                        onChange={(e) => setCarrera(e.target.value)}
                        placeholder="Ex. 6to A"
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 transition"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Empresa / Institución
                      </label>
                      <div className="relative">
                        <HiOutlineOfficeBuilding className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                        <input
                          type="text"
                          required={tipo === 'externo'}
                          value={empresa}
                          onChange={(e) => setEmpresa(e.target.value)}
                          placeholder="Nombre"
                          className="w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-cyan-500 transition"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Cargo / Puesto
                      </label>
                      <div className="relative">
                        <HiOutlineBriefcase className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                        <input
                          type="text"
                          required={tipo === 'externo'}
                          value={puesto}
                          onChange={(e) => setPuesto(e.target.value)}
                          placeholder="Puesto"
                          className="w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-cyan-500 transition"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="rounded-xl bg-white/[0.03] px-3 py-2 text-sm">
                <span className="block text-[10px] font-bold uppercase tracking-widest text-purple-400">
                  Correo (automático)
                </span>
                <span className="text-slate-300">{perfil.email || '—'}</span>
              </div>

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
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-congreso-teal to-congreso-blue px-6 py-2 text-sm font-black uppercase tracking-widest text-white transition-all hover:from-congreso-teal/90 hover:to-congreso-blue/90 disabled:cursor-not-allowed disabled:from-congreso-greyDark disabled:to-congreso-greyDark disabled:text-congreso-greyMed"
                >
                  <HiOutlineTicket className="h-4 w-4" />
                  {isPending ? 'Apartando...' : 'Apartar asiento'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-white/10 bg-congreso-bgDark/10 p-6 sm:p-8 text-center backdrop-blur-xl">
            <HiOutlineArrowRight className="mx-auto h-8 w-8 text-slate-600 mb-2 rotate-90 xl:rotate-0" />
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {miTicket ? 'Apartado completado' : 'Selecciona un asiento'}
            </p>
            <p className="mt-2 text-[11px] text-slate-500 leading-relaxed">
              {miTicket
                ? 'Ya registraste un lugar previamente. Pasa a taquilla física o revisa tu pasarela de pago para validar el estado de tu boleto.'
                : 'Haz clic sobre cualquier butaca disponible en el mapa de la izquierda para comenzar tu pre-registro.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}