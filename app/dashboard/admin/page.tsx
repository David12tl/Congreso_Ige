'use client'

import { useEffect, useState } from 'react'
import {
  HiOutlineUsers,
  HiOutlineShieldCheck,
  HiOutlineOfficeBuilding,
  HiOutlineTicket,
  HiOutlineAcademicCap,
  HiOutlineBriefcase,
  HiOutlineUserCircle,
} from 'react-icons/hi'
import { getAdminDashboardData, AdminDashboardData } from './actions'

// ─── GlassCard Component ───────────────────────────────────────────────────
function GlassCard({ children, className = '', glowColor = 'cyan' }: {
  children: React.ReactNode
  className?: string
  glowColor?: 'blue' | 'purple' | 'amber' | 'cyan' | 'emerald' | 'rose'
}) {
  const glowStyles: Record<string, string> = {
    blue: 'border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.15)]',
    purple: 'border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.15)]',
    amber: 'border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.15)]',
    cyan: 'border-cyan-500/30 shadow-[0_0_20px_rgba(34,211,238,0.15)]',
    emerald: 'border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.15)]',
    rose: 'border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.15)]',
  }

  return (
    <div className={`relative rounded-2xl border bg-slate-900/40 backdrop-blur-xl overflow-hidden transition-all duration-300 ${glowStyles[glowColor]} ${className}`}>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      {children}
    </div>
  )
}

const ROLE_LABELS: Record<number, string> = {
  1: 'Administrador',
  2: 'Encargado',
  3: 'Asistente',
}

const ROLE_BADGES: Record<number, string> = {
  1: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  2: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
  3: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
}

const TYPE_BADGES: Record<string, string> = {
  alumno: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  empresa: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      try {
        const res = await getAdminDashboardData()
        if (isMounted) setData(res)
      } catch (err) {
        if (isMounted) console.error('Error cargando dashboard:', err)
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
        <div className="w-12 h-12 rounded-full border-4 border-rose-500/20 border-t-rose-500 animate-spin" />
        <p className="text-gray-400 font-mono text-xs uppercase tracking-widest">Cargando panel de control...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto p-4 md:p-0">
      {/* Header Estilo Centro de Comando */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase">
            Centro de Mando{' '}
            <span className="bg-gradient-to-r from-rose-400 to-orange-500 bg-clip-text text-transparent ml-2">
              General
            </span>
          </h1>
          <p className="text-gray-500 text-sm font-mono mt-1">ADMIN // PANEL_DE_CONTROL // MÉTRICAS_GLOBALES</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">DB Conectada</span>
        </div>
      </header>

      {/* ─── Fila 1: KPIs Globales ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <GlassCard className="p-6" glowColor="blue">
          <div className="flex items-center gap-3 mb-4 text-blue-400">
            <HiOutlineUsers className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest text-blue-400/80">Usuarios Registrados</span>
          </div>
          <span className="text-5xl font-black text-white drop-shadow-[0_0_15px_rgba(59,130,246,0.4)]">
            {data?.totalUsuarios ?? '—'}
          </span>
          <p className="text-[10px] text-blue-400 mt-2 font-mono">Total en profiles</p>
        </GlassCard>

        <GlassCard className="p-6" glowColor="purple">
          <div className="flex items-center gap-3 mb-4 text-purple-400">
            <HiOutlineShieldCheck className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest text-purple-400/80">Encargados Activos</span>
          </div>
          <span className="text-5xl font-black text-white drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]">
            {data?.totalEncargados ?? '—'}
          </span>
          <p className="text-[10px] text-purple-400 mt-2 font-mono">id_rol = 2</p>
        </GlassCard>

        <GlassCard className="p-6" glowColor="emerald">
          <div className="flex items-center gap-3 mb-4 text-emerald-400">
            <HiOutlineOfficeBuilding className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400/80">Unidades Académicas</span>
          </div>
          <span className="text-5xl font-black text-white drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]">
            {data?.totalUnidadesAcademicas ?? '—'}
          </span>
          <p className="text-[10px] text-emerald-400 mt-2 font-mono">Registradas en el sistema</p>
        </GlassCard>
      </div>

      {/* ─── Fila 2: KPIs de Tickets ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard className="p-6" glowColor="cyan">
          <div className="flex items-center gap-3 mb-4 text-cyan-400">
            <HiOutlineTicket className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400/80">Total Tickets</span>
          </div>
          <span className="text-4xl font-black text-white">{data?.totalTickets ?? '—'}</span>
        </GlassCard>

        <GlassCard className="p-6" glowColor="blue">
          <div className="flex items-center gap-3 mb-4 text-blue-400">
            <HiOutlineAcademicCap className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest text-blue-400/80">Alumnos</span>
          </div>
          <span className="text-4xl font-black text-white">{data?.totalAlumnos ?? '—'}</span>
        </GlassCard>

        <GlassCard className="p-6" glowColor="rose">
          <div className="flex items-center gap-3 mb-4 text-rose-400">
            <HiOutlineBriefcase className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest text-rose-400/80">Empresas</span>
          </div>
          <span className="text-4xl font-black text-white">{data?.totalEmpresas ?? '—'}</span>
        </GlassCard>

        <GlassCard className="p-6" glowColor="amber">
          <div className="flex items-center gap-3 mb-4 text-amber-400">
            <HiOutlineTicket className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400/80">Zona Top</span>
          </div>
          <div className="relative">
            <span className="text-xl font-black text-white drop-shadow-[0_0_15px_rgba(245,158,11,0.4)] uppercase tracking-tighter block truncate">
              {data?.topZone ?? 'Ninguna'}
            </span>
            <p className="text-[10px] text-amber-400 mt-1 font-mono">{data?.topZoneTickets ?? 0} boletos</p>
          </div>
        </GlassCard>
      </div>

      {/* ─── Fila 3: Actividad Reciente ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Últimos Usuarios Registrados */}
        <GlassCard className="overflow-hidden" glowColor="blue">
          <div className="p-4 bg-white/[0.01] border-b border-white/5 flex items-center justify-between">
            <span className="text-xs font-mono text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <HiOutlineUsers className="w-4 h-4 text-blue-400" />
              Últimos usuarios registrados
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-white/[0.02] border-b border-white/5">
                <tr>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Email</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Rol</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Registro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data && data.usuariosRecientes.length > 0 ? (
                  data.usuariosRecientes.map((u) => (
                    <tr key={u.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-slate-800 border border-white/10 flex items-center justify-center">
                            <HiOutlineUserCircle className="w-4 h-4 text-gray-500" />
                          </div>
                          <span className="text-xs font-mono text-gray-300 truncate max-w-[180px] block">{u.email ?? 'Sin email'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${ROLE_BADGES[u.id_rol] || 'border-gray-500 text-gray-400'}`}>
                          {ROLE_LABELS[u.id_rol] || 'Desconocido'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[11px] text-gray-400 font-mono">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-xs text-gray-500 font-mono">
                      Sin actividad reciente.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* Últimos Tickets Comprados */}
        <GlassCard className="overflow-hidden" glowColor="cyan">
          <div className="p-4 bg-white/[0.01] border-b border-white/5 flex items-center justify-between">
            <span className="text-xs font-mono text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <HiOutlineTicket className="w-4 h-4 text-cyan-400" />
              Últimos tickets vendidos
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-white/[0.02] border-b border-white/5">
                <tr>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Comprador</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Tipo</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">UA / Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data && data.ticketsRecientes.length > 0 ? (
                  data.ticketsRecientes.map((t) => (
                    <tr key={t.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-gray-200">{t.nombre ?? 'Anónimo'}</span>
                          <span className="text-[10px] font-mono text-gray-500">{t.email}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${TYPE_BADGES[t.type] || 'border-gray-500 text-gray-400'}`}>
                          {t.type === 'alumno' ? 'Alumno' : 'Empresa'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[11px]">
                        <span className="text-gray-300 block">{t.unidad_academica ?? 'Externa'}</span>
                        <span className="text-gray-500 font-mono text-[10px]">
                          {t.purchased_at ? new Date(t.purchased_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }) : '—'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-xs text-gray-500 font-mono">
                      Sin ventas recientes.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}