'use client'

import React, { useEffect, useState, useMemo } from 'react'
import {
  HiOutlineOfficeBuilding,
  HiOutlineUserGroup,
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineShieldCheck,
  HiOutlineAcademicCap,
  HiOutlineGlobeAlt,
  HiOutlineChevronDown,
  HiOutlineChevronRight,
  HiOutlineUserCircle,
  HiOutlineMail,
} from 'react-icons/hi'
import { getUsuariosConUA, getUnidadesAcademicas, UsuarioConUA, UnidadAcademica } from './actions'

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

// ─── Badge de Rol ────────────────────────────────────────────────────────────
const ROLE_BADGES: Record<number, { color: string; label: string }> = {
  1: { color: 'bg-rose-500/10 text-rose-400 border-rose-500/30', label: 'Administrador' },
  2: { color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30', label: 'Encargado' },
  3: { color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30', label: 'Usuario' },
}

function RoleBadge({ idRol }: { idRol: number }) {
  const badge = ROLE_BADGES[idRol] || { color: 'border-gray-500 text-gray-400', label: 'Desconocido' }
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${badge.color}`}>
      <HiOutlineShieldCheck className="w-3 h-3" />
      {badge.label}
    </span>
  )
}

// ─── Badge Tipo UA ──────────────────────────────────────────────────────────
function TipoUABadge({ tipo }: { tipo: string | null }) {
  if (tipo === 'interno') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <HiOutlineAcademicCap className="w-3 h-3" /> Interno
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
      <HiOutlineGlobeAlt className="w-3 h-3" /> Externo
    </span>
  )
}

// ─── Interfaz de grupos de UA ───────────────────────────────────────────────
interface GrupoUA {
  id: number | null
  nombre: string
  tipo: string | null
  usuarios: UsuarioConUA[]
}

export default function ListasUAPage() {
  const [usuarios, setUsuarios] = useState<UsuarioConUA[]>([])
  const [unidadesAcademicas, setUnidadesAcademicas] = useState<UnidadAcademica[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedUA, setSelectedUA] = useState<string>('TODAS')
  const [expandedUA, setExpandedUA] = useState<Set<string>>(new Set())

  // Obtener perfil de sesión para determinar si es admin o encargado
  const [perfil, setPerfil] = useState<{ id_rol: number; unidad_academica_id: number | null } | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadData() {
      try {
        const [usuariosData, uasData] = await Promise.all([
          getUsuariosConUA(),
          getUnidadesAcademicas(),
        ])

        if (isMounted) {
          setUsuarios(usuariosData)
          setUnidadesAcademicas(uasData)

          // Obtener perfil de sesión (sin exponerlo públicamente)
          const { getPerfilSesion } = await import('./actions')
          const perfilData = await getPerfilSesion()
          setPerfil(perfilData)

          // Si es encargado, fijar el filtro a su UA y expandirla automáticamente
          if (perfilData && perfilData.id_rol === 2 && perfilData.unidad_academica_id !== null) {
            const ua = uasData.find((u) => u.id === perfilData.unidad_academica_id)
            if (ua) {
              setSelectedUA(ua.nombre)
              setExpandedUA(new Set([ua.nombre]))
            }
          }

          setLoading(false)
        }
      } catch (err) {
        console.error('Error al cargar datos:', err)
      }
    }

    loadData()

    return () => { isMounted = false }
  }, [])

  // ─── Agrupar usuarios por UA ──────────────────────────────────────────────
  const gruposUA: GrupoUA[] = useMemo(() => {
    const mapa = new Map<string, GrupoUA>()

    // Inicializar grupos con todas las UAs registradas
    for (const ua of unidadesAcademicas) {
      mapa.set(ua.nombre, { id: ua.id, nombre: ua.nombre, tipo: ua.tipo, usuarios: [] })
    }

    // Grupo para usuarios sin UA
    mapa.set('SIN ASIGNAR', { id: null, nombre: 'Sin Unidad Académica', tipo: null, usuarios: [] })

    // Poblar grupos
    for (const user of usuarios) {
      const key = user.unidad_academica_nombre || 'SIN ASIGNAR'
      if (mapa.has(key)) {
        mapa.get(key)!.usuarios.push(user)
      } else {
        mapa.set(key, {
          id: user.unidad_academica_id,
          nombre: key,
          tipo: user.unidad_academica_tipo,
          usuarios: [user],
        })
      }
    }

    // Convertir a array y filtrar grupos vacíos excepto "SIN ASIGNAR"
    return Array.from(mapa.values())
      .filter((g) => g.nombre === 'SIN ASIGNAR' || g.usuarios.length > 0)
      .sort((a, b) => a.nombre.localeCompare(b.nombre))
  }, [usuarios, unidadesAcademicas])

  // ─── Filtrar grupos por UA seleccionada ────────────────────────────────────
  const gruposFiltrados = useMemo(() => {
    return selectedUA === 'TODAS'
      ? gruposUA
      : gruposUA.filter((g) => g.nombre === selectedUA)
  }, [gruposUA, selectedUA])

  // ─── Contar total de usuarios ──────────────────────────────────────────────
  const totalUsuarios = usuarios.length

  // ─── Toggle expandir/colapsar grupo ────────────────────────────────────────
  const toggleExpand = (nombre: string) => {
    setExpandedUA((prev) => {
      const next = new Set(prev)
      if (next.has(nombre)) {
        next.delete(nombre)
      } else {
        next.add(nombre)
      }
      return next
    })
  }

  // ─── Determinar si el usuario es Encargado (vista restringida) ────────────
  const esEncargado = perfil?.id_rol === 2

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-cyan-500/20 border-t-cyan-500 animate-spin" />
        <p className="text-gray-400 font-mono text-xs uppercase tracking-widest">Cargando usuarios por Unidad Académica...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto p-4 md:p-0">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase">
            <HiOutlineUserGroup className="inline-block w-8 h-8 mr-3 text-cyan-400" />
            Usuarios por{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              UA
            </span>
          </h1>
          <p className="text-gray-500 text-sm font-mono mt-1">
            {esEncargado ? 'ENCARGADO // USUARIOS_DE_MI_UNIDAD_ACADÉMICA' : 'ADMIN // GESTIÓN_DE_USUARIOS_POR_UNIDAD'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full">
            <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
            <span className="text-cyan-400 text-xs font-bold uppercase tracking-widest">
              {totalUsuarios} Usuarios
            </span>
          </div>
          {esEncargado && (
            <div className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full">
              <HiOutlineShieldCheck className="w-4 h-4 text-indigo-400" />
              <span className="text-indigo-400 text-xs font-bold uppercase tracking-widest">Encargado</span>
            </div>
          )}
        </div>
      </header>

      {/* Buscador + Filtro UA (solo Admin ve el dropdown de filtro) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={esEncargado ? 'md:col-span-3' : 'md:col-span-2'}>
          <div className="relative">
            <HiOutlineSearch className="absolute left-3 top-3.5 text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder={esEncargado ? 'Buscar usuario por nombre, email...' : 'Buscar usuario por nombre, email...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-all backdrop-blur-sm"
            />
          </div>
        </div>

        {!esEncargado && (
          <div className="relative">
            <HiOutlineFilter className="absolute left-3 top-3.5 text-gray-500 w-5 h-5 pointer-events-none" />
            <select
              value={selectedUA}
              onChange={(e) => setSelectedUA(e.target.value)}
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-gray-300 focus:outline-none focus:border-cyan-500 transition-all backdrop-blur-sm cursor-pointer appearance-none"
            >
              <option value="TODAS">Todas las Unidades Académicas</option>
              {gruposUA.filter((g) => g.nombre !== 'SIN ASIGNAR').map((g) => (
                <option key={g.nombre} value={g.nombre}>
                  {g.nombre} ({g.usuarios.length})
                </option>
              ))}
              {gruposUA.filter((g) => g.nombre === 'SIN ASIGNAR' && g.usuarios.length > 0).map((g) => (
                <option key={g.nombre} value={g.nombre}>
                  {g.nombre} ({g.usuarios.length})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Grupos por UA */}
      <div className="space-y-6">
        {gruposFiltrados.map((grupo) => (
          <GlassCard key={grupo.nombre} className="overflow-hidden" glowColor={
            grupo.nombre === 'SIN ASIGNAR' ? 'amber' : 'cyan'
          }>
            {/* Header del Grupo */}
            <button
              onClick={() => toggleExpand(grupo.nombre)}
              className="w-full flex items-center justify-between p-5 bg-white/[0.01] border-b border-white/5 hover:bg-white/[0.02] transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                {grupo.nombre === 'SIN ASIGNAR' ? (
                  <HiOutlineOfficeBuilding className="w-6 h-6 text-amber-400/70" />
                ) : grupo.tipo === 'externo' ? (
                  <HiOutlineGlobeAlt className="w-6 h-6 text-blue-400" />
                ) : (
                  <HiOutlineAcademicCap className="w-6 h-6 text-cyan-400" />
                )}
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight">
                    {grupo.nombre}
                  </h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    {grupo.tipo && <TipoUABadge tipo={grupo.tipo} />}
                    <span className="text-[10px] font-mono text-gray-500">
                      {grupo.usuarios.length} usuario{grupo.usuarios.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-mono bg-white/5 text-gray-400 border border-white/10 rounded">
                  ID: {grupo.id ?? 'N/A'}
                </span>
                {expandedUA.has(grupo.nombre) ? (
                  <HiOutlineChevronDown className="w-5 h-5 text-gray-500" />
                ) : (
                  <HiOutlineChevronRight className="w-5 h-5 text-gray-500" />
                )}
              </div>
            </button>

            {/* Cuerpo del Grupo (expandible) */}
            {expandedUA.has(grupo.nombre) && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-white/[0.02] border-b border-white/5">
                    <tr>
                      <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Usuario</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Email</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Rol</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Registro</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {grupo.usuarios.filter((user) => {
                      if (!search.trim()) return true
                      const q = search.toLowerCase()
                      return (
                        (user.email?.toLowerCase() || '').includes(q) ||
                        (user.rol?.toLowerCase() || '').includes(q)
                      )
                    }).length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500 font-mono">
                          {search.trim()
                            ? 'No se encontraron usuarios con ese criterio de búsqueda.'
                            : 'No hay usuarios en esta Unidad Académica.'}
                        </td>
                      </tr>
                    ) : (
                      grupo.usuarios
                        .filter((user) => {
                          if (!search.trim()) return true
                          const q = search.toLowerCase()
                          return (
                            (user.email?.toLowerCase() || '').includes(q) ||
                            (user.rol?.toLowerCase() || '').includes(q)
                          )
                        })
                        .map((user) => (
                          <tr key={user.id} className="hover:bg-white/[0.01] transition-colors group">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center text-gray-500 group-hover:border-cyan-500/50 transition-colors">
                                  <HiOutlineUserCircle className="w-5 h-5" />
                                </div>
                                <span className="text-sm font-semibold text-gray-200 group-hover:text-cyan-400 transition-colors">
                                  {user.email?.split('@')[0] || 'Usuario'}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm font-mono text-gray-400 flex items-center gap-1.5">
                                <HiOutlineMail className="w-3.5 h-3.5 text-gray-600" />
                                {user.email || 'Sin email'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <RoleBadge idRol={user.id_rol} />
                            </td>
                            <td className="px-6 py-4 text-xs font-mono text-gray-500">
                              {user.created_at
                                ? new Date(user.created_at).toLocaleDateString('es-MX', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                  })
                                : '—'}
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </GlassCard>
        ))}

        {gruposFiltrados.length === 0 && (
          <GlassCard className="p-12 text-center" glowColor="amber">
            <HiOutlineOfficeBuilding className="w-12 h-12 mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400 font-mono text-sm">
              No hay Unidades Académicas registradas o usuarios en el sistema.
            </p>
          </GlassCard>
        )}
      </div>
    </div>
  )
}