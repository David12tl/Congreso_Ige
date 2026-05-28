'use server'

import { createClient } from '@/src/lib/supabase/server'

export interface AsistenteGlobal {
  id: string
  nombre: string | null
  email: string
  carrera: string | null
  semestre: string | null
  matricula: string | null
  unidad_academica: string | null
  type: 'alumno' | 'empresa'
  telefono: string | null
}

interface SupabaseTicketRow {
  id: string
  nombre: string | null
  email: string
  carrera: string | null
  semestre: string | null
  matricula: string | null
  unidad_academica: string | null
  type: string
  telefono: string | null
}

export async function getTodosLosAsistentes(): Promise<AsistenteGlobal[]> {
  const supabase = await createClient()

  const client = supabase as unknown as {
    from: (table: string) => {
      select: (columns?: string) => Promise<{ 
        data: unknown[] | null
        error: { message: string } | null 
      }>
    }
  }

  // Traemos todo el padrón de la tabla public.tickets
  const { data, error } = await client
    .from('tickets')
    .select('id, nombre, email, carrera, semestre, matricula, unidad_academica, type, telefono')

  if (error) {
    console.error('Error al obtener lista global de asistentes:', error)
    return []
  }

  const rawTickets = (data || []) as SupabaseTicketRow[]

  return rawTickets.map((t) => ({
    id: t.id,
    nombre: t.nombre,
    email: t.email,
    carrera: t.carrera,
    semestre: t.semestre,
    matricula: t.matricula,
    unidad_academica: t.unidad_academica,
    type: t.type === 'empresa' ? 'empresa' : 'alumno',
    telefono: t.telefono,
  }))
}