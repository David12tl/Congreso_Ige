'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { GlassCard } from '@/components/ui/GlassCard'
import { getUsuariosPorUA, UsuarioUA } from './action'
import { UsuariosUAHeader } from './UsuariosUAHeader'
import { UsuariosUATable } from './UsuariosUATable'
import { UsuariosUAPagination } from './UsuariosUAPagination'
import { coincideBusquedaPorPalabras } from '@/lib/search'

function limpiarValor(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return value ?? null
  const t = value.trim()
  return t.length > 0 ? t : null
}

const ITEMS_PER_PAGE = 10

export default function UsuariosUAClient() {
  const [usuarios, setUsuarios] = useState<UsuarioUA[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  
  const [search, setSearch] = useState('')
  const [selectedUA, setSelectedUA] = useState('TODAS')
  const [listaUAs, setListaUAs] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    let isMounted = true

    async function loadData() {
      try {
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
        }
      } catch (error) {
        if (isMounted) {
          setLoadError(error instanceof Error ? error.message : 'No se pudieron cargar los usuarios.')
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

  const usuariosFiltrados = useMemo(
    () => usuarios.filter((usuario) => {
      const matchesSearch = coincideBusquedaPorPalabras(search, [
        ...usuario.nombres_busqueda,
        ...usuario.correos_busqueda,
        ...usuario.matriculas_busqueda,
        usuario.nombre,
        usuario.email,
        usuario.matricula,
        usuario.carrera,
        usuario.semestre,
        usuario.unidad_academica,
      ])
      const matchesUA = selectedUA === 'TODAS' ||
        usuario.unidad_academica === selectedUA ||
        usuario.unidad_academica == null

      return matchesSearch && matchesUA
    }),
    [usuarios, search, selectedUA]
  )

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  const handleUAChange = (value: string) => {
    setSelectedUA(value)
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

  if (loadError) {
    return (
      <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        Error al cargar usuarios por UA: {loadError}
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto p-4 md:p-0">
      <UsuariosUAHeader
        totalAlumnos={usuarios.length}
        search={search}
        setSearch={handleSearchChange}
        selectedUA={selectedUA}
        setSelectedUA={handleUAChange}
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