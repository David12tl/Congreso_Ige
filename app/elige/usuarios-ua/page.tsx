'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { GlassCard } from '@/components/ui/GlassCard'
import { getUsuariosPorUA, UsuarioUA } from './action'
import { UsuariosUAHeader } from './UsuariosUAHeader'
import { UsuariosUATable } from './UsuariosUATable'
import { UsuariosUAPagination } from './UsuariosUAPagination'

function limpiarValor(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return value ?? null
  const t = value.trim()
  return t.length > 0 ? t : null
}

const ITEMS_PER_PAGE = 10

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

  const [prevSearch, setPrevSearch] = useState(search)
  const [prevUA, setPrevUA] = useState(selectedUA)

  if (prevSearch !== search || prevUA !== selectedUA) {
    setPrevSearch(search)
    setPrevUA(selectedUA)
    setCurrentPage(1)
  }

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
      <UsuariosUAHeader
        totalFiltrados={usuariosFiltrados.length}
        search={search}
        setSearch={setSearch}
        selectedUA={selectedUA}
        setSelectedUA={setSelectedUA}
        listaUAs={listaUAs}
      />

      <GlassCard className="overflow-hidden" glowColor="purple">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <span className="text-xs font-light text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            Lista de Usuarios por unidad académica
          </span>
          <span className="text-[10px] font-light bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded">
            Base de datos activa
          </span>
        </div>

        <UsuariosUATable usuarios={currentItems} />

        <UsuariosUAPagination
          startRange={startRange}
          endRange={endRange}
          totalItems={usuariosFiltrados.length}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </GlassCard>
    </div>
  )
}