'use client'

import React, { useEffect, useState } from 'react'
import { HiOutlineUserGroup, HiOutlineSearch, HiOutlineAcademicCap, HiOutlineFilter, HiOutlineGlobeAlt, HiOutlineCheckCircle, HiOutlineExclamationCircle } from 'react-icons/hi'
import { GlassCard } from '@/components/ui/GlassCard'
import { getTodosLosAsistentes, AsistenteGlobal } from './actions'

// ─── Mapa de estilos para badges de estatus ──────────────────────────────────
// Map en lugar de Record para evitar "security/detect-object-injection"
const STATUS_BADGE_MAP = new Map<string, { bg: string; text: string; border: string; label: string }>([
  ['completado',    { bg: 'bg-slate-100',   text: 'text-slate-700',   border: 'border-slate-200',   label: 'Completado' }],
  ['pre-registro',  { bg: 'bg-amber-50',    text: 'text-amber-700',   border: 'border-amber-200',   label: 'Pre-registro' }],
  ['pendiente',     { bg: 'bg-amber-50',    text: 'text-amber-700',   border: 'border-amber-200',   label: 'Pendiente de pago' }],
  ['pagado',        { bg: 'bg-emerald-50',  text: 'text-emerald-700', border: 'border-emerald-200', label: 'Pagado' }],
])

const STATUS_BADGE_FALLBACK = STATUS_BADGE_MAP.get('completado')!

function getStatusBadge(estatus: string | null) {
  const info = STATUS_BADGE_MAP.get(estatus ?? '') ?? STATUS_BADGE_FALLBACK
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${info.bg} ${info.text} ${info.border}`}>
      {estatus === 'pagado' && <HiOutlineCheckCircle className="w-3 h-3" />}
      {(estatus === 'pre-registro' || estatus === 'pendiente') && <HiOutlineExclamationCircle className="w-3 h-3" />}
      {info.label}
    </span>
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
        <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin" />
        <p className="text-slate-500 font-light text-xs uppercase tracking-widest">Sincronizando padrón completo...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto p-4 md:p-0">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-black tracking-tight text-[#0f172a] text-2xl md:text-3xl">
            <HiOutlineUserGroup className="inline-block w-8 h-8 mr-3 text-blue-700" />
            Control de{' '}
            <span className="text-blue-700">
              Asistentes
            </span>
          </h1>
          <p className="text-slate-500 text-sm font-light mt-1">ADMIN // PADRÓN_GLOBAL_DE_REGISTROS</p>
        </div>
        
        {/* Pestañas de Filtrado Rápido */}
        <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200 space-x-1">
          <button
            onClick={() => setActiveTab('TODOS')}
            className={`px-4 py-1.5 text-xs font-light uppercase rounded-lg transition-all ${activeTab === 'TODOS' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Todos
          </button>
          <button
            onClick={() => setActiveTab('INTERNOS')}
            className={`px-4 py-1.5 text-xs font-light uppercase rounded-lg transition-all ${activeTab === 'INTERNOS' ? 'bg-cyan-50 text-cyan-700 border border-cyan-200' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Alumnos
          </button>
          <button
            onClick={() => setActiveTab('EXTERNOS')}
            className={`px-4 py-1.5 text-xs font-light uppercase rounded-lg transition-all ${activeTab === 'EXTERNOS' ? 'bg-pink-50 text-pink-700 border border-pink-200' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Externos
          </button>
        </div>
      </header>

      {/* Buscador + Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 relative">
          <HiOutlineSearch className="absolute left-3 top-3.5 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nombre, correo, matrícula..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-[#0f172a] placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all"
          />
        </div>

        <div className="relative">
          <HiOutlineFilter className="absolute left-3 top-3.5 text-slate-400 w-5 h-5 pointer-events-none" />
          <select
            value={selectedUA}
            onChange={(e) => setSelectedUA(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-700 focus:outline-none focus:border-blue-500 transition-all cursor-pointer appearance-none"
          >
            <option value="TODAS">Filtrar por Unidad Académica</option>
            {listaUAs.map((ua) => (
              <option key={ua} value={ua}>{ua}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla Global - Usando tarjetas blancas con bordes redondeados */}
      <GlassCard className="overflow-hidden" glowColor="blue">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-light text-slate-500 uppercase tracking-widest">Listado unificado de ventas</span>
          <span className="text-[10px] font-light bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded">
            Registros encontrados: {asistentesFiltrados.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nombre Completo</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Contacto</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Identificador / UA</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Detalles de Estudio</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Estatus</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Clasificación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {asistentesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500 font-light">
                    No se encontraron asistentes con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                asistentesFiltrados.map((asistente) => (
                  <tr key={asistente.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="text-sm font-light text-slate-700 group-hover:text-blue-700 transition-colors block">
                        {asistente.nombre || 'Sin Nombre'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-light text-xs">
                      <div className="flex flex-col">
                        <span className="text-slate-700">{asistente.email}</span>
                        <span className="text-slate-500 text-[11px]">{asistente.telefono || 'Sin Teléfono'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <div className="flex flex-col">
                        <span className="font-light text-cyan-700 font-bold">{asistente.matricula || 'EXT-N/A'}</span>
                        <span className="text-slate-500 text-[11px] mt-0.5">{asistente.unidad_academica || 'Externa'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {asistente.type === 'alumno' ? (
                        <div className="flex flex-col">
                          <span className="text-slate-700 font-light">{asistente.carrera}</span>
                          <span className="text-slate-500 text-[10px] font-light">{asistente.semestre}° Semestre</span>
                        </div>
                      ) : (
                        <span className="text-slate-500 font-light italic">Acceso Corporativo / Empresa</span>
                      )}
                    </td>
                    {/* Columna de Estatus de pago */}
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(asistente.estatus_pago)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {asistente.type === 'alumno' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-cyan-50 text-cyan-700 border border-cyan-200">
                          <HiOutlineAcademicCap className="w-3 h-3" /> Interno
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-pink-50 text-pink-700 border border-pink-200">
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