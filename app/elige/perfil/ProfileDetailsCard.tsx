'use client'

import React from 'react'
import { 
  HiOutlineUser, 
  HiOutlineMail, 
  HiOutlineAcademicCap, 
  HiOutlineCheckCircle, 
  HiOutlineSave 
} from 'react-icons/hi'
import { GlassCard } from '@/components/ui/GlassCard'

interface UnidadAcademica {
  id: number
  nombre: string
  tipo: 'interno' | 'externo'
}

interface ProfileDetailsCardProps {
  hasTicket: boolean
  email: string | null
  unidadAcademicaNombre: string | null
  unidadesAcademicas: UnidadAcademica[]
  selectedUA: number | ''
  setSelectedUA: (val: number | '') => void
  onSaveUA: () => void
  savingUA: boolean
  uaSaved: boolean
  uaError: string | null
  setUaError: (val: string | null) => void
}

export function ProfileDetailsCard({
  hasTicket,
  email,
  unidadAcademicaNombre,
  unidadesAcademicas,
  selectedUA,
  setSelectedUA,
  onSaveUA,
  savingUA,
  uaSaved,
  uaError,
  setUaError
}: ProfileDetailsCardProps) {
  return (
    <GlassCard 
      className="p-8 lg:col-span-2 flex flex-col justify-between bg-white dark:bg-[#2a2a2f] border border-[#cbd5e1] dark:border-slate-700 shadow-sm" 
      glowColor="purple"
    >
      <div>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-black text-[#0f172a] dark:text-white uppercase tracking-wider border-b-2 border-[#7f1d1d] pb-1">
            Datos del Perfil
          </h3>
        </div>

        <div className="space-y-4">
          {/* Nombre completo */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <HiOutlineUser className="w-6 h-6 text-[#1e3a8a]" />
            <div className="flex-1">
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">Nombre Completo</p>
              <p className="text-[#0f172a] dark:text-white font-medium">
                {hasTicket ? 'Revisa tu credencial en el módulo Pase' : '—'}
              </p>
            </div>
          </div>

          {/* Correo Electrónico */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <HiOutlineMail className="w-6 h-6 text-[#7f1d1d]" />
            <div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">Correo Electrónico</p>
              <p className="text-[#0f172a] dark:text-white font-medium">{email || '—'}</p>
            </div>
          </div>

          {/* Selector de Unidad Académica */}
          <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <HiOutlineAcademicCap className="w-6 h-6 text-[#1e3a8a] mt-1" />
            <div className="flex-1">
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">
                Unidad Académica <span className="text-[#7f1d1d] dark:text-red-400">*</span>
              </p>
              {unidadAcademicaNombre ? (
                <p className="text-[#0f172a] dark:text-white font-medium flex items-center gap-2 mt-1">
                  {unidadAcademicaNombre}
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900">
                    <HiOutlineCheckCircle className="w-3 h-3" /> Asignada
                  </span>
                </p>
              ) : (
                <p className="text-[#7f1d1d] dark:text-red-300 font-bold text-sm mt-1">No asignada</p>
              )}

              <div className="mt-4 flex flex-col sm:flex-row gap-2">
                <select
                  value={selectedUA}
                  onChange={(e) => {
                    setSelectedUA(e.target.value ? Number(e.target.value) : '')
                    setUaError(null)
                  }}
                  className="flex-1 bg-slate-100 dark:bg-[#2a2a2f] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] outline-none font-medium"
                >
                  <option value="" className="bg-white dark:bg-[#2a2a2f]">
                    -- Seleccionar Unidad Académica --
                  </option>
                  {unidadesAcademicas.map((ua) => (
                    <option key={ua.id} value={ua.id} className="bg-white dark:bg-[#2a2a2f]">
                      {ua.nombre} ({ua.tipo === 'interno' ? 'Interna' : 'Externa'})
                    </option>
                  ))}
                </select>
                
                <button
                  onClick={onSaveUA}
                  disabled={savingUA || selectedUA === ''}
                  className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-[#1e3a8a] hover:bg-[#172554] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm"
                >
                  <HiOutlineSave className="w-4 h-4" />
                  {savingUA ? 'Guardando...' : 'Guardar'}
                </button>
              </div>

              {uaSaved && (
                <p className="text-emerald-700 dark:text-emerald-300 text-xs font-semibold mt-3 flex items-center gap-1">
                  <HiOutlineCheckCircle className="w-4 h-4" /> Unidad Académica guardada correctamente.
                </p>
              )}
              {uaError && (
                <p className="text-[#7f1d1d] dark:text-red-300 text-xs font-bold mt-3">{uaError}</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </GlassCard>
  )
}