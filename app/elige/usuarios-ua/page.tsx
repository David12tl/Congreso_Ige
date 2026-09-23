'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { HiOutlineUsers, HiOutlineSearch, HiOutlineFilter, HiChevronLeft, HiChevronRight } from 'react-icons/hi'
import { GlassCard } from '@/components/ui/GlassCard'
import { getUsuariosPorUA, UsuarioUA } from './action'

// Íconos SVG auxiliares para "Ir al Inicio" (|<) y "Ir al Final" (>|)
function FirstPageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
    </svg>
  )
}

function LastPageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
    </svg>
  )
}

// Deriva la modalidad de estudio a partir del campo directo o heurísticas de respaldo
function derivarModalidad(usuario: UsuarioUA): 'mixto' | 'escolarizado' {
  const carrera = (usuario.carrera || '').toUpperCase()
  const matricula = (usuario.matricula || '').toUpperCase()

  if (usuario.modalidad === 'mixto') return 'mixto'
  if (carrera.includes('MIXTO') || matricula.startsWith('266W')) return 'mixto'
  return 'escolarizado'
}

// Normaliza un valor de texto
function limpiarValor(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return value ?? null
  const t = value.trim()
  return t.length > 0 ? t : null
}

const ITEMS_PER_PAGE = 10; // Fijado a 10 registros por página

export default function UsuariosUAPage() {
  const [usuarios, setUsuarios] = useState<UsuarioUA[]>([])
  const [loading, setLoading] = useState(true)
  
  const [search, setSearch] = useState('')
  const [selectedUA, setSelectedUA] = useState('TODAS')
  const [listaUAs, setListaUAs] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    let isMounted = true

    async function loadData() {
      const data = await getUsuariosPorUA()
      if (isMounted) {
        setUsuarios(data.map((u) => ({
          ...u,
          nombre: limpiarValor(u.nombre),
          email: limpiarValor(u.email) || '',
          carrera: limpiarValor(u.carrera),
          semestre: limpiarValor(u.semestre),
          matricula: limpiarValor(u.matricula),
          unidad_academica: limpiarValor(u.unidad_academica),
        })))
        
        const uasUnicas: string[] = Array.from(
          new Set(
            data
              .map((u) => u.unidad_academica)
              .filter((ua): ua is string => typeof ua === 'string' && ua.length > 0)
          )
        )
        uasUnicas.sort()
        
        setListaUAs(uasUnicas)
        setLoading(false)
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [])

  // Filtrado por texto y por Unidad Académica
  const usuariosFiltrados = useMemo(() => {
    const termino = search.trim().toLowerCase()
    return usuarios.filter((usuario) => {
      const matchesSearch = 
        (usuario.nombre || '').toLowerCase().includes(termino) ||
        (usuario.email || '').toLowerCase().includes(termino) ||
        (usuario.matricula || '').toLowerCase().includes(termino) ||
        (usuario.carrera || '').toLowerCase().includes(termino) ||
        (usuario.unidad_academica || '').toLowerCase().includes(termino)

      const matchesUA = selectedUA === 'TODAS' || usuario.unidad_academica === selectedUA

      return matchesSearch && matchesUA
    })
  }, [usuarios, search, selectedUA])

  // Restablecer a la página 1 cuando cambien los filtros
  const [prevSearch, setPrevSearch] = useState(search)
  const [prevUA, setPrevUA] = useState(selectedUA)

  if (prevSearch !== search || prevUA !== selectedUA) {
    setPrevSearch(search)
    setPrevUA(selectedUA)
    setCurrentPage(1)
  }

  // Cálculos de paginación
  const totalPages = Math.ceil(usuariosFiltrados.length / ITEMS_PER_PAGE) || 1

  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return usuariosFiltrados.slice(start, start + ITEMS_PER_PAGE)
  }, [usuariosFiltrados, currentPage])

  const startRange = usuariosFiltrados.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1
  const endRange = Math.min(currentPage * ITEMS_PER_PAGE, usuariosFiltrados.length)

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-purple-200 border-t-purple-500 animate-spin" />
        <p className="text-slate-500 dark:text-slate-400 font-light text-xs uppercase tracking-widest">Cargando usuarios por UA...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto p-4 md:p-0">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-black tracking-tight text-[#0f172a] dark:text-white text-2xl md:text-3xl">
            <HiOutlineUsers className="inline-block w-8 h-8 mr-3 text-purple-700" />
            Usuarios por{' '}
            <span className="text-purple-700">
              UA
            </span>
          </h1>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-200 rounded-full">
          <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
          <span className="text-purple-700 text-xs font-bold uppercase tracking-widest">
            {usuariosFiltrados.length} Filtrados
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 relative">
          <HiOutlineSearch className="absolute left-3 top-3.5 text-slate-400 dark:text-slate-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nombre, correo o matrícula..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl pl-11 pr-4 py-3 text-sm text-[#0f172a] dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-all"
          />
        </div>

        <div className="relative">
          <HiOutlineFilter className="absolute left-3 top-3.5 text-slate-400 dark:text-slate-500 w-5 h-5 pointer-events-none" />
          <select
            value={selectedUA}
            onChange={(e) => setSelectedUA(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-purple-500 transition-all cursor-pointer appearance-none"
          >
            <option value="TODAS">Todas las Unidades</option>
            {listaUAs.map((ua) => (
              <option key={ua} value={ua}>{ua}</option>
            ))}
          </select>
        </div>
      </div>

      <GlassCard className="overflow-hidden" glowColor="purple">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <span className="text-xs font-light text-slate-500 dark:text-slate-400 uppercase tracking-widest">Lista de Usuarios por unidad académica</span>
          <span className="text-[10px] font-light bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded">
            Base de datos activa
          </span>
        </div>

        <div className="w-full overflow-x-auto rounded-b-2xl border-t border-slate-200 bg-white">
          <table className="w-full border-collapse text-left text-sm text-slate-500">
            <thead className="bg-[#1E2A39]/5 text-[11px] font-black uppercase tracking-widest text-[#1E2A39]">
              <tr>
                <th scope="col" className="px-6 py-4">Usuario / Correo</th>
                <th scope="col" className="px-6 py-4">Matrícula</th>
                <th scope="col" className="px-6 py-4">Carrera / Semestre</th>
                <th scope="col" className="px-6 py-4">Unidad Académica</th>
                <th scope="col" className="px-6 py-4 text-right">Rol / Modalidad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white text-sm text-slate-900">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">
                    Ningún usuario coincide con los criterios de búsqueda actuales.
                  </td>
                </tr>
              ) : (
                currentItems.map((usuario) => {
                  const modalidad = derivarModalidad(usuario)
                  return (
                    <tr key={usuario.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className={`font-bold text-base leading-tight ${usuario.nombre ? 'text-[#1E2A39]' : 'text-slate-400 italic'}`}>
                          {usuario.nombre || 'Sin Nombre Registrado'}
                        </div>
                        <div className="text-xs text-[#7D7D7D] font-medium mt-0.5">{usuario.email}</div>
                      </td>
                      <td className="px-6 py-4 font-mono font-semibold text-[#1E2A39]">
                        {usuario.matricula || <span className="italic text-slate-400 font-light">Pendiente</span>}
                      </td>
                      <td className="px-6 py-4">
                        <div className={`font-bold ${usuario.carrera ? 'text-[#1E2A39]' : 'text-slate-400 italic'}`}>
                          {usuario.carrera || 'No Especificada'}
                        </div>
                        <div className="text-xs text-[#7D7D7D] mt-0.5">
                          {usuario.semestre ? `${usuario.semestre}° Semestre` : <span className="italic text-slate-300">No registrado</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-[#1E2A39]">
                          {usuario.unidad_academica || 'No Especificada'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-y-1.5">
                        <div className="text-xs font-bold text-[#7D7D7D] uppercase tracking-wider">
                          {usuario.id_rol || 'Usuario'}
                        </div>

                        {/* BADGE DE MODALIDAD DINÁMICO */}
                        <span className={`inline-flex items-center px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-md tracking-wider ${
                          modalidad === 'mixto'
                            ? 'bg-[#8B1E23]/10 text-[#8B1E23]'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-600/10'
                        }`}>
                          {modalidad === 'mixto' ? 'Mixto' : 'Escolarizado'}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ─── Navegación Estilo DataGrid (10 por página) ─── */}
        {usuariosFiltrados.length > 0 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-end gap-5 text-xs text-slate-700">
            <div className="font-medium text-slate-600">
              {startRange}-{endRange} de {usuariosFiltrados.length}
            </div>

            <div className="flex items-center gap-1">
              {/* Primera Página |< */}
              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-1.5 rounded text-slate-600 hover:bg-slate-200/60 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer disabled:cursor-not-allowed"
                title="Primera página"
              >
                <FirstPageIcon className="w-4 h-4" />
              </button>

              {/* Página Anterior < */}
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded text-slate-600 hover:bg-slate-200/60 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer disabled:cursor-not-allowed"
                title="Página anterior"
              >
                <HiChevronLeft className="w-4 h-4" />
              </button>

              {/* Página Siguiente > */}
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded text-slate-600 hover:bg-slate-200/60 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer disabled:cursor-not-allowed"
                title="Página siguiente"
              >
                <HiChevronRight className="w-4 h-4" />
              </button>

              {/* Última Página >| */}
              <button
                type="button"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded text-slate-600 hover:bg-slate-200/60 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer disabled:cursor-not-allowed"
                title="Última página"
              >
                <LastPageIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  )
}