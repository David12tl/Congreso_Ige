'use client'

import React, { useEffect, useState } from 'react'
import {
  HiOutlineUserGroup,
  HiOutlineShieldCheck,
  HiOutlineOfficeBuilding,
  HiOutlineUserCircle,
} from 'react-icons/hi'
import { GlassCard } from '@/components/ui/GlassCard'
import { getEncargadosData, EncargadosDashboardData } from './actions'

export default function EncargadosPage() {
  const [data, setData] = useState<EncargadosDashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      try {
        const res = await getEncargadosData()
        if (isMounted) setData(res)
      } catch (err) {
        if (isMounted) console.error('Error cargando encargados:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    load()
    return () => { isMounted = false }
  }, [])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-purple-200 border-t-purple-500 animate-spin" />
        <p className="text-slate-500 font-light text-xs uppercase tracking-widest">Cargando encargados desde Supabase...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto p-4 md:p-0">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-black tracking-tight text-[#0f172a] text-2xl md:text-3xl">
            <HiOutlineShieldCheck className="inline-block w-8 h-8 mr-3 text-purple-700" />
            Gestión de{' '}
            <span className="text-purple-700">
              Encargados
            </span>
          </h1>
          <p className="text-slate-500 text-sm font-light mt-1">ADMIN // CONTROL_DE_PERMISOS_Y_ROL_2</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-200 rounded-full">
          <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
          <span className="text-purple-700 text-xs font-bold uppercase tracking-widest">{data?.totalEncargados ?? 0} encargados en DB</span>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-6" glowColor="purple">
          <div className="flex items-center gap-3 mb-4 text-purple-700">
            <HiOutlineUserGroup className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest text-purple-700/80">Total Encargados</span>
          </div>
          <span className="text-6xl font-black text-[#0f172a]">
            {data?.totalEncargados ?? '—'}
          </span>
          <p className="text-[10px] text-purple-700 mt-2 font-light">id_rol = 2 en profiles</p>
        </GlassCard>

        <GlassCard className="p-6" glowColor="emerald">
          <div className="flex items-center gap-3 mb-4 text-emerald-700">
            <HiOutlineShieldCheck className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-700/80">UAs Asignadas</span>
          </div>
          <span className="text-6xl font-black text-[#0f172a]">
            {data?.uasAsignadas ?? '—'}
          </span>
          <p className="text-[10px] text-emerald-700 mt-2 font-light">Unidades Académicas</p>
        </GlassCard>

        <GlassCard className="p-6" glowColor="amber">
          <div className="flex items-center gap-3 mb-4 text-amber-700">
            <HiOutlineUserGroup className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest text-amber-700/80">Sin UA Asignada</span>
          </div>
          <span className="text-6xl font-black text-[#0f172a]">
            {data?.encargados.filter((e) => e.unidad_academica_id === null).length ?? '—'}
          </span>
          <p className="text-[10px] text-amber-700 mt-2 font-light">Pendientes de asignación</p>
        </GlassCard>
      </div>

      {/* Tabla de Encargados con UA - Usando tarjetas blancas con bordes redondeados */}
      <GlassCard className="overflow-hidden" glowColor="purple">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-light text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <HiOutlineOfficeBuilding className="w-4 h-4 text-purple-700" />
            Listado de Encargados y sus Unidades Académicas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">ID / Email</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Rol</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Unidad Académica</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Registro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {data && data.encargados.length > 0 ? (
                data.encargados.map((enc) => (
                  <tr key={enc.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 group-hover:border-purple-200 transition-colors">
                          <HiOutlineUserCircle className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-light text-purple-700 font-bold">{enc.id.slice(0, 12)}...</span>
                          <span className="text-slate-700 text-sm">{enc.email ?? 'Sin email'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-purple-200 bg-purple-50 text-purple-700">
                        Encargado
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-700 font-light">{enc.nombre_ua ?? 'No asignada'}</span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 font-light">
                      {enc.created_at ? new Date(enc.created_at).toLocaleDateString('es-MX') : '—'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm text-slate-500 font-light">
                    No hay encargados registrados con id_rol = 2.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  )
}