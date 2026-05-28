'use client'

import React, { useEffect, useState, useTransition } from 'react'
import { HiOutlineOfficeBuilding, HiOutlinePlusCircle, HiOutlineAcademicCap, HiOutlineGlobeAlt } from 'react-icons/hi'
import { getUnidadesAcademicas, createUnidadAcademica, UnidadAcademica } from './actions'

// ─── GlassCard Component ─────────────────────────────────────────────────────
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

export default function ListasUAPage() {
  const [unidades, setUnidades] = useState<UnidadAcademica[]>([])
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  // Estados del Formulario
  const [nombre, setNombre] = useState('')
  const [tipo, setTipo] = useState<'interno' | 'externo'>('interno')
  const [errorMessage, setErrorMessage] = useState('')

  // Cargar datos reales de manera segura evitando renderizados en cascada
  useEffect(() => {
    let isMounted = true

    async function startFetching() {
      try {
        const res = await getUnidadesAcademicas()
        if (isMounted) {
          setUnidades(res)
          setLoading(false)
        }
      } catch (err) {
        console.error('Error al inicializar datos:', err)
      }
    }

    startFetching()

    return () => {
      isMounted = false
    }
  }, [])

  // Manejar el submit del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre.trim()) return

    setErrorMessage('')
    
    startTransition(async () => {
      try {
        await createUnidadAcademica(nombre.trim(), tipo)
        setNombre('') // Limpiar input
        
        // Refrescar el estado local tras una inserción exitosa
        const res = await getUnidadesAcademicas()
        setUnidades(res)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : ''
        if (message.includes('duplicate key')) {
          setErrorMessage('Esta Unidad Académica ya se encuentra registrada.')
        } else {
          setErrorMessage('Error al guardar en la base de datos.')
        }
      }
    })
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-cyan-500/20 border-t-cyan-500 animate-spin" />
        <p className="text-gray-400 font-mono text-xs uppercase tracking-widest">Cargando Unidades Académicas...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto p-4 md:p-0">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase">
            <HiOutlineOfficeBuilding className="inline-block w-8 h-8 mr-3 text-cyan-400" />
            Listas por{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              UA
            </span>
          </h1>
          <p className="text-gray-500 text-sm font-mono mt-1">ADMIN // GESTIÓN_DE_UNIDADES_ACADÉMICAS</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">Producción Activa</span>
        </div>
      </header>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Columna Izquierda: Formulario de Registro */}
        <GlassCard className="p-6 h-fit" glowColor="purple">
          <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <HiOutlinePlusCircle className="text-purple-400 w-5 h-5" />
            Registrar Nueva UA
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-1">Nombre de la UA</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Instituto Tecnológico de Tijuana"
                disabled={isPending}
                className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-1">Clasificación (Tipo)</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as 'interno' | 'externo')}
                disabled={isPending}
                className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-purple-500 transition-all cursor-pointer"
              >
                <option value="interno">Interno (Campus Sede)</option>
                <option value="externo">Externo (Foráneo / Empresa)</option>
              </select>
            </div>

            {errorMessage && (
              <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2 rounded">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold text-xs uppercase tracking-widest py-2.5 px-4 rounded-lg transition-all duration-150 disabled:opacity-50"
            >
              {isPending ? 'Guardando...' : 'Añadir a Base de Datos'}
            </button>
          </form>
        </GlassCard>

        {/* Columna Derecha: Tabla de Registros en Tiempo Real */}
        <div className="lg:col-span-2">
          <GlassCard className="overflow-hidden" glowColor="cyan">
            <div className="p-4 bg-white/[0.01] border-b border-white/5 flex items-center justify-between">
              <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">UAs Registradas en Sistema</span>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded">
                Total: {unidades.length}
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-white/[0.02] border-b border-white/5">
                  <tr>
                    <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">ID</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Nombre Unidad Académica</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Tipo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {unidades.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-sm text-gray-500 font-mono">
                        No hay ninguna Unidad Académica registrada. Usa el panel izquierdo.
                      </td>
                    </tr>
                  ) : (
                    unidades.map((ua) => (
                      <tr key={ua.id} className="hover:bg-white/[0.01] transition-colors group">
                        <td className="px-6 py-4 text-xs font-mono text-gray-500">
                          #{ua.id}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-gray-200 block group-hover:text-cyan-400 transition-colors">
                            {ua.nombre}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {ua.tipo === 'interno' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <HiOutlineAcademicCap className="w-3 h-3" /> Interno
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              <HiOutlineGlobeAlt className="w-3 h-3" /> Externo
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>

      </div>
    </div>
  )
}