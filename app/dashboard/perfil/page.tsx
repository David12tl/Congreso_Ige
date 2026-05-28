'use client'

import React from 'react'
import { HiOutlineIdentification, HiOutlineUser, HiOutlineMail, HiOutlineBadgeCheck } from 'react-icons/hi'

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
        <div className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full">
          <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
          <span className="text-cyan-400 text-xs font-bold uppercase tracking-widest">Perfil activo</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar / Photo */}
        <GlassCard className="p-8 flex flex-col items-center" glowColor="cyan">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-[0_0_30px_rgba(34,211,238,0.3)]">
            <HiOutlineUser className="w-12 h-12" />
          </div>
          <h2 className="text-xl font-bold text-white mt-4">—</h2>
          <span className="px-3 py-1 mt-2 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-bold uppercase tracking-wider">
            Asistente
          </span>
        </GlassCard>

        {/* Info details */}
        <GlassCard className="p-8 lg:col-span-2" glowColor="purple">
          <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-widest">Datos del Perfil</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <HiOutlineUser className="w-6 h-6 text-cyan-400" />
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Nombre Completo</p>
                <p className="text-white font-medium">—</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <HiOutlineMail className="w-6 h-6 text-purple-400" />
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Correo Electrónico</p>
                <p className="text-white font-medium">—</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <HiOutlineBadgeCheck className="w-6 h-6 text-emerald-400" />
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">ID de Acceso</p>
                <p className="text-white font-mono tracking-wider">—</p>
              </div>
            </div>
          </div>
          <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-amber-400 text-xs font-mono">Próximamente — Edición de perfil y enlace a DB</p>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}