'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { HiOutlineExclamationCircle, HiOutlineClipboardList } from 'react-icons/hi'
import { createBrowserClient } from '@supabase/ssr'
import type { User } from '@supabase/supabase-js'

import { getMiPerfil, getUnidadesAcademicas, actualizarMiUnidadAcademica } from './actions'
import { getResumenAsistente } from '../usuario/actions'
import { GlassCard } from '@/components/ui/GlassCard'
import { PreTicketOnboarding } from './PreTicketOnboarding'

// Componentes modulares
import { ProfileHeader } from './ProfileHeader'
import { ProfileAvatarCard } from './ProfileAvatarCard'
import { ProfileDetailsCard } from './ProfileDetailsCard'
import { VoucherUploader } from './VoucherUploaderClient'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

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

interface OAuthUserMetadata {
  avatar_url?: string
  picture?: string
  [key: string]: unknown
}

function extraerAvatarDeUsuario(user: User | null | undefined): string | null {
  if (!user) return null
  const metadata = user.user_metadata as OAuthUserMetadata | undefined
  if (metadata?.avatar_url) return metadata.avatar_url
  if (metadata?.picture) return metadata.picture

  const identity = user.identities?.[0]
  if (identity?.identity_data) {
    const idData = identity.identity_data as OAuthUserMetadata
    if (idData.avatar_url) return idData.avatar_url
    if (idData.picture) return idData.picture
  }
  return null
}

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

  const cargarDatos = useCallback(async () => {
    try {
      const [dataPerfil, dataResumen, dataUAs, { data: { session } }] = await Promise.all([
        getMiPerfil(),
        getResumenAsistente(),
        getUnidadesAcademicas(),
        supabase.auth.getSession(),
      ])

      if (dataPerfil) {
        setPerfil(dataPerfil)
        if (dataPerfil.unidadAcademicaId) {
          setSelectedUA(dataPerfil.unidadAcademicaId)
        }
      } else {
        setPerfil(null)
      }

      setResumen(dataResumen)
      setUnidadesAcademicas(dataUAs)

      const photoUrl = extraerAvatarDeUsuario(session?.user)
      setAvatarUrl(photoUrl)
    } catch (err) {
      console.error('Error al sincronizar datos del perfil:', err)
    }
  }, [])

  useEffect(() => {
    let activo = true

    const inicializar = async () => {
      await cargarDatos()
      if (activo) setLoading(false)
    }

    inicializar()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (activo && session?.user) {
        setAvatarUrl(extraerAvatarDeUsuario(session.user))
      }
    })

    return () => {
      activo = false
      subscription.unsubscribe()
    }
  }, [cargarDatos])

  const handleSaveUA = async () => {
    if (selectedUA === '') return
    setSavingUA(true)
    setUaSaved(false)
    setUaError(null)

    try {
      const res = await actualizarMiUnidadAcademica(Number(selectedUA))
      if (res.success) {
        setUaSaved(true)
        await cargarDatos()
        setTimeout(() => setUaSaved(false), 3000)
      } else {
        setUaError(res.message)
      }
    } catch {
      setUaError('Error crítico al guardar. Intenta de nuevo.')
    } finally { // Corregido el error tipográfico
      setSavingUA(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 bg-slate-50 dark:bg-transparent">
        <div className="w-12 h-12 rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-[#1e3a8a] animate-spin" />
        <p className="text-[#475569] font-light text-xs uppercase tracking-widest">Leyendo bases de datos...</p>
      </div>
    )
  }

  const matriculaUsuario = perfil?.email ? perfil.email.split('@')[0] : 'sin_matricula'

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto p-4 md:p-0 text-slate-900 dark:text-slate-100">
      
      {/* 1. Header */}
      <ProfileHeader ticketType={resumen?.ticketType} />

      {/* 2. Banner de Unidad Académica */}
      {requiereCompletarUA && (
        <GlassCard className="p-5 border-l-4 border-[#7f1d1d] bg-[#fef2f2] dark:bg-[#2a2a2f]" glowColor="amber">
          <div className="flex items-start gap-4">
            <HiOutlineExclamationCircle className="w-8 h-8 text-[#7f1d1d] dark:text-red-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-base font-bold text-[#7f1d1d] dark:text-red-300 uppercase tracking-wider">
                Unidad Académica Obligatoria
              </h3>
              <p className="text-sm text-[#475569] dark:text-slate-400 mt-1 font-light">
                Para poder tramitar tu solicitud de registro al congreso, primero debes asignar tu Unidad Académica en el panel Datos del Perfil abajo. Una vez guardado, se desbloqueará tu formulario de pre-ticket.
              </p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* 3. Grid de Perfil */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ProfileAvatarCard 
          email={perfil?.email || null}
          avatarUrl={avatarUrl}
          rolNombre={perfil?.rolNombre || 'Asistente'}
          createdAt={perfil?.createdAt}
        />

        <ProfileDetailsCard 
          hasTicket={Boolean(resumen?.hasTicket)}
          email={perfil?.email || null}
          unidadAcademicaNombre={perfil?.unidadAcademicaNombre || null}
          unidadesAcademicas={unidadesAcademicas}
          selectedUA={selectedUA}
          setSelectedUA={setSelectedUA}
          onSaveUA={handleSaveUA}
          savingUA={savingUA}
          uaSaved={uaSaved}
          uaError={uaError}
          setUaError={setUaError}
        />
      </div>

      {/* 4. Subida de Vouchers de Pago */}
      {perfil && (
        <VoucherUploader 
          userId={perfil.id} 
          matricula={matriculaUsuario} 
        />
      )}

      {/* 5. Onboarding Condicional */}
      <div className="mt-8 border-t border-[#cbd5e1] dark:border-slate-700 pt-8">
        {requiereCompletarUA ? (
          <div className="max-w-md mx-auto text-center p-8 bg-white dark:bg-[#2a2a2f] rounded-[24px] border border-dashed border-[#cbd5e1] dark:border-slate-700 opacity-75">
            <HiOutlineClipboardList className="w-10 h-10 text-[#475569] dark:text-slate-400 mx-auto mb-2" />
            <h4 className="text-xs font-black uppercase tracking-widest text-[#475569] dark:text-slate-300">Bloqueado</h4>
            <p className="text-[11px] text-[#475569] dark:text-slate-400 mt-1 font-medium">
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