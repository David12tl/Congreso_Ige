'use server'

import { createClient } from '@/lib/supabase/server'

export interface AsistenteTicket {
  id: string
  nombre: string | null
  email: string
  carrera: string | null
  semestre: string | null
  matricula: string | null
  unidad_academica: string | null
  type: 'alumno' | 'empresa'
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
}

export async function getAsistentesPorUA(): Promise<AsistenteTicket[]> {
  const supabase = await createClient()

  const client = supabase as unknown as {
    from: (table: string) => {
      select: (columns?: string) => Promise<{ 
        data: unknown[] | null
        error: { message: string } | null 
      }>
    }
  }

  // Obtenemos los campos clave de la tabla public.tickets
  const { data, error } = await client
    .from('tickets')
    .select('id, nombre, email, carrera, semestre, matricula, unidad_academica, type')

  if (error) {
    console.error('Error al obtener asistentes de la DB:', error)
    return []
  }

  const rawTickets = (data || []) as SupabaseTicketRow[]

  // Mapeamos los datos garantizando el tipado correcto de 'type' sin romper las reglas de ESLint
  return rawTickets.map((t) => ({
    id: t.id,
    nombre: t.nombre,
    email: t.email,
    carrera: t.carrera,
    semestre: t.semestre,
    matricula: t.matricula,
    unidad_academica: t.unidad_academica,
    type: t.type === 'empresa' ? 'empresa' : 'alumno',
  }))
}