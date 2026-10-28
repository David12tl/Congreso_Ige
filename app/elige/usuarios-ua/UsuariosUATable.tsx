'use client'

import React from 'react'
import Link from 'next/link'
import { HiOutlineFolderOpen } from 'react-icons/hi'
import { UsuarioUA } from './action'

function derivarModalidad(usuario: UsuarioUA): 'mixto' | 'escolarizado' {
  const carrera = (usuario.carrera || '').toUpperCase()
  const matricula = (usuario.matricula || '').toUpperCase()

  if (usuario.modalidad === 'mixto') return 'mixto'
  if (carrera.includes('MIXTO') || matricula.startsWith('266W')) return 'mixto'
  return 'escolarizado'
}

interface UsuariosUATableProps {
  usuarios: UsuarioUA[]
}

export function UsuariosUATable({ usuarios }: UsuariosUATableProps) {
  return (
    <div className="w-full overflow-x-auto rounded-b-2xl border-t border-slate-200 bg-white">
      <table className="w-full border-collapse text-left text-sm text-slate-500">
        <thead className="bg-[#1E2A39]/5 text-[11px] font-black uppercase tracking-widest text-[#1E2A39]">
          <tr>
            <th scope="col" className="px-6 py-4">Expediente</th>
            <th scope="col" className="px-6 py-4">Usuario / Correo</th>
            <th scope="col" className="px-6 py-4">Matrícula</th>
            <th scope="col" className="px-6 py-4">Carrera / Semestre</th>
            <th scope="col" className="px-6 py-4">Unidad Académica</th>
            <th scope="col" className="px-6 py-4 text-right">Rol / Modalidad</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white text-sm text-slate-900">
          {usuarios.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium">
                Ningún usuario coincide con los criterios de búsqueda actuales.
              </td>
            </tr>
          ) : (
            usuarios.map((usuario) => {
              const modalidad = derivarModalidad(usuario)
              return (
                <tr key={usuario.id} className="hover:bg-slate-50/50 transition-colors">
                  {/* Botón de Carpeta Abierta con la ruta corregida */}
                  <td className="px-6 py-4">
                    <Link
                      href={`/elige/usuarios-ua/${usuario.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-bold uppercase transition-all shadow-sm"
                      title="Ver vouchers del expediente"
                    >
                      <HiOutlineFolderOpen className="w-4 h-4 text-amber-600" />
                      Carpeta
                    </Link>
                  </td>

                  <td className="px-6 py-4">
                    <div className={`font-bold text-base leading-tight ${usuario.nombre ? 'text-[#1E2A39]' : 'text-slate-400 italic'}`}>
                      {usuario.nombre || 'Sin Nombre Registrado'}
                    </div>
                    <div className="text-xs text-[#7D7D7D] font-medium mt-0.5">{usuario.email}</div>
                  </td>

                  <td className="px-6 py-4 font-mono font-semibold text-[#1E2A39]">
                    {usuario.matricula || <span className="italic text-slate-400 font-light">Pendiente</span>}
                  </td>

                  <td className="px-6 py-4">
                    <div className={`font-bold ${usuario.carrera ? 'text-[#1E2A39]' : 'text-slate-400 italic'}`}>
                      {usuario.carrera || 'No Especificada'}
                    </div>
                    <div className="text-xs text-[#7D7D7D] mt-0.5">
                      {usuario.semestre ? `${usuario.semestre}° Semestre` : <span className="italic text-slate-300">No registrado</span>}
                    </div>
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
  )
}