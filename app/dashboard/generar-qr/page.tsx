'use client'

import React from 'react'
import { HiOutlineQrcode, HiOutlineDownload } from 'react-icons/hi'

function GlassCard({ children, className = '', glowColor = 'purple' }: {
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

export default function GenerarQRPage() {
  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto p-4 md:p-0">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase">
            <HiOutlineQrcode className="inline-block w-8 h-8 mr-3 text-purple-400" />
            Generar{' '}
            <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              QR
            </span>
          </h1>
          <p className="text-gray-500 text-sm font-mono mt-1">USUARIO // CÓDIGO_QR_DE_ACCESO_PERSONAL</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full">
          <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
          <span className="text-purple-400 text-xs font-bold uppercase tracking-widest">QR listo</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto">
        <GlassCard className="p-8" glowColor="purple">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="relative mb-6">
              {/* QR Pulse ring */}
              <div className="absolute -inset-4 bg-purple-500/20 rounded-3xl blur-xl animate-pulse" />
              <div className="relative w-48 h-48 bg-slate-950 border-2 border-purple-500/50 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                {/* QR placeholder grid */}
                <div className="grid grid-cols-6 gap-1.5 p-4 w-full h-full">
                  {Array.from({ length: 36 }).map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-sm ${
                        i % 2 === 0 || i % 5 === 0 || i % 7 === 0
                          ? 'bg-white/80'
                          : 'bg-transparent'
                      }`}
                    />
                  ))}
                </div>
                {/* Center logo */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                    <HiOutlineQrcode className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">Tu Código QR</h2>
            <p className="text-gray-400 text-sm max-w-md mb-6">
              Este código QR es tu pase de acceso personal al evento.
              Preséntalo al encargado de tu UA para registrar tu entrada.
            </p>

            <button className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl uppercase tracking-widest flex items-center justify-center gap-2 hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg">
              <HiOutlineDownload className="w-5 h-5" />
              Descargar QR
            </button>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-amber-400 text-xs font-mono text-center">
              Próximamente — Generación dinámica de QR con datos del usuario
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}