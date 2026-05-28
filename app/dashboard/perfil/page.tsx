'use client'

import React, { useEffect, useState } from 'react'
import { 
  HiOutlineIdentification, 
  HiOutlineUser, 
  HiOutlineMail, 
  HiOutlineBadgeCheck, 
  HiOutlinePencilAlt
} from 'react-icons/hi'

import { getMiPerfil, PerfilUsuario } from './actions'
import { getResumenAsistente, ResumenDashboard } from '../usuario/actions'
import CompleteProfileModal from '../usuario/CompleteProfileModal'

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
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Función externa al useEffect para que el modal pueda invocarla en onSuccess
  const actualizarDatosPantalla = async () => {
    try {
      const [dataPerfil, dataResumen] = await Promise.all([
        getMiPerfil(),
        getResumenAsistente()
      ])
      setPerfil(dataPerfil)
      setResumen(dataResumen)
    } catch (err) {
      console.error("Error al sincronizar datos del asistente:", err)
    }
  }

  useEffect(() => {
    let activo = true

    const sincronizarPerfil = async () => {
      try {
        const [dataPerfil, dataResumen] = await Promise.all([
          getMiPerfil(),
          getResumenAsistente()
        ])
        
        if (activo) {
          setPerfil(dataPerfil)
          setResumen(dataResumen)
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
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:text-white hover:bg-purple-500/20 text-xs font-mono font-bold uppercase tracking-wider rounded-xl transition-all"
          >
            <HiOutlinePencilAlt className="w-4 h-4" /> COMPRAR BOLETO
          </button>
          <div className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full">
            <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
            <span className="text-cyan-400 text-xs font-bold uppercase tracking-widest">
              {resumen?.ticketType ? `Perfil ${resumen.ticketType}` : 'Perfil Activo'}
            </span>
          </div>
        </div>
      </header>

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
              
              {resumen?.hasTicket && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:text-white hover:bg-purple-500/20 text-xs font-mono font-bold uppercase tracking-wider rounded-xl transition-all"
                >
                  <HiOutlinePencilAlt className="w-4 h-4" /> Completar Información
                </button>
              )}
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

      <CompleteProfileModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          actualizarDatosPantalla();
        }}
      />
    </div>
  )
}