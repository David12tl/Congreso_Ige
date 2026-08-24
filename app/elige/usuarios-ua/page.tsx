'use client'

import React, { useEffect, useState } from 'react'
import { HiOutlineUsers, HiOutlineSearch, HiOutlineFilter } from 'react-icons/hi'
import { GlassCard } from '@/components/ui/GlassCard'
import { getUsuariosPorUA, UsuarioUA } from './action'

// Deriva la modalidad de estudio a partir del campo directo o heurísticas de respaldo (carrera 'MIXTO' o matrícula '266W')
function derivarModalidad(usuario: UsuarioUA): 'mixto' | 'escolarizado' {
  const carrera = (usuario.carrera || '').toUpperCase()
  const matricula = (usuario.matricula || '').toUpperCase()

  if (usuario.modalidad === 'mixto') return 'mixto'
  if (carrera.includes('MIXTO') || matricula.startsWith('266W')) return 'mixto'
  return 'escolarizado'
}

export default function UsuariosUAPage() {
  const [usuarios, setUsuarios] = useState<UsuarioUA[]>([])
  const [loading, setLoading] = useState(true)
  
  const [search, setSearch] = useState('')
  const [selectedUA, setSelectedUA] = useState('TODAS')
  const [listaUAs, setListaUAs] = useState<string[]>([])

  useEffect(() => {
    let isMounted = true

    async function loadData() {
      const data = await getUsuariosPorUA()
      if (isMounted) {
        setUsuarios(data)
        
        // Extraer nombres de unidades académicas únicas para el filtro
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

  // Filtrado por texto y por Unidad Académica (por nombre)
  const usuariosFiltrados = usuarios.filter((usuario) => {
    const matchesSearch = 
      (usuario.nombre?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (usuario.email?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (usuario.matricula?.toLowerCase() || '').includes(search.toLowerCase())

    const matchesUA = selectedUA === 'TODAS' || usuario.unidad_academica === selectedUA

    return matchesSearch && matchesUA
  })

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
          <span className="text-xs font-light text-slate-500 dark:text-slate-400 uppercase tracking-widest">Lista de Usuarios por unidad academica</span>
          <span className="text-[10px] font-light bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded">
            Base de datos activa
          </span>
        </div>

        <div className="w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white">
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
              {usuariosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">
                    Ningún usuario con rol 3 coincide con los criterios de búsqueda actuales.
                  </td>
                </tr>
              ) : (
                usuariosFiltrados.map((usuario) => {
                  const modalidad = derivarModalidad(usuario)
                  return (
                    <tr key={usuario.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-[#1E2A39] text-base leading-tight">{usuario.nombre || 'Sin Nombre Registrado'}</div>
                        <div className="text-xs text-[#7D7D7D] font-medium mt-0.5">{usuario.email}</div>
                      </td>
                      <td className="px-6 py-4 font-mono font-semibold text-[#1E2A39]">
                        {usuario.matricula || '——'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-[#1E2A39]">{usuario.carrera || 'No Especificada'}</div>
                        <div className="text-xs text-[#7D7D7D] mt-0.5">{usuario.semestre ? `${usuario.semestre}° Semestre` : '——'}</div>
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
      </GlassCard>
    </div>
  )
}