'use client'

import React, { useEffect, useState } from 'react'
import { HiOutlineUserGroup, HiOutlineSearch, HiOutlineAcademicCap, HiOutlineFilter, HiOutlineBriefcase, HiOutlineGlobeAlt } from 'react-icons/hi'
import { getTodosLosAsistentes, AsistenteGlobal } from './actions'

function GlassCard({ children, className = '', glowColor = 'blue' }: {
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

export default function UsuariosListPage() {
  const [asistentes, setAsistentes] = useState<AsistenteGlobal[]>([])
  const [loading, setLoading] = useState(true)
  
  // Filtros de navegación e interactivos
  const [search, setSearch] = useState('')
  const [selectedUA, setSelectedUA] = useState('TODAS')
  const [activeTab, setActiveTab] = useState<'TODOS' | 'INTERNOS' | 'EXTERNOS'>('TODOS')
  const [listaUAs, setListaUAs] = useState<string[]>([])

  useEffect(() => {
    let isMounted = true

    async function loadData() {
      const data = await getTodosLosAsistentes()
      if (isMounted) {
        setAsistentes(data)
        
        // Extraemos las UAs únicas mapeando estrictamente
        const uasUnicas: string[] = Array.from(
          new Set(data.map((a: AsistenteGlobal) => a.unidad_academica).filter((ua): ua is string => typeof ua === 'string' && ua !== ''))
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

  // Triple cruce de filtros en tiempo real (Buscador + Selector UA + Pestaña de Tipo)
  const asistentesFiltrados = asistentes.filter((asistente) => {
    const matchesSearch = 
      (asistente.nombre?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (asistente.email?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (asistente.matricula?.toLowerCase() || '').includes(search.toLowerCase())

    const matchesUA = selectedUA === 'TODAS' || asistente.unidad_academica === selectedUA

    let matchesTab = true
    if (activeTab === 'INTERNOS') matchesTab = asistente.type === 'alumno'
    if (activeTab === 'EXTERNOS') matchesTab = asistente.type === 'empresa'

    return matchesSearch && matchesUA && matchesTab
  })

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
        <p className="text-gray-400 font-mono text-xs uppercase tracking-widest">Sincronizando padrón completo...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto p-4 md:p-0">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase">
            <HiOutlineUserGroup className="inline-block w-8 h-8 mr-3 text-blue-400" />
            Control de{' '}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
              Asistentes
            </span>
          </h1>
          <p className="text-gray-500 text-sm font-mono mt-1">ADMIN // PADRÓN_GLOBAL_DE_REGISTROS</p>
        </div>
        
        {/* Pestañas de Filtrado Rápido Cyberpunk */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-white/5 space-x-1">
          <button
            onClick={() => setActiveTab('TODOS')}
            className={`px-4 py-1.5 text-xs font-mono font-bold uppercase rounded-lg transition-all ${activeTab === 'TODOS' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Todos
          </button>
          <button
            onClick={() => setActiveTab('INTERNOS')}
            className={`px-4 py-1.5 text-xs font-mono font-bold uppercase rounded-lg transition-all ${activeTab === 'INTERNOS' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Alumnos
          </button>
          <button
            onClick={() => setActiveTab('EXTERNOS')}
            className={`px-4 py-1.5 text-xs font-mono font-bold uppercase rounded-lg transition-all ${activeTab === 'EXTERNOS' ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Externos
          </button>
        </div>
      </header>

      {/* Buscador + Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 relative">
          <HiOutlineSearch className="absolute left-3 top-3.5 text-gray-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nombre, correo, matrícula..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all backdrop-blur-sm"
          />
        </div>

        <div className="relative">
          <HiOutlineFilter className="absolute left-3 top-3.5 text-gray-500 w-5 h-5 pointer-events-none" />
          <select
            value={selectedUA}
            onChange={(e) => setSelectedUA(e.target.value)}
            className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-gray-300 focus:outline-none focus:border-blue-500 transition-all backdrop-blur-sm cursor-pointer appearance-none"
          >
            <option value="TODAS">Filtrar por Unidad Académica</option>
            {listaUAs.map((ua) => (
              <option key={ua} value={ua}>{ua}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla Global */}
      <GlassCard className="overflow-hidden" glowColor="blue">
        <div className="p-4 bg-white/[0.01] border-b border-white/5 flex items-center justify-between">
          <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">Listado unificado de ventas</span>
          <span className="text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded">
            Registros encontrados: {asistentesFiltrados.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white/[0.02] border-b border-white/5">
              <tr>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Nombre Completo</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Contacto</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Identificador / UA</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Detalles de Estudio</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Clasificación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {asistentesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500 font-mono">
                    No se encontraron asistentes con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                asistentesFiltrados.map((asistente) => (
                  <tr key={asistente.id} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-gray-200 group-hover:text-blue-400 transition-colors block">
                        {asistente.nombre || 'Sin Nombre'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">
                      <div className="flex flex-col">
                        <span className="text-gray-300">{asistente.email}</span>
                        <span className="text-gray-500 text-[11px]">{asistente.telefono || 'Sin Teléfono'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <div className="flex flex-col">
                        <span className="font-mono text-cyan-400 font-bold">{asistente.matricula || 'EXT-N/A'}</span>
                        <span className="text-gray-400 text-[11px] mt-0.5">{asistente.unidad_academica || 'Externa'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400">
                      {asistente.type === 'alumno' ? (
                        <div className="flex flex-col">
                          <span className="text-gray-300 font-medium">{asistente.carrera}</span>
                          <span className="text-gray-500 text-[10px] font-mono">{asistente.semestre}° Semestre</span>
                        </div>
                      ) : (
                        <span className="text-gray-500 italic">Acceso Corporativo / Empresa</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {asistente.type === 'alumno' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          <HiOutlineAcademicCap className="w-3 h-3" /> Interno
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-pink-500/10 text-pink-400 border border-pink-500/20">
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
  )
}