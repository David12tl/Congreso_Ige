'use client'

import React from 'react'
import { HiOutlinePlusCircle, HiOutlineKey, HiOutlineLogin } from 'react-icons/hi'

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

export default function IngresarTokenPage() {
  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto p-4 md:p-0">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase">
            <HiOutlineKey className="inline-block w-8 h-8 mr-3 text-cyan-400" />
            Ingresar{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Token
            </span>
          </h1>
          <p className="text-gray-500 text-sm font-mono mt-1">USUARIO // CANJE_DE_TOKEN_DE_ACCESO</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full">
          <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
          <span className="text-cyan-400 text-xs font-bold uppercase tracking-widest">Token válido</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto">
        <GlassCard className="p-8" glowColor="cyan">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(34,211,238,0.15)]">
              <HiOutlineKey className="w-10 h-10 text-cyan-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Ingresa tu Token</h2>
            <p className="text-gray-400 text-sm max-w-md">
              Introduce el token que te proporcionó el encargado de tu Unidad
              Académica para registrarte en el evento.
            </p>
          </div>

          {/* Token Input */}
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-cyan-500 uppercase tracking-widest mb-2">
                Código de Token
              </label>
              <input
                type="text"
                placeholder="Ej: TOKEN-XXXX-XXXX"
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-5 py-4 text-white font-mono text-lg tracking-widest text-center focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-gray-600"
              />
            </div>
            <button className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-xl uppercase tracking-widest flex items-center justify-center gap-2 hover:from-cyan-500 hover:to-blue-500 transition-all shadow-lg">
              <HiOutlineLogin className="w-5 h-5" />
              Canjear Token
            </button>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-amber-400 text-xs font-mono text-center">
              Próximamente — Validación de tokens contra la base de datos
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}