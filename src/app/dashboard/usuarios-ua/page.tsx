'use client'

import React, { useEffect, useState } from 'react'
import { HiOutlineUsers, HiOutlineSearch, HiOutlineAcademicCap, HiOutlineFilter, HiOutlineBriefcase } from 'react-icons/hi'
import { getAsistentesPorUA, AsistenteTicket } from './action'

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

export default function UsuariosUAPage() {
  const [asistentes, setAsistentes] = useState<AsistenteTicket[]>([])
  const [loading, setLoading] = useState(true)
  
  // Estados para Filtros Interactivos
  const [search, setSearch] = useState('')
  const [selectedUA, setSelectedUA] = useState('TODAS')
  const [listaUAs, setListaUAs] = useState<string[]>([])

  useEffect(() => {
    let isMounted = true

    async function loadData() {
      const data = await getAsistentesPorUA()
      if (isMounted) {
        setAsistentes(data)
        
        // CORRECCIÓN: Tipamos explícitamente el callback del map y filtramos con un type guard estricto
        const uasUnicas: string[] = Array.from(
          new Set(data.map((a: AsistenteTicket) => a.unidad_academica).filter((ua): ua is string => typeof ua === 'string' && ua !== ''))
        ).sort()
        
        setListaUAs(uasUnicas)
        setLoading(false)
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [])

  // Lógica de filtrado en tiempo real
  const asistentesFiltrados = asistentes.filter((asistente) => {
    const matchesSearch = 
      (asistente.nombre?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (asistente.email?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (asistente.matricula?.toLowerCase() || '').includes(search.toLowerCase())

    const matchesUA = selectedUA === 'TODAS' || asistente.unidad_academica === selectedUA

    return matchesSearch && matchesUA
  })

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin" />
        <p className="text-gray-400 font-mono text-xs uppercase tracking-widest">Cargando asistentes por UA...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto p-4 md:p-0">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase">
            <HiOutlineUsers className="inline-block w-8 h-8 mr-3 text-purple-400" />
            Usuarios por{' '}
            <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              UA
            </span>
          </h1>
          <p className="text-gray-500 text-sm font-mono mt-1">ENCARGADO // GESTIÓN_DE_ASISTENTES_POR_UA</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full">
          <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
          <span className="text-purple-400 text-xs font-bold uppercase tracking-widest">
            {asistentesFiltrados.length} Filtrados
          </span>
        </div>
      </header>

      {/* Barra de Filtros y Búsqueda */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Input Buscador */}
        <div className="md:col-span-2 relative">
          <HiOutlineSearch className="absolute left-3 top-3.5 text-gray-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nombre, correo o matrícula..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all backdrop-blur-sm"
          />
        </div>

        {/* Selector de UA */}
        <div className="relative">
          <HiOutlineFilter className="absolute left-3 top-3.5 text-gray-500 w-5 h-5 pointer-events-none" />
          <select
            value={selectedUA}
            onChange={(e) => setSelectedUA(e.target.value)}
            className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-gray-300 focus:outline-none focus:border-purple-500 transition-all backdrop-blur-sm cursor-pointer appearance-none"
          >
            <option value="TODAS">Todas las Unidades</option>
            {listaUAs.map((ua) => (
              <option key={ua} value={ua}>{ua}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla de Resultados */}
      <GlassCard className="overflow-hidden" glowColor="purple">
        <div className="p-4 bg-white/[0.01] border-b border-white/5 flex items-center justify-between">
          <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">Padrón de Asistentes del Congreso</span>
          <span className="text-[10px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded">
            Base de datos activa
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white/[0.02] border-b border-white/5">
              <tr>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Asistente / Correo</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Matrícula</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Carrera / Semestre</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Unidad Académica</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Tipo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {asistentesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500 font-mono">
                    Ningún asistente coincide con los criterios de búsqueda actuales.
                  </td>
                </tr>
              ) : (
                asistentesFiltrados.map((asistente) => (
                  <tr key={asistente.id} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-200 group-hover:text-purple-400 transition-colors">
                          {asistente.nombre || 'Sin Nombre Registrado'}
                        </span>
                        <span className="text-xs text-gray-500 font-mono">{asistente.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-gray-300">
                      {asistente.matricula || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-300 font-medium">{asistente.carrera || '—'}</span>
                        {asistente.semestre && (
                          <span className="text-[10px] font-mono text-gray-500">{asistente.semestre}° Semestre</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400 font-medium">
                      {asistente.unidad_academica || 'No Especificada'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {asistente.type === 'alumno' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          <HiOutlineAcademicCap className="w-3 h-3" /> Alumno
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-pink-500/10 text-pink-400 border border-pink-500/20">
                          <HiOutlineBriefcase className="w-3 h-3" /> Empresa
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
  )
}