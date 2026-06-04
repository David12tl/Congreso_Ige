'use client'

import React, { useState, useTransition } from 'react'
import { HiOutlineKey, HiOutlineLogin, HiOutlineCheckCircle, HiOutlineExclamationCircle, HiTicket } from 'react-icons/hi'
import { activarTokenCompra } from './actions' 

// Interfaz explícita para evitar errores de tipo 'unknown' al renderizar
interface InfoAsientoCanjeado {
  id: string
  asientoReal: string | null
}

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
  const [isPending, startTransition] = useTransition()
  const [tokenInput, setTokenInput] = useState('')
  const [statusMessage, setStatusMessage] = useState<{ success: boolean; text: string } | null>(null)
  const [asientosReclamados, setAsientosReclamados] = useState<InfoAsientoCanjeado[] | null>(null)

  const handleCanjear = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!tokenInput.trim()) {
      setStatusMessage({ success: false, text: 'Por favor, escribe el código del token.' })
      return
    }

    setStatusMessage(null)
    setAsientosReclamados(null)

    startTransition(async () => {
      // Forzamos mayúsculas automáticas para evitar errores por letras minúsculas
      const resultado = await activarTokenCompra(tokenInput.trim().toUpperCase())
      
      if (resultado.success) {
        setStatusMessage({ success: true, text: resultado.message })
        if (resultado.asientos) {
          setAsientosReclamados(resultado.asientos)
        }
        setTokenInput('') 
      } else {
        setStatusMessage({ success: false, text: resultado.message })
      }
    })
  }

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto p-4 md:p-6 text-white">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase flex items-center">
            <HiOutlineKey className="w-8 h-8 mr-3 text-cyan-400 shrink-0" />
            Ingresar{' '}
            <span className="ml-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Token
            </span>
          </h1>
          <p className="text-gray-500 text-sm font-mono mt-1">USUARIO // CANJE_DE_TOKEN_DE_ACCESO</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full self-start md:self-auto">
          <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
          <span className="text-cyan-400 text-xs font-bold uppercase tracking-widest">Módulo de Validación</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto">
        <GlassCard className="p-8" glowColor={statusMessage?.success ? 'emerald' : 'cyan'}>
          <form onSubmit={handleCanjear} className="space-y-6">
            
            <div className="flex flex-col items-center text-center mb-4">
              <div className={`w-20 h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-6 transition-all duration-300 ${statusMessage?.success ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'text-cyan-400'}`}>
                <HiOutlineKey className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Ingresa tu Token</h2>
              <p className="text-gray-400 text-sm max-w-md">
                Introduce el token que te proporcionó el encargado de tu Unidad
                Académica para registrarte en el evento.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-cyan-500 uppercase tracking-widest mb-2">
                  Código de Token
                </label>
                <input
                  type="text"
                  placeholder="Ej: TK-R8Y2N1"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  disabled={isPending}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-5 py-4 text-white font-mono text-lg tracking-widest text-center focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-gray-600 uppercase"
                />
              </div>

              {statusMessage && (
                <div className={`p-4 rounded-xl flex items-center gap-3 text-sm transition-all ${
                  statusMessage.success 
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                    : 'bg-red-500/10 border border-red-500/20 text-red-400'
                }`}>
                  {statusMessage.success ? (
                    <HiOutlineCheckCircle className="w-5 h-5 shrink-0" />
                  ) : (
                    <HiOutlineExclamationCircle className="w-5 h-5 shrink-0" />
                  )}
                  <span>{statusMessage.text}</span>
                </div>
              )}

              {/* DETALLE REAL DE LOS ASIENTOS ASIGNADOS */}
              {statusMessage?.success && asientosReclamados && (
                <div className="p-4 bg-black/40 border border-emerald-500/20 rounded-xl space-y-3">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-gray-400 block uppercase">
                    Asientos Asignados a tu Cuenta ({asientosReclamados.length}):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {asientosReclamados.map((asiento, index) => {
                      const nombreLimpio = asiento.asientoReal 
                        ? asiento.asientoReal.replace(/-/g, ' ') 
                        : `Lugar de Auditorio #${index + 1}`

                      return (
                        <div key={asiento.id || index} className="flex items-center gap-3 bg-slate-900/90 border border-white/5 p-3 rounded-xl shadow-inner">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                            <HiTicket className="w-5 h-5" />
                          </div>
                          <div className="font-mono text-left">
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Pase Asignado</p>
                            <p className="text-xs font-black uppercase text-emerald-400">
                              {nombreLimpio}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <button 
                type="submit"
                disabled={isPending || !tokenInput.trim()}
                className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-gray-500 text-white font-bold rounded-xl uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg"
              >
                <HiOutlineLogin className="w-5 h-5" />
                {isPending ? 'Verificando en Base de Datos...' : 'Canjear Token'}
              </button>
            </div>

          </form>
        </GlassCard>
      </div>
    </div>
  )
}