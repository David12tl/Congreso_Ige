'use client'

import React, { useEffect, useState } from 'react'
import { 
  HiOutlineOfficeBuilding, 
  HiOutlineAcademicCap, 
  HiOutlineGlobeAlt, 
  HiOutlineUserGroup 
} from 'react-icons/hi'
import { createClient } from '@/src/lib/supabase/client'

// ─── Interfaces de Datos ───────────────────────────────────────────────────
interface AsistenteTicket {
  id: string
  nombre: string | null
  email: string
  carrera: string | null
  matricula: string | null
  type: 'alumno' | 'empresa'
}

interface RpcAsistenteRow {
  id: string
  nombre: string
  email: string
  carrera: string
  matricula: string
  type: string
  nombre_ua: string
}

// Interfaz para la respuesta del perfil del encargado
interface ProfileSedeResponse {
  unidad_academica_id?: number | string | null
  id_ua?: number | string | null
}

function GlassCard({ children, className = '', glowColor = 'emerald' }: {
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

export default function MiUAPage() {
  const [nombreUA, setNombreUA] = useState('Mi Sede')
  const [asistentes, setAsistentes] = useState<AsistenteTicket[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function startFetching() {
      try {
        const supabase = createClient()

        // 1. Obtener el usuario autenticado (Encargado)
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
          if (isMounted) setLoading(false)
          return
        }

        // 2. Ejecutar la función RPC de Supabase
        const supabaseInseguro = supabase as unknown as {
          rpc: (name: string, params: { user_uuid: string }) => Promise<{ data: RpcAsistenteRow[] | null; error: { message: string } | null }>
        }

        const { data: rawAsistentes, error: rpcError } = await supabaseInseguro
          .rpc('get_asistentes_por_encargado', { user_uuid: user.id })

        if (rpcError) {
          console.error('Error en RPC get_asistentes_por_encargado:', rpcError.message)
        }

        if (isMounted) {
          // 3. Mapear alumnos obtenidos si existen
          const listaMapeada: AsistenteTicket[] = (rawAsistentes || []).map((t: RpcAsistenteRow) => ({
            id: String(t.id || ''),
            nombre: t.nombre === 'Sin nombre registrado' ? 'Sin nombre' : t.nombre,
            email: t.email ? String(t.email).trim() : 'Sin correo registrado',
            carrera: t.carrera === 'N/A' ? 'N/A' : t.carrera,
            matricula: t.matricula === '' ? null : t.matricula,
            type: t.type === 'empresa' ? 'empresa' : 'alumno'
          }))

          // 4. CORRECCIÓN DEL HEADER CON CONTROL DE UNDEFINED
          if (rawAsistentes && rawAsistentes.length > 0 && rawAsistentes[0].nombre_ua) {
            setNombreUA(rawAsistentes[0].nombre_ua)
          } else {
            const { data } = await supabase
              .from('profiles')
              .select('unidad_academica_id')
              .eq('id', user.id)
              .single()

            const perfil = data as ProfileSedeResponse | null

            if (perfil && (perfil.unidad_academica_id || perfil.id_ua)) {
              const currentIdUa = perfil.unidad_academica_id || perfil.id_ua
              
              if (currentIdUa !== null && currentIdUa !== undefined) {
                // Convertimos a número porque la columna `id` en Supabase es de tipo numérico
                const numericIdUa = Number(currentIdUa)

                if (!Number.isNaN(numericIdUa)) {
                  // Consultamos el nombre real a la tabla de unidades académicas
                  const { data: unidad } = await supabase
                    .from('unidades_academicas')
                    .select('nombre')
                    .eq('id', numericIdUa)
                    .single()

                  if (unidad?.nombre) {
                    setNombreUA(unidad.nombre)
                  } else {
                    setNombreUA(numericIdUa === 4 ? 'Unidad Académica Tequila' : 'Sede Asignada')
                  }
                } else {
                  setNombreUA('Unidad Académica Tequila')
                }
              } else {
                setNombreUA('Unidad Académica Tequila')
              }
            } else {
              setNombreUA('Unidad Académica Tequila')
            }
          }

          setAsistentes(listaMapeada)
          setLoading(false)
        }
      } catch (err) {
        console.error('Error general al inicializar datos:', err)
        if (isMounted) setLoading(false)
      }
    }

    startFetching()

    return () => {
      isMounted = false
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
        <p className="text-gray-400 font-mono text-xs uppercase tracking-widest">Cargando datos de la Sede...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto p-4 md:p-0">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase">
            <HiOutlineOfficeBuilding className="inline-block w-8 h-8 mr-3 text-emerald-400" />
            Asistentes por{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
              UA
            </span>
          </h1>
          <p className="text-gray-500 text-sm font-mono mt-1">ENCARGADO // {nombreUA.toUpperCase()}</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">Vista de Encargado</span>
        </div>
      </header>

      {/* Tabla de Alumnos Filtrados */}
      <div className="grid grid-cols-1 gap-6">
        <div className="w-full">
          <GlassCard className="overflow-hidden" glowColor="emerald">
            <div className="p-4 bg-white/[0.01] border-b border-white/5 flex items-center justify-between">
              <span className="text-xs font-mono text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <HiOutlineUserGroup className="text-emerald-400 w-4 h-4" /> Alumnos Registrados (Rol 3)
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                Total en Sede: {asistentes.length}
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-white/[0.02] border-b border-white/5">
                  <tr>
                    <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Nombre Completo</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Correo Electrónico</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Carrera // Matrícula</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Tipo de Asistente</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {asistentes.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-500 font-mono">
                        No hay alumnos con Rol 3 registrados en esta Unidad Académica actualmente.
                      </td>
                    </tr>
                  ) : (
                    asistentes.map((asistente) => (
                      <tr key={asistente.id} className="hover:bg-white/[0.01] transition-colors group">
                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-gray-200 block group-hover:text-emerald-400 transition-colors">
                            {asistente.nombre}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs font-mono text-gray-400">
                          {asistente.email}
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-300 font-mono">
                          {asistente.carrera || 'N/A'}{' '}
                          {asistente.matricula && (
                            <span className="text-gray-500">({asistente.matricula})</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {asistente.type === 'empresa' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              <HiOutlineGlobeAlt className="w-3 h-3" /> Empresa
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <HiOutlineAcademicCap className="w-3 h-3" /> Alumno
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
      </div>
    </div>
  )
}
