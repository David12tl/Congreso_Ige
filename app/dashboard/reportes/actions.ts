'use server'

import { createClient } from '@/src/lib/supabase/server'

// Interfaces estrictas para el Tipado de Retorno
export interface UAMetrica {
  nombre: string
  totalTickets: number
  porcentaje: number
}

export interface ResumenGlobal {
  totalTickets: number
  totalAlumnos: number
  totalEmpresas: number
  porcentajeAlumnos: number
  porcentajeEmpresas: number
}

// Interfaces de mapeo para Supabase (Evitando usar any)
interface SupabaseTicketRaw {
  unidad_academica: string | null
  type: string
}

export async function getReportesData(): Promise<{ uas: UAMetrica[]; global: ResumenGlobal }> {
  const supabase = await createClient()
  
  // Forzamos el tipado intermedio seguro
  const client = supabase as unknown as {
    from: (table: string) => {
      select: (columns?: string) => Promise<{ data: unknown[] | null; error: { message: string } | null }>
    }
  }

  // 1. Consultar todos los tickets para calcular métricas por UA
  const { data: ticketsData, error: err1 } = await client
    .from('tickets')
    .select('unidad_academica, type')

  if (err1) {
    console.error('Error al consultar tickets para UA:', err1)
    return { uas: [], global: { totalTickets: 0, totalAlumnos: 0, totalEmpresas: 0, porcentajeAlumnos: 0, porcentajeEmpresas: 0 } }
  }

  const rawTickets = (ticketsData || []) as SupabaseTicketRaw[]
  const totalTicketsGeneral = rawTickets.length

  // Agrupación manual libre de arrays dinámicos/any
  const conteoUA: Record<string, number> = {}
  let totalAlumnos = 0
  let totalEmpresas = 0

  rawTickets.forEach((ticket) => {
    // Agrupar por Unidad Académica
    const uaNombre = ticket.unidad_academica || 'No Especificada'
    conteoUA[uaNombre] = (conteoUA[uaNombre] || 0) + 1

    // Contar por tipo de ticket
    if (ticket.type === 'alumno') {
      totalAlumnos++
    } else if (ticket.type === 'empresa') {
      totalEmpresas++
    }
  })

  // Formatear el arreglo de UAs calculando su porcentaje de contribución
  const uasFormateadas: UAMetrica[] = Object.keys(conteoUA).map((nombre) => {
    const cantidad = conteoUA[nombre] || 0
    const porcentaje = totalTicketsGeneral > 0 ? Math.round((cantidad / totalTicketsGeneral) * 100) : 0
    return {
      nombre,
      totalTickets: cantidad,
      porcentaje,
    }
  }).sort((a, b) => b.totalTickets - a.totalTickets) // Ordenar de mayor a menor ventas

  // Calcular porcentajes globales de segmentación
  const porcentajeAlumnos = totalTicketsGeneral > 0 ? Math.round((totalAlumnos / totalTicketsGeneral) * 100) : 0
  const porcentajeEmpresas = totalTicketsGeneral > 0 ? Math.round((totalEmpresas / totalTicketsGeneral) * 100) : 0

  return {
    uas: uasFormateadas,
    global: {
      totalTickets: totalTicketsGeneral,
      totalAlumnos,
      totalEmpresas,
      porcentajeAlumnos,
      porcentajeEmpresas,
    }
  }
}