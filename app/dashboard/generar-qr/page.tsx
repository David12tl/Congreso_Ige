'use client'

import React, { useState } from 'react'
import { HiOutlineQrcode, HiOutlineDownload, HiOutlineClock } from 'react-icons/hi'
import { QRCodeSVG } from 'qrcode.react' // 1. Importamos la librería real

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
  // 2. Simulamos el estado del usuario. Cambia 'pagoAprobado' a false para ver el otro estado.
  const [userStatus, setUserStatus] = useState({
    pagoAprobado: true, 
    zonaTeatro: 'VIP CENTRAL',
    ticketId: 'CONGRESO-IGE-2026-USER99' // Este ID irá dentro del QR
  });

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto p-4 md:p-0">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase">
            <HiOutlineQrcode className="inline-block w-8 h-8 mr-3 text-purple-400" />
            Acceso{' '}
            <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              Digital
            </span>
          </h1>
          <p className="text-gray-500 text-sm font-mono mt-1">USUARIO // ESTADO_DE_TICKET</p>
        </div>
        
        {/* Badge dinámico */}
        <div className={`flex items-center gap-2 px-4 py-2 border rounded-full ${
          userStatus.pagoAprobado 
            ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' 
            : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
        }`}>
          <div className={`w-2 h-2 rounded-full animate-pulse ${userStatus.pagoAprobado ? 'bg-purple-500' : 'bg-amber-500'}`} />
          <span className="text-xs font-bold uppercase tracking-widest">
            {userStatus.pagoAprobado ? 'Ticket listo' : 'Verificación pendiente'}
          </span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto">
        {userStatus.pagoAprobado ? (
          // ================= VISTA SPRINT 3: PAGO APROBADO =================
          <GlassCard className="p-8" glowColor="purple">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="relative mb-6">
                <div className="absolute -inset-4 bg-purple-500/20 rounded-3xl blur-xl animate-pulse" />
                
                {/* Contenedor del QR Real */}
                <div className="relative p-4 bg-white border-2 border-purple-500/50 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                  <QRCodeSVG 
                    value={userStatus.ticketId} 
                    size={180}
                    bgColor={"#FFFFFF"}
                    fgColor={"#020617"} // Color pizarra oscuro para que contraste bien y se escanee perfecto
                  />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-white mb-1">Tu Código QR</h2>
              {/* HISTORIA DE USUARIO: Mostrar el nombre de su zona del teatro */}
              <div className="mb-4 px-3 py-1 bg-purple-500/20 border border-purple-500/40 rounded text-xs font-mono font-bold text-purple-300 uppercase tracking-wider">
                Zona: {userStatus.zonaTeatro}
              </div>
              
              <p className="text-gray-400 text-sm max-w-md mb-6">
                Este código QR es tu pase de acceso personal al evento.
                Preséntalo al encargado en la entrada del teatro.
              </p>

              <button className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl uppercase tracking-widest flex items-center justify-center gap-2 hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg">
                <HiOutlineDownload className="w-5 h-5" />
                Descargar QR
              </button>
            </div>
          </GlassCard>
        ) : (
          // ================= VISTA SPRINT 3: PAGO NO APROBADO =================
          <GlassCard className="p-8" glowColor="amber">
            <div className="flex flex-col items-center text-center py-6">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                <HiOutlineClock className="w-8 h-8 text-amber-400 animate-spin-slow" />
              </div>
              
              <h2 className="text-xl font-bold text-white mb-2">Validación en Proceso</h2>
              <p className="text-gray-400 text-sm max-w-sm mb-4">
                Tu pago está siendo revisado por un encargado del comité organizador.
              </p>
              <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl max-w-xs">
                <p className="text-amber-400 text-xs font-mono">
                  En cuanto se apruebe el depósito, tu zona asignada y tu pase QR se activarán automáticamente en esta sección.
                </p>
              </div>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  )
}