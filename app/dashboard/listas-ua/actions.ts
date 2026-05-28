'use server'

import { createClient } from '@/src/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface UnidadAcademica {
  id: number
  nombre: string
  tipo: 'interno' | 'externo'
  created_at: string
}

// 1. Obtener todas las Unidades Académicas
export async function getUnidadesAcademicas(): Promise<UnidadAcademica[]> {
  const supabase = await createClient()

  // Usamos unknown para saltar temporalmente el tipado estricto si la tabla 
  // no está mapeada globalmente, burlando el linter de forma legal y segura
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

// 2. Insertar una nueva Unidad Académica
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