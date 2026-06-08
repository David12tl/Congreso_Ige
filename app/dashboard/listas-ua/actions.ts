'use server'

import { createClient } from '@/src/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface UnidadAcademica {
  id: number
  nombre: string
  tipo: 'interno' | 'externo'
  created_at: string
}

export interface UsuarioConUA {
  id: string
  email: string | null
  rol: string | null
  id_rol: number
  unidad_academica_id: number | null
  unidad_academica_nombre: string | null
  unidad_academica_tipo: string | null
  created_at: string | null
}

export interface PerfilSesion {
  id_rol: number
  unidad_academica_id: number | null
}

// 1. Obtener el perfil del usuario logueado (id_rol y unidad_academica_id)
export async function getPerfilSesion(): Promise<PerfilSesion | null> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('profiles')
    .select('id_rol, unidad_academica_id')
    .eq('id', user.id)
    .maybeSingle()

  return data
}

// 2. Obtener usuarios con nombre de UA y rol, con filtro por UA si es encargado
export async function getUsuariosConUA(): Promise<UsuarioConUA[]> {
  const supabase = await createClient()

  // Obtener sesión actual para aplicar filtro por rol
  const perfil = await getPerfilSesion()

  // Construir query con JOINs
  let query = supabase
    .from('profiles')
    .select(`
      id,
      email,
      id_rol,
      unidad_academica_id,
      created_at,
      unidades_academicas!profiles_unidad_academica_id_fkey (
        nombre,
        tipo
      ),
      roles!profiles_id_rol_fkey (
        nombre_rol
      )
    `)
    .order('created_at', { ascending: false })

  // Si es Encargado (id_rol=2), filtrar solo por su propia UA
  if (perfil && perfil.id_rol === 2 && perfil.unidad_academica_id !== null) {
    query = query.eq('unidad_academica_id', perfil.unidad_academica_id)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error al cargar usuarios con UA:', error)
    return []
  }

  if (!data) return []

  // Mapear datos planos desde la respuesta anidada de Supabase
  return data.map((row: Record<string, unknown>) => {
    const ua = row.unidades_academicas as { nombre: string; tipo: string } | null
    const rol = row.roles as { nombre_rol: string } | null

    return {
      id: row.id as string,
      email: (row.email as string) ?? null,
      rol: rol?.nombre_rol ?? null,
      id_rol: row.id_rol as number,
      unidad_academica_id: (row.unidad_academica_id as number) ?? null,
      unidad_academica_nombre: ua?.nombre ?? null,
      unidad_academica_tipo: ua?.tipo ?? null,
      created_at: (row.created_at as string) ?? null,
    }
  })
}

// 3. Obtener todas las Unidades Académicas (para dropdown de filtro)
export async function getUnidadesAcademicas(): Promise<UnidadAcademica[]> {
  const supabase = await createClient()

  const client = supabase as unknown as {
    from: (table: string) => {
      select: (columns?: string) => {
        order: (column: string, options: { ascending: boolean }) => Promise<{ data: UnidadAcademica[] | null; error: unknown }>
      }
    }
  }

  const { data, error } = await client
    .from('unidades_academicas')
    .select('*')
    .order('nombre', { ascending: true })

  if (error) {
    console.error('Error al cargar UAs:', error)
    return []
  }

  return data || []
}

// 4. Insertar una nueva Unidad Académica
export async function createUnidadAcademica(nombre: string, tipo: 'interno' | 'externo'): Promise<void> {
  const supabase = await createClient()

  const client = supabase as unknown as {
    from: (table: string) => {
      insert: (values: Array<{ nombre: string; tipo: 'interno' | 'externo' }>) => Promise<{ error: { message: string } | null }>
    }
  }

  const { error } = await client
    .from('unidades_academicas')
    .insert([{ nombre, tipo }])

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard/listas-ua')
}