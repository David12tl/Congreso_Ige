'use client'

import React, { useState } from 'react'
import { HiOutlineCash, HiOutlineKey, HiOutlineClipboardCopy, HiOutlineExclamationCircle, HiOutlineCheckCircle } from 'react-icons/hi'
import { generarToken } from './actions'

function GlassCard({ children, className = '', glowColor = 'emerald' }: {
  children: React.ReactNode
  className?: string
  glowColor?: 'blue' | 'purple' | 'amber' | 'cyan' | 'emerald'
}) {
  const glowStyles: Record<string, string> = {
    blue: 'border-blue-200 shadow-sm',
    purple: 'border-purple-200 shadow-sm',
    amber: 'border-amber-200 shadow-sm',
    cyan: 'border-cyan-200 shadow-sm',
    emerald: 'border-emerald-200 shadow-sm',
  }

  return (
    <div className={`relative rounded-[24px] border bg-white overflow-hidden transition-all duration-300 ${glowStyles[glowColor]} ${className}`}>
      {children}
    </div>
  )
}

export default function GenerarTokensPage() {
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleGenerateToken = async () => {
    setLoading(true)
    setError(null)
    setToken(null)

    try {
      const result = await generarToken()
      if (result.success && result.token) {
        setToken(result.token)
      } else {
        setError(result.message)
      }
    } catch {
      setError('Error al generar el token. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (token) {
      navigator.clipboard.writeText(token)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto p-4 md:p-0">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-black tracking-tight text-[#0f172a] text-2xl md:text-3xl">
            <HiOutlineCash className="inline-block w-8 h-8 mr-3 text-emerald-700" />
            Taquilla y{' '}
            <span className="text-emerald-700">
              Tokens
            </span>
          </h1>
          <p className="text-slate-500 text-sm font-light mt-1">ADMIN // GENERACIÓN_DE_CREDenciales</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-emerald-700 text-xs font-bold uppercase tracking-widest">Sistema activo</span>
        </div>
      </header>

      {/* Token Generator */}
      <GlassCard className="p-8" glowColor="emerald">
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
            <HiOutlineKey className="w-10 h-10 text-emerald-700" />
          </div>

          <h2 className="text-xl font-bold text-[#0f172a] mb-2">Generador de Tokens</h2>
          <p className="text-slate-500 text-sm font-light mb-6 max-w-md">
            Genera tokens únicos para vincular asistentes con sus tickets y accesos al evento.
          </p>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-light mb-4">
              <HiOutlineExclamationCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {token && (
            <div className="w-full max-w-md mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <p className="text-xs text-emerald-700 font-light mb-2">Token generado:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-lg font-mono text-emerald-700 break-all">{token}</code>
                <button
                  onClick={copyToClipboard}
                  className="p-2 bg-emerald-100 rounded-lg hover:bg-emerald-200 transition"
                >
                  {copied ? (
                    <HiOutlineCheckCircle className="w-5 h-5 text-emerald-700" />
                  ) : (
                    <HiOutlineClipboardCopy className="w-5 h-5 text-emerald-700" />
                  )}
                </button>
              </div>
            </div>
          )}

          <button
            onClick={handleGenerateToken}
            disabled={loading}
            className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl uppercase tracking-widest hover:bg-emerald-500 transition shadow-sm disabled:opacity-40"
          >
            {loading ? 'Generando...' : 'Generar Nuevo Token'}
          </button>
        </div>
      </GlassCard>

      {/* Tokens List */}
      <GlassCard className="overflow-hidden" glowColor="blue">
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <span className="text-xs font-light text-slate-500 uppercase tracking-widest">Tokens Generados Recientemente</span>
        </div>
        <div className="p-6">
          <p className="text-slate-500 text-sm font-light text-center py-8">
            Los tokens aparecerán aquí una vez generados.
          </p>
        </div>
      </GlassCard>
    </div>
  )
}