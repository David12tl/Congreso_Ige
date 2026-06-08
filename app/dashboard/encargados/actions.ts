'use server'

import { createClient } from '@/src/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface EncargadoConUA {
  id: string
  email: string | null
  id_rol: number
  unidad_academica_id: number | null
  nombre_ua: string | null
  created_at: string | null
}

export interface EncargadosDashboardData {
  totalEncargados: number
  uasAsignadas: number
  encargados: EncargadoConUA[]
  encargadosRecientes: EncargadoConUA[]
}

export async function getEncargadosData(): Promise<EncargadosDashboardData> {
  const supabase = await createClient()

  // Obtener perfiles con id_rol = 2 (Encargados) incluyendo relación con unidades_academicas
  const { data: profiles, error, count } = await supabase
    .from('profiles')
    .select('id, email, id_rol, unidad_academica_id, created_at, unidades_academicas!profiles_unidad_academica_id_fkey(nombre)', { count: 'exact' })
    .eq('id_rol', 2)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error al consultar encargados:', error)
    return {
      totalEncargados: 0,
      uasAsignadas: 0,
      encargados: [],
      encargadosRecientes: [],
    }
  }

  const typedProfiles = (profiles ?? []) as Array<{
    id: string
    email: string | null
    id_rol: number
    unidad_academica_id: number | null
    created_at: string | null
    unidades_academicas: { nombre: string } | null
  }>

  const encargados: EncargadoConUA[] = typedProfiles.map((p) => ({
    id: p.id,
    email: p.email,
    id_rol: p.id_rol,
    unidad_academica_id: p.unidad_academica_id,
    nombre_ua: p.unidades_academicas?.nombre ?? 'No asignada',
    created_at: p.created_at,
  }))

  // UAs únicas asignadas
  const uasUnicas = new Set(
    encargados
      .filter((e) => e.unidad_academica_id !== null)
      .map((e) => e.unidad_academica_id)
  )

  return {
    totalEncargados: count ?? encargados.length,
    uasAsignadas: uasUnicas.size,
    encargados,
    encargadosRecientes: encargados.slice(0, 5),
  }
}

export async function updateEncargadoUA(userId: string, unidadAcademicaId: number | null) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('profiles')
    .update({ unidad_academica_id: unidadAcademicaId })
    .eq('id', userId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard/encargados')
}