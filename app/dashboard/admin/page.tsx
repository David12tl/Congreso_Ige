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
import { GlassCard } from '@/components/ui/GlassCard'
import { getAdminDashboardData, AdminDashboardData } from './actions'

// ─── Mapas de estilos por rol y tipo ─────────────────────────────────────────
// Se usa Map en lugar de Record<K, V>[key] para evitar advertencias de
// "security/detect-object-injection" del linter de seguridad.

const ROLE_LABELS = new Map<number, string>([
  [1, 'Administrador'],
  [2, 'Encargado'],
  [3, 'Asistente'],
])

const ROLE_BADGES = new Map<number, string>([
  [1, 'bg-amber-50 text-amber-700 border-amber-200'],
  [2, 'bg-emerald-50 text-emerald-700 border-emerald-200'],
  [3, 'bg-blue-50 text-blue-700 border-blue-200'],
])

const TYPE_BADGES = new Map<string, string>([
  ['alumno',  'bg-emerald-50 text-emerald-700 border-emerald-200'],
  ['empresa', 'bg-amber-50 text-amber-700 border-amber-200'],
])

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
        <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin" />
        <p className="text-slate-500 font-light text-xs uppercase tracking-widest">Cargando panel de control...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto">
      {/* Header Estilo Centro de Comando */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-black tracking-tight text-[#0f172a] text-2xl md:text-3xl">
            Centro de Mando{' '}
            <span className="text-[#0B2545]">
              General
            </span>
          </h1>
          <p className="text-slate-500 text-xs font-light mt-1">ADMIN // PANEL_DE_CONTROL // MÉTRICAS_GLOBALES</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full self-start md:self-auto">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-emerald-700 text-xs font-bold uppercase tracking-widest">DB Conectada</span>
        </div>
      </header>

      {/* ─── Fila 1: KPIs Globales ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <GlassCard className="p-6" glowColor="blue">
          <div className="flex items-center gap-3 mb-4 text-blue-700">
            <HiOutlineUsers className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest text-blue-700/80">Usuarios Registrados</span>
          </div>
          <span className="text-4xl sm:text-5xl font-black text-[#0f172a]">
            {data?.totalUsuarios ?? '—'}
          </span>
          <p className="text-[10px] text-blue-700 mt-2 font-light">Total en profiles</p>
        </GlassCard>

        <GlassCard className="p-6" glowColor="purple">
          <div className="flex items-center gap-3 mb-4 text-purple-700">
            <HiOutlineShieldCheck className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest text-purple-700/80">Encargados Activos</span>
          </div>
          <span className="text-4xl sm:text-5xl font-black text-[#0f172a]">
            {data?.totalEncargados ?? '—'}
          </span>
          <p className="text-[10px] text-purple-700 mt-2 font-light">id_rol = 2</p>
        </GlassCard>

        <GlassCard className="p-6" glowColor="emerald">
          <div className="flex items-center gap-3 mb-4 text-emerald-700">
            <HiOutlineOfficeBuilding className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-700/80">Unidades Académicas</span>
          </div>
          <span className="text-4xl sm:text-5xl font-black text-[#0f172a]">
            {data?.totalUnidadesAcademicas ?? '—'}
          </span>
          <p className="text-[10px] text-emerald-700 mt-2 font-light">Registradas en el sistema</p>
        </GlassCard>
      </div>

      {/* ─── Fila 2: KPIs de Tickets ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard className="p-6" glowColor="cyan">
          <div className="flex items-center gap-3 mb-4 text-cyan-700">
            <HiOutlineTicket className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-700/80">Total Tickets</span>
          </div>
          <span className="text-3xl sm:text-4xl font-black text-[#0f172a]">{data?.totalTickets ?? '—'}</span>
        </GlassCard>

        <GlassCard className="p-6" glowColor="blue">
          <div className="flex items-center gap-3 mb-4 text-blue-700">
            <HiOutlineAcademicCap className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest text-blue-700/80">Alumnos</span>
          </div>
          <span className="text-3xl sm:text-4xl font-black text-[#0f172a]">{data?.totalAlumnos ?? '—'}</span>
        </GlassCard>

        <GlassCard className="p-6" glowColor="rose">
          <div className="flex items-center gap-3 mb-4 text-rose-700">
            <HiOutlineBriefcase className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest text-rose-700/80">Empresas</span>
          </div>
          <span className="text-3xl sm:text-4xl font-black text-[#0f172a]">{data?.totalEmpresas ?? '—'}</span>
        </GlassCard>

        <GlassCard className="p-6" glowColor="amber">
          <div className="flex items-center gap-3 mb-4 text-amber-700">
            <HiOutlineTicket className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest text-amber-700/80">Zona Top</span>
          </div>
          <div className="relative">
            <span className="text-lg sm:text-xl font-black text-[#0f172a] uppercase tracking-tight block truncate">
              {data?.topZone ?? 'Ninguna'}
            </span>
            <p className="text-[10px] text-amber-700 mt-1 font-light">{data?.topZoneTickets ?? 0} boletos</p>
          </div>
        </GlassCard>
      </div>

      {/* ─── Fila 3: Actividad Reciente ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Últimos Usuarios Registrados */}
        <GlassCard className="overflow-hidden" glowColor="blue">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-light text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <HiOutlineUsers className="w-4 h-4 text-blue-700" />
              Últimos usuarios registrados
            </span>
          </div>
          <div className="overflow-x-auto whitespace-nowrap">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Rol</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Registro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {data && data.usuariosRecientes.length > 0 ? (
                  data.usuariosRecientes.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                            <HiOutlineUserCircle className="w-4 h-4 text-slate-500" />
                          </div>
                          <span className="text-xs font-light text-slate-700 truncate max-w-[180px] block">{u.email ?? 'Sin email'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${ROLE_BADGES.get(u.id_rol) ?? 'border-slate-300 text-slate-500'}`}>
                          {ROLE_LABELS.get(u.id_rol) ?? 'Desconocido'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[11px] text-slate-500 font-light">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-xs text-slate-500 font-light">
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
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-light text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <HiOutlineTicket className="w-4 h-4 text-cyan-700" />
              Últimos tickets vendidos
            </span>
          </div>
          <div className="overflow-x-auto whitespace-nowrap">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Comprador</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tipo</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">UA / Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {data && data.ticketsRecientes.length > 0 ? (
                  data.ticketsRecientes.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="text-xs font-light text-slate-700">{t.nombre ?? 'Anónimo'}</span>
                          <span className="text-[10px] font-light text-slate-500">{t.email}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${TYPE_BADGES.get(t.type) ?? 'border-slate-300 text-slate-500'}`}>
                          {t.type === 'alumno' ? 'Alumno' : 'Empresa'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[11px]">
                        <span className="text-slate-700 block">{t.unidad_academica ?? 'Externa'}</span>
                        <span className="text-slate-500 font-light text-[10px]">
                          {t.purchased_at ? new Date(t.purchased_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }) : '—'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-xs text-slate-500 font-light">
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