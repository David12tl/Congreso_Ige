'use client'

import React, { useEffect, useState } from 'react'
import { 
  HiOutlineIdentification, 
  HiOutlineUser, 
  HiOutlineMail, 
  HiOutlineBadgeCheck, 
  HiOutlineAcademicCap,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineSave,
} from 'react-icons/hi'

import { getMiPerfil, PerfilUsuario, getUnidadesAcademicas, actualizarMiUnidadAcademica } from './actions'
import { getResumenAsistente, ResumenDashboard } from '../usuario/actions'
import type { UnidadAcademica } from './actions'

function GlassCard({ children, className = '', glowColor = 'cyan' }: {
  children: React.ReactNode
  className?: string
  glowColor?: 'blue' | 'purple' | 'amber' | 'cyan' | 'emerald'
}) {
  const glowStyles: Record<string, string> = {
    blue: 'border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.15)]',
    purple: 'border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.15)]',
    amber: 'border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.15)]',
    cyan: 'border-cyan-500/30 shadow-[0_0_20px_rgba(34,211,238,0.15)]',
    emerald: 'border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.15)]',
  }

  return (
    <div className={`relative rounded-2xl border bg-slate-900/40 backdrop-blur-xl overflow-hidden transition-all duration-300 ${glowStyles[glowColor]} ${className}`}>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      {children}
    </div>
  )
}

export default function PerfilPage() {
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null)
  const [resumen, setResumen] = useState<ResumenDashboard | null>(null)
  const [loading, setLoading] = useState(true)

  // Estado para el selector de UA
  const [unidadesAcademicas, setUnidadesAcademicas] = useState<UnidadAcademica[]>([])
  const [selectedUA, setSelectedUA] = useState<number | ''>('')
  const [savingUA, setSavingUA] = useState(false)
  const [uaSaved, setUaSaved] = useState(false)
  const [uaError, setUaError] = useState<string | null>(null)

  // La UA está incompleta si el perfil no tiene unidadAcademicaId
  const requiereCompletarUA = perfil !== null && perfil.unidadAcademicaId === null

  const actualizarDatosPantalla = async () => {
    try {
      const [dataPerfil, dataResumen, dataUAs] = await Promise.all([
        getMiPerfil(),
        getResumenAsistente(),
        getUnidadesAcademicas()
      ])
      setPerfil(dataPerfil)
      setResumen(dataResumen)
      setUnidadesAcademicas(dataUAs)

      // Precargar el selector si ya tiene una UA asignada
      if (dataPerfil?.unidadAcademicaId) {
        setSelectedUA(dataPerfil.unidadAcademicaId)
      }
    } catch (err) {
      console.error("Error al sincronizar datos del asistente:", err)
    }
  }

  useEffect(() => {
    let activo = true

    const sincronizarPerfil = async () => {
      try {
        const [dataPerfil, dataResumen, dataUAs] = await Promise.all([
          getMiPerfil(),
          getResumenAsistente(),
          getUnidadesAcademicas()
        ])
        
        if (activo) {
          setPerfil(dataPerfil)
          setResumen(dataResumen)
          setUnidadesAcademicas(dataUAs)

          if (dataPerfil?.unidadAcademicaId) {
            setSelectedUA(dataPerfil.unidadAcademicaId)
          }
        }
      } catch (err) {
        console.error("Error al sincronizar datos del asistente:", err)
      } finally {
        if (activo) {
          setLoading(false)
        }
      }
    }

    sincronizarPerfil()

    return () => {
      activo = false
    }
  }, [])

  const handleSaveUA = async () => {
    if (selectedUA === '') return
    setSavingUA(true)
    setUaSaved(false)
    setUaError(null)

    try {
      const res = await actualizarMiUnidadAcademica(Number(selectedUA))
      if (res.success) {
        setUaSaved(true)
        // Refrescar datos completos
        await actualizarDatosPantalla()
        setTimeout(() => setUaSaved(false), 3000)
      } else {
        setUaError(res.message)
      }
    } catch (err) {
      setUaError('Error crítico al guardar. Intenta de nuevo.')
    } finally {
      setSavingUA(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-cyan-500/20 border-t-cyan-500 animate-spin" />
        <p className="text-gray-400 font-mono text-xs uppercase tracking-widest">Leyendo bases de datos encriptadas...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto p-4 md:p-0">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase">
            <HiOutlineIdentification className="inline-block w-8 h-8 mr-3 text-cyan-400" />
            Mi{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Perfil
            </span>
          </h1>
          <p className="text-gray-500 text-sm font-mono mt-1">USUARIO // INFORMACIÓN_PERSONAL_Y_CREDENCIALES</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full">
            <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
            <span className="text-cyan-400 text-xs font-bold uppercase tracking-widest">
              {resumen?.ticketType ? `Perfil ${resumen.ticketType}` : 'Perfil Activo'}
            </span>
          </div>
        </div>
      </header>

      {/* 📢 BANNER: Si no ha seleccionado UA aún */}
      {requiereCompletarUA && (
        <GlassCard className="p-5" glowColor="amber">
          <div className="flex items-start gap-4">
            <HiOutlineExclamationCircle className="w-8 h-8 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-base font-bold text-amber-300 uppercase tracking-wider">
                Unidad Académica no asignada
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                Para acceder al sistema, debes seleccionar la Unidad Académica a la que perteneces.
                Los encargados de cada unidad podrán visualizar tu registro correctamente.
              </p>
            </div>
          </div>
        </GlassCard>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Panel Izquierdo: Avatar Dinámico */}
        <GlassCard className="p-8 flex flex-col items-center justify-center text-center" glowColor="cyan">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-[0_0_30px_rgba(34,211,238,0.3)]">
            {perfil?.email ? perfil.email.substring(0, 2).toUpperCase() : <HiOutlineUser className="w-12 h-12" />}
          </div>
          <h2 className="text-xl font-bold text-white mt-4 truncate max-w-full">
            {perfil?.email || 'Asistente Anónimo'}
          </h2>
          <span className="px-3 py-1 mt-2 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-bold uppercase tracking-wider">
            {perfil?.rolNombre || 'Asistente'}
          </span>
          <p className="text-[10px] text-gray-500 font-mono mt-4">MIEMBRO_DESDE: {perfil?.createdAt || '—'}</p>
        </GlassCard>

        {/* Panel Derecho: Datos de Registro */}
        <GlassCard className="p-8 lg:col-span-2 flex flex-col justify-between" glowColor="purple">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white uppercase tracking-widest">Datos del Perfil</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <HiOutlineUser className="w-6 h-6 text-cyan-400" />
                <div className="flex-1">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Nombre Completo</p>
                  <p className="text-white font-medium">
                    {resumen?.hasTicket ? 'Revisa tu credencial en el módulo Pase' : '—'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <HiOutlineMail className="w-6 h-6 text-purple-400" />
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Correo Electrónico</p>
                  <p className="text-white font-medium">{perfil?.email || '—'}</p>
                </div>
              </div>

              {/* ⭐ NUEVO: Selector de Unidad Académica */}
              <div className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <HiOutlineAcademicCap className="w-6 h-6 text-cyan-400 mt-1" />
                <div className="flex-1">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                    Unidad Académica <span className="text-amber-400">*</span>
                  </p>
                  {perfil?.unidadAcademicaNombre ? (
                    <p className="text-white font-medium flex items-center gap-2">
                      {perfil.unidadAcademicaNombre}
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        <HiOutlineCheckCircle className="w-3 h-3" /> Asignada
                      </span>
                    </p>
                  ) : (
                    <p className="text-amber-400 font-medium text-sm">No asignada</p>
                  )}

                  {/* Selector para cambiar/asignar UA */}
                  <div className="mt-3 flex flex-col sm:flex-row gap-2">
                    <select
                      value={selectedUA}
                      onChange={(e) => {
                        setSelectedUA(e.target.value ? Number(e.target.value) : '')
                        setUaError(null)
                      }}
                      className="flex-1 bg-slate-950/80 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-cyan-500 outline-none font-mono"
                    >
                      <option value="" className="bg-slate-900">
                        -- Seleccionar Unidad Académica --
                      </option>
                      {unidadesAcademicas.map((ua) => (
                        <option key={ua.id} value={ua.id} className="bg-slate-900">
                          {ua.nombre} ({ua.tipo === 'interno' ? 'Interna' : 'Externa'})
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleSaveUA}
                      disabled={savingUA || selectedUA === ''}
                      className="flex items-center justify-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-mono font-bold uppercase tracking-wider rounded-xl transition-all"
                    >
                      <HiOutlineSave className="w-4 h-4" />
                      {savingUA ? 'Guardando...' : 'Guardar'}
                    </button>
                  </div>

                  {/* Feedback */}
                  {uaSaved && (
                    <p className="text-emerald-400 text-xs font-mono mt-2 flex items-center gap-1">
                      <HiOutlineCheckCircle className="w-4 h-4" /> Unidad Académica guardada correctamente.
                    </p>
                  )}
                  {uaError && (
                    <p className="text-red-400 text-xs font-mono mt-2">{uaError}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <HiOutlineBadgeCheck className="w-6 h-6 text-emerald-400" />
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Nivel de Seguridad Acceso</p>
                  <p className="text-white font-mono tracking-wider">LEVEL_0{perfil?.nivelAcceso ?? 1}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
            <div className="font-mono text-xs text-gray-400">
              STATUS_DB: {resumen?.hasTicket ? (
                <span className="text-emerald-400 font-bold uppercase">{"// ACCESO_VINCULADO_OK"}</span>
              ) : (
                <span className="text-amber-400 font-bold uppercase">{"// REQUIERE_ACTIVAR_TOKEN_STRIPE"}</span>
              )}
            </div>
            {!resumen?.hasTicket && (
              <a 
                href="/dashboard/ingresar-token" 
                className="text-[10px] font-mono font-bold uppercase bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2.5 py-1 rounded hover:bg-amber-500/20 transition-all"
              >
                Vincular Token →
              </a>
            )}
          </div>
        </GlassCard>

      </div>
    </div>
  )
}