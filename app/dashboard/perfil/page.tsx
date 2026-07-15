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
  HiOutlineClipboardList
} from 'react-icons/hi'

import { getMiPerfil, getUnidadesAcademicas, actualizarMiUnidadAcademica } from './actions'
import { getResumenAsistente } from '../usuario/actions'
import { GlassCard } from '@/components/ui/GlassCard'

// Definición manual y limpia de tipos locales basados en las promesas
interface PerfilUsuarioConId {
  id: string
  email: string | null
  createdAt: string
  rolNombre: string
  nivelAcceso: number
  unidadAcademicaId: number | null
  unidadAcademicaNombre: string | null
}

interface UnidadAcademica {
  id: number
  nombre: string
  tipo: 'interno' | 'externo'
}

type ResumenDashboard = Awaited<ReturnType<typeof getResumenAsistente>>

// IMPORTAMOS EL COMPONENTE DE ONBOARDING 
import { PreTicketOnboarding } from './PreTicketOnboarding'

export default function PerfilPage() {
  const [perfil, setPerfil] = useState<PerfilUsuarioConId | null>(null)
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
      
      if (dataPerfil) {
        setPerfil(dataPerfil as PerfilUsuarioConId)
      } else {
        setPerfil(null)
      }
      
      setResumen(dataResumen)
      setUnidadesAcademicas(dataUAs as UnidadAcademica[])

      if (dataPerfil?.unidadAcademicaId) {
        setSelectedUA(dataPerfil.unidadAcademicaId)
      }
    } catch (err) {
      console.error('Error al sincronizar datos del perfil:', err)
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
          if (dataPerfil) {
            setPerfil(dataPerfil as PerfilUsuarioConId)
          } else {
            setPerfil(null)
          }

          setResumen(dataResumen)
          setUnidadesAcademicas(dataUAs as UnidadAcademica[])

          if (dataPerfil?.unidadAcademicaId) {
            setSelectedUA(dataPerfil.unidadAcademicaId)
          }
        }
      } catch (err) {
        console.error('Error al sincronizar datos del perfil:', err)
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
        await actualizarDatosPantalla()
        setTimeout(() => setUaSaved(false), 3000)
      } else {
        setUaError(res.message)
      }
    } catch {
      setUaError('Error crítico al guardar. Intenta de nuevo.')
    } finally {
      setSavingUA(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-cyan-200 border-t-cyan-500 animate-spin" />
        <p className="text-slate-500 font-light text-xs uppercase tracking-widest">Leyendo bases de datos...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto p-4 md:p-0">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-black tracking-tight text-[#0f172a] text-2xl md:text-3xl">
            <HiOutlineIdentification className="inline-block w-8 h-8 mr-3 text-cyan-700" />
            Mi{' '}
            <span className="text-cyan-700">
              Perfil
            </span>
          </h1>
          <p className="text-slate-500 text-sm font-light mt-1">USUARIO // INFORMACIÓN_PERSONAL_Y_CREDENCIALES</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-cyan-50 border border-cyan-200 rounded-full">
            <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
            <span className="text-cyan-700 text-xs font-bold uppercase tracking-widest">
              {resumen?.ticketType ? `Perfil ${resumen.ticketType}` : 'Perfil Activo'}
            </span>
          </div>
        </div>
      </header>

      {/* 📢 BANNER: Si no ha seleccionado UA aún */}
      {requiereCompletarUA && (
        <GlassCard className="p-5" glowColor="amber">
          <div className="flex items-start gap-4">
            <HiOutlineExclamationCircle className="w-8 h-8 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-base font-bold text-amber-700 uppercase tracking-wider">
                Unidad Académica Obligatoria
              </h3>
              <p className="text-sm text-slate-500 mt-1 font-light">
                Para poder tramitar tu solicitud de registro al congreso, primero debes asignar tu Unidad Académica en el panel Datos del Perfil abajo. Una vez guardado, se desbloqueará tu formulario de pre-ticket.
              </p>
            </div>
          </div>
        </GlassCard>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Panel Izquierdo: Avatar Dinámico */}
        <GlassCard className="p-8 flex flex-col items-center justify-center text-center" glowColor="cyan">
          <div className="w-24 h-24 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 shadow-sm">
            {perfil?.email ? perfil.email.substring(0, 2).toUpperCase() : <HiOutlineUser className="w-12 h-12" />}
          </div>
          <h2 className="text-xl font-bold text-[#0f172a] mt-4 truncate max-w-full">
            {perfil?.email || 'Asistente Anónimo'}
          </h2>
          <span className="px-3 py-1 mt-2 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200 text-xs font-bold uppercase tracking-wider">
            {perfil?.rolNombre || 'Asistente'}
          </span>
          <p className="text-[10px] text-slate-500 font-light mt-4">MIEMBRO_DESDE: {perfil?.createdAt || '—'}</p>
        </GlassCard>

        {/* Panel Derecho: Datos de Registro */}
        <GlassCard className="p-8 lg:col-span-2 flex flex-col justify-between" glowColor="purple">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-[#0f172a] uppercase tracking-widest">Datos del Perfil</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <HiOutlineUser className="w-6 h-6 text-cyan-700" />
                <div className="flex-1">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Nombre Completo</p>
                  <p className="text-[#0f172a] font-light">
                    {resumen?.hasTicket ? 'Revisa tu credencial en el módulo Pase' : '—'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <HiOutlineMail className="w-6 h-6 text-purple-700" />
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Correo Electrónico</p>
                  <p className="text-[#0f172a] font-light">{perfil?.email || '—'}</p>
                </div>
              </div>

              {/* Selector de Unidad Académica */}
              <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <HiOutlineAcademicCap className="w-6 h-6 text-cyan-700 mt-1" />
                <div className="flex-1">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                    Unidad Académica <span className="text-amber-700">*</span>
                  </p>
                  {perfil?.unidadAcademicaNombre ? (
                    <p className="text-[#0f172a] font-light flex items-center gap-2">
                      {perfil.unidadAcademicaNombre}
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <HiOutlineCheckCircle className="w-3 h-3" /> Asignada
                      </span>
                    </p>
                  ) : (
                    <p className="text-amber-700 font-light text-sm">No asignada</p>
                  )}

                  <div className="mt-3 flex flex-col sm:flex-row gap-2">
                    <select
                      value={selectedUA}
                      onChange={(e) => {
                        setSelectedUA(e.target.value ? Number(e.target.value) : '')
                        setUaError(null)
                      }}
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-[#0f172a] focus:border-cyan-500 outline-none font-light"
                    >
                      <option value="" className="bg-white">
                        -- Seleccionar Unidad Académica --
                      </option>
                      {unidadesAcademicas.map((ua) => (
                        <option key={ua.id} value={ua.id} className="bg-white">
                          {ua.nombre} ({ua.tipo === 'interno' ? 'Interna' : 'Externa'})
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleSaveUA}
                      disabled={savingUA || selectedUA === ''}
                      className="flex items-center justify-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-light uppercase tracking-wider rounded-xl transition-all"
                    >
                      <HiOutlineSave className="w-4 h-4" />
                      {savingUA ? 'Guardando...' : 'Guardar'}
                    </button>
                  </div>

                  {uaSaved && (
                    <p className="text-emerald-700 text-xs font-light mt-2 flex items-center gap-1">
                      <HiOutlineCheckCircle className="w-4 h-4" /> Unidad Académica guardada correctamente.
                    </p>
                  )}
                  {uaError && (
                    <p className="text-red-700 text-xs font-light mt-2">{uaError}</p>
                  )}
                </div>
              </div>

            </div>
          </div>

        </GlassCard>
      </div>

      {/* ─── 📦 SECCIÓN CONDICIONAL DEL ONBOARDING DESBLOQUEABLE ─── */}
      <div className="mt-8 border-t border-slate-200 pt-8">
        {requiereCompletarUA ? (
          <div className="max-w-md mx-auto text-center p-6 bg-slate-50 rounded-[24px] border border-dashed border-slate-200 opacity-60">
            <HiOutlineClipboardList className="w-10 h-10 text-slate-500 mx-auto mb-2" />
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">Onboarding Bloqueado</h4>
            <p className="text-[11px] text-slate-500 mt-1 font-light">
              Asigna tu Unidad Académica arriba para habilitar la solicitud del ticket.
            </p>
          </div>
        ) : (
          perfil && (
            <div className="animate-fadeIn">
              <PreTicketOnboarding 
                userId={perfil.id} 
                userEmail={perfil.email || ''} 
              />
            </div>
          )
        )}
      </div>

    </div>
  )
}