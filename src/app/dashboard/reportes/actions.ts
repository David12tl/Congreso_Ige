'use server'

import { createClient } from '@/lib/supabase/server'

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

export async function getReportesData(): Promise<{ uas: UAMetrica[]; global: ResumenGlobal }> {
  const supabase = await createClient()

  // Consultar todos los tickets con el join a unidades_academicas para obtener el nombre real
  const { data: ticketsData, error: err1 } = await supabase
    .from('tickets')
    .select('type, unidades_academicas!tickets_unidad_academica_id_fkey(nombre)')

  if (err1) {
    console.error('Error al consultar tickets para UA:', err1)
    return { uas: [], global: { totalTickets: 0, totalAlumnos: 0, totalEmpresas: 0, porcentajeAlumnos: 0, porcentajeEmpresas: 0 } }
  }

  const rawTickets = (ticketsData || []) as Array<{
    type: string
    unidades_academicas: { nombre: string } | null
  }>

  const totalTicketsGeneral = rawTickets.length

  // Agrupación manual por nombre de UA (usando el nombre real desde la relación FK)
  const conteoUA: Record<string, number> = {}
  let totalAlumnos = 0
  let totalEmpresas = 0

  rawTickets.forEach((ticket) => {
    const uaNombre = ticket.unidades_academicas?.nombre || 'No Especificada'
    conteoUA[uaNombre] = (conteoUA[uaNombre] || 0) + 1

    if (ticket.type === 'alumno') {
      totalAlumnos++
    } else if (ticket.type === 'empresa') {
      totalEmpresas++
    }
  })

  // Formatear el arreglo de UAs calculando su porcentaje de contribución
  const uasFormateadas: UAMetrica[] = Object.keys(conteoUA)
    .map((nombre) => {
      const cantidad = conteoUA[nombre] || 0
      const porcentaje = totalTicketsGeneral > 0 ? Math.round((cantidad / totalTicketsGeneral) * 100) : 0
      return {
        nombre,
        totalTickets: cantidad,
        porcentaje,
      }
    })
    .sort((a, b) => b.totalTickets - a.totalTickets) // Ordenar de mayor a menor ventas

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
    },
  }
}