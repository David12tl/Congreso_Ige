 'use client'

import React, { useState } from 'react'
import { HiOutlineKey, HiOutlineCheckCircle, HiOutlineExclamationCircle, HiOutlineArrowRight } from 'react-icons/hi'
import { GlassCard } from '@/components/ui/GlassCard'
import { validarToken } from './actions'

export default function IngresarTokenPage() {
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const result = await validarToken(token)
      if (result.success) {
        setSuccess(true)
        setToken('')
      } else {
        setError(result.message)
      }
    } catch {
      setError('Error al validar el token. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto p-4 md:p-0">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-black tracking-tight text-[#0f172a] text-2xl md:text-3xl">
            <HiOutlineKey className="inline-block w-8 h-8 mr-3 text-amber-700" />
            Ingresar{' '}
            <span className="text-amber-700">
              Token
            </span>
          </h1>
          <p className="text-slate-500 text-sm font-light mt-1">USUARIO // VINCULACIÓN_DE_TICKET</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-amber-700 text-xs font-bold uppercase tracking-widest">Pendiente</span>
        </div>
      </header>

      {/* Form Card */}
      <GlassCard className="p-8 max-w-2xl mx-auto" glowColor="amber">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-2">
              Token de Acceso
            </label>
            <input
              type="text"
              placeholder="Ej: IGE-2026-XXXX-XXXX"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-[#0f172a] placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-all font-light"
              required
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-light">
              <HiOutlineExclamationCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-light">
              <HiOutlineCheckCircle className="w-4 h-4" />
              Token validado correctamente. ¡Tu ticket está activo!
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-600 text-white font-bold rounded-xl uppercase tracking-widest hover:bg-amber-500 transition shadow-sm disabled:opacity-40"
          >
            {loading ? (
              'Validando...'
            ) : (
              <>
                Validar Token
                <HiOutlineArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </GlassCard>
    </div>
  )
}