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
  unidad_academica_id: number | null
  type: 'alumno' | 'empresa'
  telefono: string | null
  purchased_at: string | null
  estatus_pago: string | null
}

interface DynamicClient {
  from: (table: string) => {
    select: (columns: string) => Promise<{
      data: Record<string, unknown>[] | null
      error: { message: string } | null
    }>
  }
}

export async function getTodosLosAsistentes(): Promise<AsistenteGlobal[]> {
  const supabase = await createClient()
  const client = supabase as unknown as DynamicClient

  const { data, error } = await client
    .from('tickets')
    .select('id, nombre, email, carrera, semestre, matricula, unidad_academica_id, type, telefono, purchased_at, estatus_pago')

  if (error) {
    console.error('Error al obtener lista global de asistentes:', error)
    return []
  }

  return (data ?? []).map((t) => ({
    id: t.id as string,
    nombre: (t.nombre as string) ?? null,
    email: t.email as string,
    carrera: (t.carrera as string) ?? null,
    semestre: (t.semestre as string) ?? null,
    matricula: (t.matricula as string) ?? null,
    unidad_academica: null,
    unidad_academica_id: (t.unidad_academica_id as number) ?? null,
    type: (t.type as string) === 'empresa' ? 'empresa' : 'alumno',
    telefono: (t.telefono as string) ?? null,
    purchased_at: (t.purchased_at as string) ?? null,
    estatus_pago: (t.estatus_pago as string) ?? null,
  }))
}