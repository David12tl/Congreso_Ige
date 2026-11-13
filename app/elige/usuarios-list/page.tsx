'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { HiOutlineUserGroup, HiOutlineSearch, HiOutlineAcademicCap, HiOutlineFilter, HiOutlineGlobeAlt, HiOutlineCheckCircle, HiOutlineExclamationCircle } from 'react-icons/hi'
import { GlassCard } from '@/components/ui/GlassCard'
import { getTodosLosAsistentes, AsistenteGlobal } from './actions'
import { coincideBusquedaPorPalabras } from '@/lib/search'
import { UsuariosUAPagination } from '../usuarios-ua/UsuariosUAPagination'

const ITEMS_PER_PAGE = 10

// ─── Mapa de estilos para badges de estatus ──────────────────────────────────
// Map en lugar de Record para evitar "security/detect-object-injection"
const STATUS_BADGE_MAP = new Map<string, { bg: string; text: string; border: string; label: string }>([
  ['completado',    { bg: 'bg-slate-100 dark:bg-slate-800',   text: 'text-slate-700 dark:text-slate-200',   border: 'border-slate-200 dark:border-slate-700',   label: 'Completado' }],
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
  const [loadError, setLoadError] = useState<string | null>(null)
  
  // Filtros de navegación e interactivos
  const [search, setSearch] = useState('')
  const [selectedUA, setSelectedUA] = useState('TODAS')
  const [activeTab, setActiveTab] = useState<'TODOS' | 'INTERNOS' | 'EXTERNOS'>('TODOS')
  const [listaUAs, setListaUAs] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    let isMounted = true

    async function loadData() {
      try {
        const data = await getTodosLosAsistentes()
        if (isMounted) {
          setAsistentes(data)
          const uasUnicas = Array.from(
            new Set(data.map((asistente) => asistente.unidad_academica)
              .filter((ua): ua is string => typeof ua === 'string' && ua !== ''))
          ).sort()
          setListaUAs(uasUnicas)
        }
      } catch (error) {
        if (isMounted) {
          setLoadError(error instanceof Error ? error.message : 'No se pudieron cargar los asistentes.')
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [])

  // Triple cruce de filtros en tiempo real (Buscador + Selector UA + Pestaña de Tipo)
  const asistentesFiltrados = useMemo(
    () => asistentes.filter((asistente) => {
      const matchesSearch = coincideBusquedaPorPalabras(search, [
        ...asistente.nombres_busqueda,
        ...asistente.correos_busqueda,
        ...asistente.matriculas_busqueda,
        asistente.nombre,
        asistente.email,
        asistente.matricula,
        asistente.carrera,
        asistente.semestre,
        asistente.unidad_academica,
      ])
      const matchesUA = selectedUA === 'TODAS' ||
        asistente.unidad_academica === selectedUA ||
        asistente.unidad_academica == null
      const matchesTab = activeTab === 'TODOS' ||
        (activeTab === 'INTERNOS' && asistente.type === 'alumno') ||
        (activeTab === 'EXTERNOS' && asistente.type === 'empresa')

      return matchesSearch && matchesUA && matchesTab
    }),
    [asistentes, search, selectedUA, activeTab]
  )

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  const handleUAChange = (value: string) => {
    setSelectedUA(value)
    setCurrentPage(1)
  }

  const handleTabChange = (tab: 'TODOS' | 'INTERNOS' | 'EXTERNOS') => {
    setActiveTab(tab)
    setCurrentPage(1)
  }

  const totalPages = Math.ceil(asistentesFiltrados.length / ITEMS_PER_PAGE) || 1
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return asistentesFiltrados.slice(start, start + ITEMS_PER_PAGE)
  }, [asistentesFiltrados, currentPage])
  const startRange = asistentesFiltrados.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1
  const endRange = Math.min(currentPage * ITEMS_PER_PAGE, asistentesFiltrados.length)

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin" />
        <p className="text-slate-500 dark:text-slate-400 font-light text-xs uppercase tracking-widest">Sincronizando padrón completo...</p>
      </div>
    )
  }

  if (loadError) {
    return (
      <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        Error al cargar asistentes: {loadError}
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto p-4 md:p-0">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-black tracking-tight text-[#0f172a] dark:text-white text-2xl md:text-3xl">
            <HiOutlineUserGroup className="inline-block w-8 h-8 mr-3 text-blue-700" />
            Control de{' '}
            <span className="text-blue-700">
              Asistentes
            </span>
          </h1>
          
        </div>
        
        {/* Pestañas de Filtrado Rápido */}
        <div className="flex bg-slate-50 dark:bg-slate-800/60 p-1 rounded-xl border border-slate-200 dark:border-slate-700 space-x-1">
          <button
            onClick={() => handleTabChange('TODOS')}
            className={`px-4 py-1.5 text-xs font-light uppercase rounded-lg transition-all ${activeTab === 'TODOS' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
          >
            Todos
          </button>
          <button
            onClick={() => handleTabChange('INTERNOS')}
            className={`px-4 py-1.5 text-xs font-light uppercase rounded-lg transition-all ${activeTab === 'INTERNOS' ? 'bg-cyan-50 text-cyan-700 border border-cyan-200' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
          >
            Alumnos
          </button>
          <button
            onClick={() => handleTabChange('EXTERNOS')}
            className={`px-4 py-1.5 text-xs font-light uppercase rounded-lg transition-all ${activeTab === 'EXTERNOS' ? 'bg-pink-50 text-pink-700 border border-pink-200' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
          >
            Externos
          </button>
        </div>
      </header>

      {/* Buscador + Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 relative">
          <HiOutlineSearch className="absolute left-3 top-3.5 text-slate-400 dark:text-slate-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nombre, correo, matrícula..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl pl-11 pr-4 py-3 text-sm text-[#0f172a] dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all"
          />
        </div>

        <div className="relative">
          <HiOutlineFilter className="absolute left-3 top-3.5 text-slate-400 dark:text-slate-500 w-5 h-5 pointer-events-none" />
          <select
            value={selectedUA}
            onChange={(e) => handleUAChange(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-all cursor-pointer appearance-none"
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
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <span className="text-xs font-light text-slate-500 dark:text-slate-400 uppercase tracking-widest">Listado unificado de ventas</span>
          <span className="text-[10px] font-light bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded">
            Registros encontrados: {asistentesFiltrados.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Nombre Completo</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Contacto</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Identificador / UA</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Detalles de Estudio</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center">Estatus</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center">Clasificación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400 font-light">
                    No se encontraron asistentes con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                currentItems.map((asistente) => (
                  <tr key={asistente.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="text-sm font-light text-slate-700 dark:text-slate-200 group-hover:text-blue-700 transition-colors block">
                        {asistente.nombre || 'Sin Nombre'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-light text-xs">
                      <div className="flex flex-col">
                        <span className="text-slate-700 dark:text-slate-200">{asistente.email}</span>
                        <span className="text-slate-500 dark:text-slate-400 text-[11px]">{asistente.telefono || 'Sin Teléfono'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <div className="flex flex-col">
                        <span className="font-light text-cyan-700 font-bold">{asistente.matricula || 'EXT-N/A'}</span>
                        <span className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">{asistente.unidad_academica || 'Externa'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                      {asistente.type === 'alumno' ? (
                        <div className="flex flex-col">
                          <span className="text-slate-700 dark:text-slate-200 font-light">{asistente.carrera}</span>
                          <span className="text-slate-500 dark:text-slate-400 text-[10px] font-light">{asistente.semestre}° Semestre</span>
                        </div>
                      ) : (
                        <span className="text-slate-500 dark:text-slate-400 font-light italic">Acceso Corporativo / Empresa</span>
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
        <UsuariosUAPagination
          startRange={startRange}
          endRange={endRange}
          totalItems={asistentesFiltrados.length}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </GlassCard>
    </div>
  )
}