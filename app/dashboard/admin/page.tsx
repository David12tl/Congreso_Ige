'use client'

import { useState } from 'react'
import {
  HiOutlineUsers,
  HiOutlineUserCircle,
  HiOutlineHome,
  HiOutlineShieldCheck,
  HiOutlineUserGroup,
} from 'react-icons/hi'

// ─── Components ─────────────────────────────────────────────────────────────

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

const ROLE_BADGES: Record<string, string> = {
  admin: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  encargado: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
  user: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  encargado: 'Encargado',
  user: 'Usuario',
}

export default function AdminDashboardPage() {
  // Mock de usuarios para la gestión de roles
  const [users, setUsers] = useState([
    { id: '1', name: 'David Hernández', email: 'david@ige.com', role: 'admin' },
    { id: '2', name: 'Ana Martínez', email: 'ana@ige.com', role: 'encargado' },
    { id: '3', name: 'Carlos Ruíz', email: 'carlos@ige.com', role: 'user' },
    { id: '4', name: 'Elena Soler', email: 'elena@ige.com', role: 'user' },
    { id: '5', name: 'Marcos Peña', email: 'marcos@ige.com', role: 'encargado' },
  ])

  const handleRoleChange = (userId: string, newRole: string) => {
    // Aquí se integraría la llamada a Supabase para actualizar el user_metadata
    setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
  }

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto">
      {/* Header Estilo Centro de Comando */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase">
            Command Center <span className="text-rose-500">—</span> 
            <span className="bg-gradient-to-r from-rose-400 to-orange-500 bg-clip-text text-transparent ml-2">
              Panel Maestro
            </span>
          </h1>
          <p className="text-gray-500 text-sm font-mono mt-1">NIVEL_ACCESO: ROOT // PROTOCOLO: ACTIVADO</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 border border-rose-500/30 rounded-full">
          <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <span className="text-rose-400 text-xs font-bold uppercase tracking-widest">En Línea</span>
        </div>
      </header>

      {/* 1. Métricas Globales (Grid de 3 columnas) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Usuarios Registrados */}
        <GlassCard className="p-6" glowColor="blue">
          <div className="flex items-center gap-3 mb-4 text-blue-400">
            <HiOutlineUsers className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest text-blue-400/80">Total Usuarios</span>
          </div>
          <div className="relative">
            <span className="text-6xl font-black text-white drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
              1.240
            </span>
            <p className="text-[10px] text-blue-400 mt-2 font-mono">+15.4% vs mes anterior</p>
          </div>
        </GlassCard>

        {/* Encargados Activos */}
        <GlassCard className="p-6" glowColor="purple">
          <div className="flex items-center gap-3 mb-4 text-purple-400">
            <HiOutlineShieldCheck className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest text-purple-400/80">Encargados Activos</span>
          </div>
          <div className="relative">
            <span className="text-6xl font-black text-white drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
              18
            </span>
            <p className="text-[10px] text-purple-400 mt-2 font-mono">Sincronización: Activa</p>
          </div>
        </GlassCard>

        {/* Stand Más Visitado */}
        <GlassCard className="p-6" glowColor="amber">
          <div className="flex items-center gap-3 mb-4 text-amber-400">
            <HiOutlineHome className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400/80">Stand Top</span>
          </div>
          <div className="relative">
            <span className="text-3xl font-black text-white drop-shadow-[0_0_15px_rgba(245,158,11,0.5)] uppercase tracking-tighter block mb-2">
              Developer Land
            </span>
            <p className="text-[10px] text-amber-400 font-mono">482 visitas hoy</p>
          </div>
        </GlassCard>
      </div>

      {/* 2. Tabla de Gestión de Usuarios */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <HiOutlineUserGroup className="text-rose-500" />
                Gestión de Usuarios
            </h2>
        </div>

        <GlassCard className="overflow-hidden" glowColor="cyan">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-white/[0.02] border-b border-white/5">
                <tr>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Usuario</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Email</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Rol</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Acciones</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                {users.map((user) => (
                    <tr key={user.id} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center text-gray-500 group-hover:border-rose-500/50 transition-colors">
                            <HiOutlineUserCircle className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-semibold text-gray-200">{user.name}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <span className="text-sm font-mono text-gray-400">{user.email}</span>
                    </td>
                    <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${ROLE_BADGES[user.role]}`}>
                        {ROLE_LABELS[user.role]}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-right text-slate-100">
                        <select 
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            className="bg-slate-950 border border-white/10 rounded px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-rose-500 transition-all cursor-pointer hover:border-white/20"
                        >
                            <option value="user">Asistente</option>
                            <option value="encargado">Encargado</option>
                            <option value="admin">Administrador</option>
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