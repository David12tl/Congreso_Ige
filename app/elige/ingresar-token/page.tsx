 'use client'

import React, { useEffect, useState, useTransition } from 'react'
import { HiOutlineKey, HiOutlineCheckCircle, HiOutlineExclamationCircle, HiOutlineArrowRight } from 'react-icons/hi'
import { GlassCard } from '@/components/ui/GlassCard'
import { validarToken } from './actions'
import { actualizarMiUnidadAcademica, getMiPerfil, getUnidadesAcademicas } from '../perfil/actions'
import type { UnidadAcademica } from '../perfil/actions'

export default function IngresarTokenPage() {
  const [token, setToken] = useState('')
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [unidadStatus, setUnidadStatus] = useState<'checking' | 'required' | 'ready'>('checking')
  const [unidades, setUnidades] = useState<UnidadAcademica[]>([])
  const [selectedUA, setSelectedUA] = useState<number | ''>('')
  const [savingUA, setSavingUA] = useState(false)
  const [uaError, setUaError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadProfile() {
      const [profile, availableUnits] = await Promise.all([
        getMiPerfil(),
        getUnidadesAcademicas(),
      ])

      if (!active) return

      setUnidades(availableUnits)
      if (profile?.unidadAcademicaId != null) {
        setSelectedUA(profile.unidadAcademicaId)
        setUnidadStatus('ready')
      } else {
        setUnidadStatus('required')
      }
    }

    loadProfile().catch((loadError: unknown) => {
      console.error('[IngresarTokenPage] Error al consultar el perfil:', loadError)
      if (active) {
        setUaError('No se pudo consultar tu perfil. Recarga la página para continuar.')
        setUnidadStatus('required')
      }
    })

    return () => {
      active = false
    }
  }, [])

  const handleSaveUA = async () => {
    if (selectedUA === '') {
      setUaError('Selecciona una Unidad Académica.')
      return
    }

    setSavingUA(true)
    setUaError(null)
    const result = await actualizarMiUnidadAcademica(Number(selectedUA))
    setSavingUA(false)

    if (!result.success) {
      setUaError(result.message)
      return
    }

    setUnidadStatus('ready')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFeedback(null)

    startTransition(async () => {
      const result = await validarToken(token)
      if (result.success) {
        // Lógica para diferenciar el mensaje de éxito
        const successMessage = result.ticket?.tipo === 'docente'
          ? 'Gafete de organizador activado correctamente.'
          : 'Token validado correctamente. ¡Tu ticket está activo!'

        setFeedback({ type: 'success', message: successMessage })
        setToken('')
      } else {
        setFeedback({ type: 'error', message: result.message })
      }
    })
  }

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto p-4 md:p-0">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-black tracking-tight text-[#0f172a] dark:text-white text-2xl md:text-3xl">
            <HiOutlineKey className="inline-block w-8 h-8 mr-3 text-amber-700" />
            Ingresar{' '}
            <span className="text-amber-700">
              Token
            </span>
          </h1>
          
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
              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-[#0f172a] dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-all font-light"
              required
            />
          </div>

          {feedback?.type === 'error' && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-light">
              <HiOutlineExclamationCircle className="w-4 h-4" />
              {feedback.message}
            </div>
          )}

          {feedback?.type === 'success' && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-light">
              <HiOutlineCheckCircle className="w-4 h-4" />
              {feedback.message}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending || unidadStatus !== 'ready'}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-600 text-white font-bold rounded-xl uppercase tracking-widest hover:bg-amber-500 transition shadow-sm disabled:opacity-40"
          >
            {isPending ? (
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

      {unidadStatus !== 'ready' && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="unidad-academica-title"
            className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl dark:border-slate-700 dark:bg-[#2a2a2f] dark:text-white"
          >
            <h2 id="unidad-academica-title" className="text-lg font-bold">
              Unidad Académica obligatoria
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Selecciona tu Unidad Académica para poder canjear el boleto.
            </p>

            {unidadStatus === 'checking' ? (
              <p className="mt-5 text-sm" role="status">Verificando tu perfil...</p>
            ) : (
              <>
                <select
                  aria-label="Unidad Académica"
                  value={selectedUA}
                  onChange={(event) => setSelectedUA(Number(event.target.value) || '')}
                  className="mt-5 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                  disabled={savingUA}
                >
                  <option value="">Selecciona una unidad</option>
                  {unidades.map((unidad) => (
                    <option key={unidad.id} value={unidad.id}>{unidad.nombre}</option>
                  ))}
                </select>

                {uaError && (
                  <p className="mt-3 text-sm text-red-600" role="alert">{uaError}</p>
                )}
                {unidades.length === 0 && !uaError && (
                  <p className="mt-3 text-sm text-red-600" role="alert">
                    No hay Unidades Académicas disponibles. Intenta más tarde.
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleSaveUA}
                  disabled={savingUA || selectedUA === '' || unidades.length === 0}
                  className="mt-5 w-full rounded-xl bg-amber-700 px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {savingUA ? 'Guardando...' : 'Guardar y continuar'}
                </button>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  )
}