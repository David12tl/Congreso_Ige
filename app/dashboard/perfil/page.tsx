'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { 
  HiOutlineIdentification, 
  HiOutlineUser, 
  HiOutlineMail, 
  HiOutlineAcademicCap,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineSave,
  HiOutlineClipboardList
} from 'react-icons/hi'

// Importamos createClient directo de supabase-js para evitar problemas con helpers obsoletos
import { createClient } from '@supabase/supabase-js'
import { getMiPerfil, getUnidadesAcademicas, actualizarMiUnidadAcademica } from './actions'
import { getResumenAsistente } from '../usuario/actions'
import { GlassCard } from '@/components/ui/GlassCard'

// Inicializamos el cliente de supabase del lado del cliente de forma directa y segura
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseAnonKey)

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

import { PreTicketOnboarding } from './PreTicketOnboarding'

export default function PerfilPage() {
  const [perfil, setPerfil] = useState<PerfilUsuarioConId | null>(null)
  const [resumen, setResumen] = useState<ResumenDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  const [unidadesAcademicas, setUnidadesAcademicas] = useState<UnidadAcademica[]>([])
  const [selectedUA, setSelectedUA] = useState<number | ''>('')
  const [savingUA, setSavingUA] = useState(false)
  const [uaSaved, setUaSaved] = useState(false)
  const [uaError, setUaError] = useState<string | null>(null)

  const requiereCompletarUA = perfil !== null && perfil.unidadAcademicaId === null

  const actualizarDatosPantalla = async () => {
    try {
      const [dataPerfil, dataResumen, dataUAs, { data: { session } }] = await Promise.all([
        getMiPerfil(),
        getResumenAsistente(),
        getUnidadesAcademicas(),
        supabase.auth.getSession()
      ])
      
      if (dataPerfil) {
        setPerfil(dataPerfil as PerfilUsuarioConId)
      } else {
        setPerfil(null)
      }
      
      setResumen(dataResumen)
      setUnidadesAcademicas(dataUAs as UnidadAcademica[])

      // Intentamos recuperar la URL del avatar buscando en ambas posibilidades de metadatos del proveedor (OAuth)
      const userMetadata = session?.user?.user_metadata
      const photoUrl = userMetadata?.avatar_url || userMetadata?.picture || null
      setAvatarUrl(photoUrl)

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
        const [dataPerfil, dataResumen, dataUAs, { data: { session } }] = await Promise.all([
          getMiPerfil(),
          getResumenAsistente(),
          getUnidadesAcademicas(),
          supabase.auth.getSession()
        ])
        
        if (activo) {
          if (dataPerfil) {
            setPerfil(dataPerfil as PerfilUsuarioConId)
          } else {
            setPerfil(null)
          }

          setResumen(dataResumen)
          setUnidadesAcademicas(dataUAs as UnidadAcademica[])

          // Intentamos recuperar la URL del avatar buscando en ambas posibilidades de metadatos del proveedor (OAuth)
          const userMetadata = session?.user?.user_metadata
          const photoUrl = userMetadata?.avatar_url || userMetadata?.picture || null
          setAvatarUrl(photoUrl)

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
  }, []) // Dependencias limpias y seguras para evitar bucles infinitos de renderizado

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
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 bg-[#f8fafc]">
        <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-[#1e3a8a] animate-spin" />
        <p className="text-[#475569] font-light text-xs uppercase tracking-widest">Leyendo bases de datos...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto p-4 md:p-0 text-[#1e293b]">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-black tracking-tight text-[#0f172a] text-2xl md:text-3xl">
            <HiOutlineIdentification className="inline-block w-8 h-8 mr-3 text-[#1e3a8a]" />
            Mi{' '}
            <span className="text-[#1e3a8a]">
              Perfil
            </span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-[#1e3a8a]/5 border border-[#1e3a8a]/20 rounded-full">
            <div className="w-2 h-2 rounded-full bg-[#1e3a8a] animate-pulse" />
            <span className="text-[#1e3a8a] text-xs font-bold uppercase tracking-widest">
              {resumen?.ticketType ? `Perfil ${resumen.ticketType}` : 'Perfil Activo'}
            </span>
          </div>
        </div>
      </header>

      {/* 📢 BANNER: Si no ha seleccionado UA aún */}
      {requiereCompletarUA && (
        <GlassCard className="p-5 border-l-4 border-[#7f1d1d] bg-[#fef2f2]" glowColor="amber">
          <div className="flex items-start gap-4">
            <HiOutlineExclamationCircle className="w-8 h-8 text-[#7f1d1d] shrink-0 mt-0.5" />
            <div>
              <h3 className="text-base font-bold text-[#7f1d1d] uppercase tracking-wider">
                Unidad Académica Obligatoria
              </h3>
              <p className="text-sm text-[#475569] mt-1 font-light">
                Para poder tramitar tu solicitud de registro al congreso, primero debes asignar tu Unidad Académica en el panel Datos del Perfil abajo. Una vez guardado, se desbloqueará tu formulario de pre-ticket.
              </p>
            </div>
          </div>
        </GlassCard>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Panel Izquierdo: Avatar Dinámico de Google o Iniciales */}
        <GlassCard className="p-8 flex flex-col items-center justify-center text-center bg-white border border-[#cbd5e1] shadow-sm" glowColor="cyan">
          
          {/* Contenedor circular idéntico al de tu segunda imagen */}
          <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-[#e0e7ff] flex items-center justify-center text-[#1e3a8a] shadow-md relative shrink-0">
            {avatarUrl ? (
              <Image 
                src={avatarUrl} 
                alt="Foto de Perfil" 
                width={128}
                height={128}
                className="w-full h-full object-cover rounded-full"
                unoptimized 
              />
            ) : perfil?.email ? (
              <span className="text-3xl font-extrabold tracking-wider uppercase text-[#1e3a8a]">
                {perfil.email.substring(0, 2)}
              </span>
            ) : (
              <HiOutlineUser className="w-12 h-12 text-[#475569]" />
            )}
          </div>

          <h2 className="text-xl font-bold text-[#0f172a] mt-4 truncate max-w-full">
            {perfil?.email || 'Asistente Anónimo'}
          </h2>
          <span className="px-3 py-1 mt-2 rounded-full bg-[#1e3a8a]/10 text-[#1e3a8a] border border-[#1e3a8a]/20 text-xs font-bold uppercase tracking-wider">
            {perfil?.rolNombre || 'Asistente'}
          </span>
          <p className="text-[10px] text-[#475569] font-semibold mt-4 uppercase tracking-wider">
            Miembro desde: <span className="font-light text-[#1e293b]">{perfil?.createdAt ? new Date(perfil.createdAt).toLocaleDateString() : '—'}</span>
          </p>
        </GlassCard>

        {/* Panel Derecho: Datos de Registro */}
        <GlassCard className="p-8 lg:col-span-2 flex flex-col justify-between bg-white border border-[#cbd5e1] shadow-sm" glowColor="purple">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-[#0f172a] uppercase tracking-wider border-b-2 border-[#7f1d1d] pb-1">Datos del Perfil</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                <HiOutlineUser className="w-6 h-6 text-[#1e3a8a]" />
                <div className="flex-1">
                  <p className="text-[10px] text-[#475569] uppercase tracking-widest font-bold">Nombre Completo</p>
                  <p className="text-[#0f172a] font-medium">
                    {resumen?.hasTicket ? 'Revisa tu credencial en el módulo Pase' : '—'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                <HiOutlineMail className="w-6 h-6 text-[#7f1d1d]" />
                <div>
                  <p className="text-[10px] text-[#475569] uppercase tracking-widest font-bold">Correo Electrónico</p>
                  <p className="text-[#0f172a] font-medium">{perfil?.email || '—'}</p>
                </div>
              </div>

              {/* Selector de Unidad Académica */}
              <div className="flex items-start gap-4 p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                <HiOutlineAcademicCap className="w-6 h-6 text-[#1e3a8a] mt-1" />
                <div className="flex-1">
                  <p className="text-[10px] text-[#475569] uppercase tracking-widest font-bold">
                    Unidad Académica <span className="text-[#7f1d1d]">*</span>
                  </p>
                  {perfil?.unidadAcademicaNombre ? (
                    <p className="text-[#0f172a] font-medium flex items-center gap-2 mt-1">
                      {perfil.unidadAcademicaNombre}
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <HiOutlineCheckCircle className="w-3 h-3" /> Asignada
                      </span>
                    </p>
                  ) : (
                    <p className="text-[#7f1d1d] font-bold text-sm mt-1">No asignada</p>
                  )}

                  <div className="mt-4 flex flex-col sm:flex-row gap-2">
                    <select
                      value={selectedUA}
                      onChange={(e) => {
                        setSelectedUA(e.target.value ? Number(e.target.value) : '')
                        setUaError(null)
                      }}
                      className="flex-1 bg-white border border-[#cbd5e1] rounded-xl px-4 py-2 text-sm text-[#0f172a] focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] outline-none font-medium"
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
                      className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-[#1e3a8a] hover:bg-[#172554] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm"
                    >
                      <HiOutlineSave className="w-4 h-4" />
                      {savingUA ? 'Guardando...' : 'Guardar'}
                    </button>
                  </div>

                  {uaSaved && (
                    <p className="text-emerald-700 text-xs font-semibold mt-3 flex items-center gap-1">
                      <HiOutlineCheckCircle className="w-4 h-4" /> Unidad Académica guardada correctamente.
                    </p>
                  )}
                  {uaError && (
                    <p className="text-[#7f1d1d] text-xs font-bold mt-3">{uaError}</p>
                  )}
                </div>
              </div>

            </div>
          </div>

        </GlassCard>
      </div>

      {/* ─── 📦 SECCIÓN CONDICIONAL DEL ONBOARDING DESBLOQUEABLE ─── */}
      <div className="mt-8 border-t border-[#cbd5e1] pt-8">
        {requiereCompletarUA ? (
          <div className="max-w-md mx-auto text-center p-8 bg-white rounded-[24px] border border-dashed border-[#cbd5e1] opacity-75">
            <HiOutlineClipboardList className="w-10 h-10 text-[#475569] mx-auto mb-2" />
            <h4 className="text-xs font-black uppercase tracking-widest text-[#475569]">Onboarding Bloqueado</h4>
            <p className="text-[11px] text-[#475569] mt-1 font-medium">
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