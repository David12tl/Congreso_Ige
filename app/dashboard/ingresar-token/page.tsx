'use client'

import React, { useState } from 'react'
import { HiOutlineTicket, HiOutlineCheckCircle, HiOutlineExclamationCircle, HiOutlineShieldCheck } from 'react-icons/hi'
import { activarTokenCompra } from './actions'

export default function IngresarTokenPage() {
  const [tokenInput, setTokenInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{ tipo: 'success' | 'error'; msg: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tokenInput.trim()) return

    setLoading(true)
    setStatus(null)

    try {
      const res = await activarTokenCompra(tokenInput.trim())
      
      if (res.success) {
        setStatus({ tipo: 'success', msg: res.message })
        setTokenInput('')
      } else {
        setStatus({ tipo: 'error', msg: res.message })
      }
    } catch (err) {
      setStatus({ 
        tipo: 'error', 
        msg: 'Ocurrió un fallo en la comunicación con el servidor de autenticación.' 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center p-4 relative overflow-hidden animate-fadeIn">
      
      {/* Fondo de Retícula Estilo Cyberpunk */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" 
      />

      {/* Contenedor Flotante de Vidrio (Glassmorphism) */}
      <div className="relative z-10 w-full max-w-lg border border-purple-500/30 bg-slate-900/40 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-[0_0_30px_rgba(168,85,247,0.15)] transition-all duration-300 hover:border-purple-500/50">
        
        {/* Encabezado del Módulo */}
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400 mb-2">
            <HiOutlineTicket className="w-8 h-8 animate-pulse" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tighter uppercase">
            Activar Token de Acceso
          </h1>
          <p className="text-gray-400 text-xs font-mono uppercase tracking-widest">
            GATEWAY // VINCULAR_COMPRA_STRIPE
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono text-gray-400 uppercase tracking-widest block">
              Identificador de Sesión / Token ID
            </label>
            <input
              type="text"
              required
              disabled={loading}
              placeholder="cs_test_a1b2c3d4e5..."
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder-gray-700 focus:outline-none focus:border-purple-500 disabled:opacity-50 transition-all shadow-inner"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !tokenInput.trim()}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-mono font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                Validando Registro...
              </>
            ) : (
              'Reclamar Mi Pase Digital'
            )}
          </button>
        </form>

        {/* Consola de Respuestas de la Base de Datos */}
        {status && (
          <div className={`mt-6 p-4 rounded-xl border font-mono text-xs ${
            status.tipo === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
              : 'bg-pink-500/10 border-pink-500/30 text-pink-400'
          }`}>
            <div className="flex gap-2 items-start">
              {status.tipo === 'success' ? (
                <HiOutlineCheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
              ) : (
                <HiOutlineExclamationCircle className="w-5 h-5 shrink-0 mt-0.5" />
              )}
              <div>
                <span className="font-bold uppercase tracking-wider block mb-0.5">
                  {status.tipo === 'success' ? 'SYSTEM_OK // SUCCESS' : 'SYSTEM_ERR // DENIED'}
                </span>
                <p className="opacity-90">{status.msg}</p>
                {status.tipo === 'success' && (
                  <a 
                    href="/dashboard/pase" 
                    className="inline-block mt-2 text-white bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 rounded hover:bg-emerald-500/30 transition-all font-sans font-bold text-[11px] uppercase tracking-wider"
                  >
                    Ir a ver mi código QR →
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Pie Informativo de Seguridad */}
        <div className="mt-8 border-t border-white/5 pt-4 flex items-center justify-between text-[10px] font-mono text-gray-500">
          <span className="flex items-center gap-1">
            <HiOutlineShieldCheck className="text-purple-500 w-4 h-4" /> SECURE_SSL_ACTIVE
          </span>
          <span>CONGRESO_IGE_2026</span>
        </div>

      </div>
    </div>
  )
}