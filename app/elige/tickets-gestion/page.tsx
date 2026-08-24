'use client'

import React, { useEffect, useState } from 'react'
import { HiOutlineTicket, HiOutlineSearch, HiOutlineFilter, HiOutlineAcademicCap, HiOutlineBriefcase } from 'react-icons/hi'
import { GlassCard } from '@/components/ui/GlassCard'
import { getAsistentesPorUA, AsistenteTicket } from './actions'

export default function TicketsGestionPage() {
  const [asistentes, setAsistentes] = useState<AsistenteTicket[]>([])
  const [loading, setLoading] = useState(true)
  
  // Estados para Filtros Interactivos
  const [search, setSearch] = useState('')
  const [selectedUA, setSelectedUA] = useState('') // Inicializado vacío para auto-detectar
  const [listaUAs, setListaUAs] = useState<string[]>([])
  const [modalidadFilter, setModalidadFilter] = useState<'todos' | 'escolarizado' | 'mixto'>('todos')

  useEffect(() => {
    let isMounted = true

    async function loadData() {
      const data = await getAsistentesPorUA()
      if (isMounted) {
        setAsistentes(data)
        
        const uasUnicas: string[] = Array.from(
          new Set(data.map((a: AsistenteTicket) => a.unidad_academica).filter((ua): ua is string => typeof ua === 'string' && ua.length > 0))
        )
        uasUnicas.sort()
        
        setListaUAs(uasUnicas)
        
        // CORRECCIÓN INTERFAZ: Si hay una UA asignada, la pre-seleccionamos automáticamente en lugar de "TODAS"
        if (uasUnicas.length > 0) {
          setSelectedUA(uasUnicas[0])
        } else {
          setSelectedUA('NINGUNA')
        }
        
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

    const matchesModalidad =
      modalidadFilter === 'todos' ||
      (asistente.type === 'alumno' && asistente.modalidad === modalidadFilter)

    return matchesSearch && matchesUA && matchesModalidad
  })

  // Métricas de modalidad (sobre los datos cargados de la Unidad Académica)
  const alumnosRaw = asistentes.filter((a) => a.type === 'alumno')
  const countEscolarizado = alumnosRaw.filter((a) => a.modalidad === 'escolarizado').length
  const countMixto = alumnosRaw.filter((a) => a.modalidad === 'mixto').length

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-purple-200 border-t-purple-500 animate-spin" />
        <p className="text-slate-500 dark:text-slate-400 font-light text-xs uppercase tracking-widest">Cargando asistentes por UA...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto p-4 md:p-0">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-black tracking-tight text-[#0f172a] dark:text-white text-2xl md:text-3xl">
            <HiOutlineTicket className="inline-block w-8 h-8 mr-3 text-purple-700" />
            Gestión de{' '}
            <span className="text-purple-700">
              Tickets ({selectedUA})
            </span>
          </h1>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-200 rounded-full">
          <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
          <span className="text-purple-700 text-xs font-bold uppercase tracking-widest">
            {asistentesFiltrados.length} Encontrados
          </span>
        </div>
      </header>

      {/* Métricas de Modalidad */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <div className="bg-[#1E2A39]/10 p-6 rounded-3xl border border-[#1E2A39]/20 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase text-[#7D7D7D] tracking-widest">Escolarizado</p>
            <p className="text-3xl font-black text-[#1E2A39]">{countEscolarizado}</p>
          </div>
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-sm font-black text-[#1E2A39] border border-[#1E2A39]/20">
            E
          </div>
        </div>
        <div className="bg-[#8B1E23]/10 p-6 rounded-3xl border border-[#8B1E23]/20 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase text-[#7D7D7D] tracking-widest">Mixto</p>
            <p className="text-3xl font-black text-[#8B1E23]">{countMixto}</p>
          </div>
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-sm font-black text-[#8B1E23] border border-[#8B1E23]/20">
            M
          </div>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Input Buscador */}
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

        {/* Selector de UA (Bloqueado para mostrar solo la asignada) */}
        <div className="relative">
          <HiOutlineFilter className="absolute left-3 top-3.5 text-slate-400 dark:text-slate-500 w-5 h-5 pointer-events-none" />
          <select
            value={selectedUA}
            onChange={(e) => setSelectedUA(e.target.value)}
            disabled={true} // Se deshabilita para evitar que altere la visualización restringida
            className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-500 dark:text-slate-400 focus:outline-none transition-all cursor-not-allowed appearance-none"
          >
            {listaUAs.map((ua) => (
              <option key={ua} value={ua}>Sede: {ua}</option>
            ))}
            {listaUAs.length === 0 && <option value="NINGUNA">Sin Unidad Asignada</option>}
          </select>
        </div>

        {/* Selector de Modalidad */}
        <div className="relative">
          <HiOutlineFilter className="absolute left-3 top-3.5 text-slate-400 dark:text-slate-500 w-5 h-5 pointer-events-none" />
          <select
            value={modalidadFilter}
            onChange={(e) => setModalidadFilter(e.target.value as 'todos' | 'escolarizado' | 'mixto')}
            className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl pl-11 pr-4 py-3 text-sm text-[#0f172a] dark:text-white focus:outline-none transition-all"
          >
            <option value="todos">Todas las modalidades</option>
            <option value="escolarizado">Escolarizado</option>
            <option value="mixto">Mixto</option>
          </select>
        </div>
      </div>

      {/* Tabla de Resultados */}
      <GlassCard className="overflow-hidden" glowColor="purple">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <span className="text-xs font-light text-slate-500 dark:text-slate-400 uppercase tracking-widest">Padrón de Asistentes del Congreso</span>
          <span className="text-[10px] font-light bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded">
            Base de datos activa
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Asistente / Correo</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Matrícula</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Carrera / Semestre</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Unidad Académica</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center">Tipo</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Modalidad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {asistentesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400 font-light">
                    Ningún asistente coincide con la búsqueda en esta unidad.
                  </td>
                </tr>
              ) : (
                asistentesFiltrados.map((asistente) => (
                  <tr key={asistente.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-light text-slate-700 dark:text-slate-200 group-hover:text-purple-700 transition-colors">
                          {asistente.nombre || 'Sin Nombre Registrado'}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-light">{asistente.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-light text-slate-500 dark:text-slate-400">
                      {asistente.matricula || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-700 dark:text-slate-200 font-light">{asistente.carrera || '—'}</span>
                        {asistente.semestre && (
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-light">{asistente.semestre}° Semestre</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400 font-light">
                      {asistente.unidad_academica}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {asistente.type === 'alumno' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-cyan-50 text-cyan-700 border border-cyan-200">
                          <HiOutlineAcademicCap className="w-3 h-3" /> Alumno
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-pink-50 text-pink-700 border border-pink-200">
                          <HiOutlineBriefcase className="w-3 h-3" /> Empresa
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-row items-center gap-2 pr-4">
                        {asistente.type === 'alumno' ? (
                          <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase ${
                            asistente.modalidad === 'escolarizado' ? 'bg-[#1E2A39]/10 text-[#1E2A39]' : 'bg-[#8B1E23]/10 text-[#8B1E23]'
                          }`}>
                            {asistente.modalidad === 'escolarizado' ? 'Escolarizado' : 'Mixto'}
                          </span>
                        ) : (
                          <span className="text-[#7D7D7D] text-xs font-bold uppercase tracking-wider">N/A</span>
                        )}
                      </div>
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