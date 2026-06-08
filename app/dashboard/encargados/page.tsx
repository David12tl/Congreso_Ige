'use client'

import React, { useEffect, useState } from 'react'
import {
  HiOutlineUserGroup,
  HiOutlineShieldCheck,
  HiOutlineOfficeBuilding,
  HiOutlineUserCircle,
} from 'react-icons/hi'
import { getEncargadosData, EncargadosDashboardData } from './actions'

// ─── GlassCard Component ─────────────────────────────────────────────────────
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

export default function EncargadosPage() {
  const [data, setData] = useState<EncargadosDashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      try {
        const res = await getEncargadosData()
        if (isMounted) setData(res)
      } catch (err) {
        if (isMounted) console.error('Error cargando encargados:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    load()
    return () => { isMounted = false }
  }, [])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin" />
        <p className="text-gray-400 font-mono text-xs uppercase tracking-widest">Cargando encargados desde Supabase...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto p-4 md:p-0">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase">
            <HiOutlineShieldCheck className="inline-block w-8 h-8 mr-3 text-purple-400" />
            Gestión de{' '}
            <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              Encargados
            </span>
          </h1>
          <p className="text-gray-500 text-sm font-mono mt-1">ADMIN // CONTROL_DE_PERMISOS_Y_ROL_2</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full">
          <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
          <span className="text-purple-400 text-xs font-bold uppercase tracking-widest">{data?.totalEncargados ?? 0} encargados en DB</span>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-6" glowColor="purple">
          <div className="flex items-center gap-3 mb-4 text-purple-400">
            <HiOutlineUserGroup className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest text-purple-400/80">Total Encargados</span>
          </div>
          <span className="text-6xl font-black text-white drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]">
            {data?.totalEncargados ?? '—'}
          </span>
          <p className="text-[10px] text-purple-400 mt-2 font-mono">id_rol = 2 en profiles</p>
        </GlassCard>

        <GlassCard className="p-6" glowColor="emerald">
          <div className="flex items-center gap-3 mb-4 text-emerald-400">
            <HiOutlineShieldCheck className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400/80">UAs Asignadas</span>
          </div>
          <span className="text-6xl font-black text-white drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]">
            {data?.uasAsignadas ?? '—'}
          </span>
          <p className="text-[10px] text-emerald-400 mt-2 font-mono">Unidades Académicas</p>
        </GlassCard>

        <GlassCard className="p-6" glowColor="amber">
          <div className="flex items-center gap-3 mb-4 text-amber-400">
            <HiOutlineUserGroup className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400/80">Sin UA Asignada</span>
          </div>
          <span className="text-6xl font-black text-white drop-shadow-[0_0_15px_rgba(245,158,11,0.4)]">
            {data?.encargados.filter((e) => e.unidad_academica_id === null).length ?? '—'}
          </span>
          <p className="text-[10px] text-amber-400 mt-2 font-mono">Pendientes de asignación</p>
        </GlassCard>
      </div>

      {/* Tabla de Encargados con UA */}
      <GlassCard className="overflow-hidden" glowColor="purple">
        <div className="p-4 bg-white/[0.01] border-b border-white/5 flex items-center justify-between">
          <span className="text-xs font-mono text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <HiOutlineOfficeBuilding className="w-4 h-4 text-purple-400" />
            Listado de Encargados y sus Unidades Académicas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white/[0.02] border-b border-white/5">
              <tr>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">ID / Email</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Rol</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Unidad Académica</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Registro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data && data.encargados.length > 0 ? (
                data.encargados.map((enc) => (
                  <tr key={enc.id} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center text-gray-500 group-hover:border-purple-500/50 transition-colors">
                          <HiOutlineUserCircle className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-mono text-cyan-400 font-bold">{enc.id.slice(0, 12)}...</span>
                          <span className="text-gray-300 text-sm">{enc.email ?? 'Sin email'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-indigo-500/30 bg-indigo-500/10 text-indigo-400">
                        Encargado
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-200 font-medium">{enc.nombre_ua ?? 'No asignada'}</span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400 font-mono">
                      {enc.created_at ? new Date(enc.created_at).toLocaleDateString('es-MX') : '—'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-500 font-mono">
                    No hay encargados registrados con id_rol = 2.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  )
}