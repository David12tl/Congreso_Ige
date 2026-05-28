'use client'

import { useEffect, useState, useTransition } from 'react'
import {
  HiOutlineUsers,
  HiOutlineUserCircle,
  HiOutlineShieldCheck,
  HiOutlineUserGroup,
  HiOutlineTicket,
} from 'react-icons/hi'
import { getAdminDashboardData, updateUserRole, DashboardData } from './actions'

// ─── GlassCard Component ───────────────────────────────────────────────────
function GlassCard({ children, className = '', glowColor = 'cyan' }: { 
  children: React.ReactNode; 
  className?: string;
  glowColor?: 'blue' | 'purple' | 'amber' | 'cyan'
}) {
  const glowStyles = {
    blue: 'border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.15)]',
    purple: 'border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.15)]',
    amber: 'border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.15)]',
    cyan: 'border-cyan-500/30 shadow-[0_0_20px_rgba(34,211,238,0.15)]',
  }

  return (
    <div className={`relative rounded-2xl border bg-slate-900/40 backdrop-blur-xl overflow-hidden transition-all duration-300 ${glowStyles[glowColor]} ${className}`}>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      {children}
    </div>
  )
}

const ROLE_BADGES: Record<number, string> = {
  1: 'bg-rose-500/10 text-rose-400 border-rose-500/30',      // admin
  2: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',  // encargado
  3: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',      // user
}

const ROLE_LABELS: Record<number, string> = {
  1: 'Administrador',
  2: 'Encargado',
  3: 'Asistente',
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  // Función pura de fetching sin setState
  const fetchData = async () => {
    return await getAdminDashboardData()
  }

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      try {
        const res = await fetchData()
        if (isMounted) setData(res)
      } catch (err) {
        if (isMounted) console.error('Error cargando base de datos:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    load()

    return () => { isMounted = false }
  }, [])

  const handleRoleChange = async (userId: string, newRoleValue: string) => {
    const idRol = parseInt(newRoleValue, 10)
    
    // Optimistic UI Update en el cliente para respuesta instantánea
    if (data) {
      setData({
        ...data,
        usuarios: data.usuarios.map(u => u.id === userId ? { ...u, id_rol: idRol } : u)
      })
    }

    startTransition(async () => {
      try {
        await updateUserRole(userId, idRol)
        const freshData = await fetchData()
        setData(freshData)
      } catch {
        alert('No se pudo actualizar el rol en Supabase')
        const freshData = await fetchData()
        setData(freshData)
      }
    })
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-rose-500/20 border-t-rose-500 animate-spin" />
        <p className="text-gray-400 font-mono text-xs uppercase tracking-widest">Conectando al esquema de Supabase...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto p-4 md:p-0">
      {/* Header Estilo Centro de Comando */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase">
            Command Center <span className="text-rose-500">—</span> 
            <span className="bg-gradient-to-r from-rose-400 to-orange-500 bg-clip-text text-transparent ml-2">
              Panel Maestro
            </span>
          </h1>
          <p className="text-gray-500 text-sm font-mono mt-1">NIVEL_ACCESO: ID_ROL_1 // BASE_DATOS: PRODUCCIÓN</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">DB Conectada</span>
        </div>
      </header>

      {/* 1. Métricas Globales Dinámicas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Usuarios */}
        <GlassCard className="p-6" glowColor="blue">
          <div className="flex items-center gap-3 mb-4 text-blue-400">
            <HiOutlineUsers className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest text-blue-400/80">Total Usuarios</span>
          </div>
          <div className="relative">
            <span className="text-6xl font-black text-white drop-shadow-[0_0_15px_rgba(59,130,246,0.4)]">
              {data?.totalUsuarios}
            </span>
            <p className="text-[10px] text-blue-400 mt-2 font-mono">Sincronizado con auth.users</p>
          </div>
        </GlassCard>

        {/* Encargados Activos */}
        <GlassCard className="p-6" glowColor="purple">
          <div className="flex items-center gap-3 mb-4 text-purple-400">
            <HiOutlineShieldCheck className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest text-purple-400/80">Encargados (id_rol = 2)</span>
          </div>
          <div className="relative">
            <span className="text-6xl font-black text-white drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]">
              {data?.encargadosActivos}
            </span>
            <p className="text-[10px] text-purple-400 mt-2 font-mono">Permisos de cobro y token válidos</p>
          </div>
        </GlassCard>

        {/* Zona Más Vendida */}
        <GlassCard className="p-6" glowColor="amber">
          <div className="flex items-center gap-3 mb-4 text-amber-400">
            <HiOutlineTicket className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400/80">Zona Top Ventas</span>
          </div>
          <div className="relative">
            <span className="text-2xl font-black text-white drop-shadow-[0_0_15px_rgba(245,158,11,0.4)] uppercase tracking-tighter block mb-2 truncate">
              {data?.topZone}
            </span>
            <p className="text-[10px] text-amber-400 font-mono">{data?.topZoneTickets} boletos emitidos</p>
          </div>
        </GlassCard>
      </div>

      {/* 2. Tabla de Gestión de Usuarios Real */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <HiOutlineUserGroup className="text-rose-500" />
            Gestión de Personal y Permisos {isPending && <span className="text-xs text-rose-400 animate-pulse">(Guardando...)</span>}
          </h2>
        </div>

        <GlassCard className="overflow-hidden" glowColor="cyan">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-white/[0.02] border-b border-white/5">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Identificador / Nombre</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Email en DB</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Nivel Actual</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Asignar Rango Numérico</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data?.usuarios.map((user) => (
                  <tr key={user.id} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center text-gray-500 group-hover:border-rose-500/50 transition-colors">
                          <HiOutlineUserCircle className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-semibold text-gray-200">{user.nombre_ticket}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono text-gray-400">{user.email}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${ROLE_BADGES[user.id_rol] || 'border-gray-500 text-gray-400'}`}>
                        {ROLE_LABELS[user.id_rol] || 'Desconocido'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <select 
                        value={user.id_rol}
                        disabled={isPending}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="bg-slate-950 border border-white/10 rounded px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-rose-500 transition-all cursor-pointer hover:border-white/20 disabled:opacity-50"
                      >
                        <option value="3">Asistente (id_rol: 3)</option>
                        <option value="2">Encargado (id_rol: 2)</option>
                        <option value="1">Administrador (id_rol: 1)</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </section>
    </div>
  )
}