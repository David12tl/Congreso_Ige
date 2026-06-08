'use server'

import { createClient } from '@/src/lib/supabase/server'

export interface PerfilUsuario {
  email: string | null
  createdAt: string
  rolNombre: string
  nivelAcceso: number
  unidadAcademicaId: number | null
  unidadAcademicaNombre: string | null
}

interface SupabaseProfileJoin {
  email: string | null
  created_at: string | null
  unidad_academica_id: number | null
  roles: {
    nombre_rol: string
    nivel_acceso: number | null
  } | null
  unidades_academicas: {
    nombre: string
  } | null
}

export interface UnidadAcademica {
  id: number
  nombre: string
  tipo: 'interno' | 'externo'
}

export async function getMiPerfil(): Promise<PerfilUsuario | null> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('email, created_at, unidad_academica_id, roles(nombre_rol, nivel_acceso), unidades_academicas(nombre)')
    .eq('id', user.id)

  if (error || !data || data.length === 0) return null

  const p = data[0] as unknown as SupabaseProfileJoin

  return {
    email: p.email,
    createdAt: p.created_at ? new Date(p.created_at).toLocaleDateString() : '—',
    rolNombre: p.roles?.nombre_rol || 'Usuario',
    nivelAcceso: p.roles?.nivel_acceso ?? 1,
    unidadAcademicaId: p.unidad_academica_id ?? null,
    unidadAcademicaNombre: p.unidades_academicas?.nombre ?? null,
  }
}

export async function getUnidadesAcademicas(): Promise<UnidadAcademica[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('unidades_academicas')
    .select('id, nombre, tipo')
    .order('nombre', { ascending: true })

  if (error) {
    console.error('Error al cargar UAs:', error)
    return []
  }

  return (data || []) as UnidadAcademica[]
}

export async function actualizarMiUnidadAcademica(unidadAcademicaId: number): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: 'Sesión expirada o no válida.' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ unidad_academica_id: unidadAcademicaId })
    .eq('id', user.id)

  if (error) {
    console.error('Error al actualizar unidad académica:', error)
    return { success: false, message: `Error al guardar: ${error.message}` }
  }

  return { success: true, message: 'Unidad Académica actualizada correctamente.' }
}