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
import { GlassCard } from '@/components/ui/GlassCard'
import { getUsuariosConUA, getUnidadesAcademicas, UsuarioConUA, UnidadAcademica } from './actions'

// ─── Badge de Rol ────────────────────────────────────────────────────────────
// Map en lugar de Record para evitar "security/detect-object-injection"
const ROLE_BADGE_MAP = new Map<number, { color: string; label: string }>([
  [1, { color: 'bg-amber-50 text-amber-700 border-amber-200',   label: 'Administrador' }],
  [2, { color: 'bg-purple-50 text-purple-700 border-purple-200', label: 'Encargado' }],
  [3, { color: 'bg-cyan-50 text-cyan-700 border-cyan-200',       label: 'Usuario' }],
])

function RoleBadge({ idRol }: { idRol: number }) {
  const badge = ROLE_BADGE_MAP.get(idRol) ?? { color: 'border-slate-300 text-slate-500', label: 'Desconocido' }
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${badge.color}`}>
      <HiOutlineShieldCheck className="w-3 h-3" />
      {badge.label}
    </span>
  )
}

// ─── Badge Tipo UA ──────────────────────────────────────────────────────────
function TipoUABadge({ tipo }: { tipo: string | null }) {
  if (tipo === 'interno') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
        <HiOutlineAcademicCap className="w-3 h-3" /> Interno
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
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
        <div className="w-12 h-12 rounded-full border-4 border-cyan-200 border-t-cyan-500 animate-spin" />
        <p className="text-slate-500 font-light text-xs uppercase tracking-widest">Cargando usuarios por Unidad Académica...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto p-4 md:p-0">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-black tracking-tight text-[#0f172a] text-2xl md:text-3xl">
            <HiOutlineUserGroup className="inline-block w-8 h-8 mr-3 text-cyan-700" />
            Usuarios por{' '}
            <span className="text-cyan-700">
              UA
            </span>
          </h1>
          <p className="text-slate-500 text-sm font-light mt-1">
            {esEncargado ? 'ENCARGADO // USUARIOS_DE_MI_UNIDAD_ACADÉMICA' : 'ADMIN // GESTIÓN_DE_USUARIOS_POR_UNIDAD'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-cyan-50 border border-cyan-200 rounded-full">
            <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
            <span className="text-cyan-700 text-xs font-bold uppercase tracking-widest">
              {totalUsuarios} Usuarios
            </span>
          </div>
          {esEncargado && (
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-200 rounded-full">
              <HiOutlineShieldCheck className="w-4 h-4 text-purple-700" />
              <span className="text-purple-700 text-xs font-bold uppercase tracking-widest">Encargado</span>
            </div>
          )}
        </div>
      </header>

      {/* Buscador + Filtro UA (solo Admin ve el dropdown de filtro) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={esEncargado ? 'md:col-span-3' : 'md:col-span-2'}>
          <div className="relative">
            <HiOutlineSearch className="absolute left-3 top-3.5 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar usuario por nombre, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-[#0f172a] placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-all"
            />
          </div>
        </div>

        {!esEncargado && (
          <div className="relative">
            <HiOutlineFilter className="absolute left-3 top-3.5 text-slate-400 w-5 h-5 pointer-events-none" />
            <select
              value={selectedUA}
              onChange={(e) => setSelectedUA(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-700 focus:outline-none focus:border-cyan-500 transition-all cursor-pointer appearance-none"
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
              className="w-full flex items-center justify-between p-5 bg-slate-50 border-b border-slate-200 hover:bg-slate-100 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                {grupo.nombre === 'SIN ASIGNAR' ? (
                  <HiOutlineOfficeBuilding className="w-6 h-6 text-amber-700/70" />
                ) : grupo.tipo === 'externo' ? (
                  <HiOutlineGlobeAlt className="w-6 h-6 text-blue-700" />
                ) : (
                  <HiOutlineAcademicCap className="w-6 h-6 text-cyan-700" />
                )}
                <div>
                  <h2 className="text-base font-bold text-slate-700 tracking-tight">
                    {grupo.nombre}
                  </h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    {grupo.tipo && <TipoUABadge tipo={grupo.tipo} />}
                    <span className="text-[10px] font-light text-slate-500">
                      {grupo.usuarios.length} usuario{grupo.usuarios.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-light bg-slate-100 text-slate-500 border border-slate-200 rounded">
                  ID: {grupo.id ?? 'N/A'}
                </span>
                {expandedUA.has(grupo.nombre) ? (
                  <HiOutlineChevronDown className="w-5 h-5 text-slate-500" />
                ) : (
                  <HiOutlineChevronRight className="w-5 h-5 text-slate-500" />
                )}
              </div>
            </button>

            {/* Cuerpo del Grupo (expandible) */}
            {expandedUA.has(grupo.nombre) && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Usuario</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Rol</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Registro</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {(() => {
                      const usuariosFiltrados = grupo.usuarios.filter((user) => {
                        if (!search.trim()) return true
                        const q = search.toLowerCase()
                        return (
                          (user.email?.toLowerCase() || '').includes(q) ||
                          (user.rol?.toLowerCase() || '').includes(q)
                        )
                      })

                      if (usuariosFiltrados.length === 0) {
                        return (
                          <tr>
                            <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500 font-light">
                              {search.trim()
                                ? 'No se encontraron usuarios con ese criterio de búsqueda.'
                                : 'No hay usuarios en esta Unidad Académica.'}
                            </td>
                          </tr>
                        )
                      }

                      return usuariosFiltrados.map((user) => (
                          <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 group-hover:border-cyan-200 transition-colors">
                                  <HiOutlineUserCircle className="w-5 h-5" />
                                </div>
                                <span className="text-sm font-light text-slate-700 group-hover:text-cyan-700 transition-colors">
                                  {user.email?.split('@')[0] || 'Usuario'}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm font-light text-slate-500 flex items-center gap-1.5">
                                <HiOutlineMail className="w-3.5 h-3.5 text-slate-400" />
                                {user.email || 'Sin email'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <RoleBadge idRol={user.id_rol} />
                            </td>
                            <td className="px-6 py-4 text-xs font-light text-slate-500">
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
                    })()}
                  </tbody>
                </table>
              </div>
            )}
          </GlassCard>
        ))}

        {gruposFiltrados.length === 0 && (
          <GlassCard className="p-12 text-center" glowColor="amber">
            <HiOutlineOfficeBuilding className="w-12 h-12 mx-auto text-slate-400 mb-4" />
            <p className="text-slate-500 font-light text-sm">
              No hay Unidades Académicas registradas o usuarios en el sistema.
            </p>
          </GlassCard>
        )}
      </div>
    </div>
  )
}