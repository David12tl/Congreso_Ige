'use server'

import { createClient } from '@/lib/supabase/server'

// Definición corregida de la interfaz de Ticket
export interface Ticket {
  id: string
  event_id: string | null
  zone_id: string | null
  purchase_id: string | null
  buyer_id: string | null
  type: 'alumno' | 'empresa' | string
  modalidad?: 'escolarizado' | 'mixto' | null
  nombre: string | null
  semestre: string | null
  carrera: string | null
  matricula: string | null
  empresa: string | null
  telefono: string | null
  email: string
  qr_data: string | null
  pdf_path: string | null
  attended_day1: boolean | null
  attended_day1_at: string | null
  attended_day2: boolean | null
  attended_day2_at: string | null
  purchased_at: string | null
  unidad_academica_id: number | null
  asiento_zona: string | null
  asiento_bloque: string | null
  asiento_fila: string | null
  asiento_numero: number | null
  // 💡 Se marca como opcional (?) para coincidir con la respuesta deducida por Supabase
  estatus_pago?: 'pagado' | 'pending' | string | null
}

/**
 * Server Action para consultar todos los tickets desde la base de datos
 */
export async function getTickets(): Promise<{ tickets: Ticket[]; error: string | null }> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .order('purchased_at', { ascending: false })

    if (error) {
      console.error('Error al obtener tickets:', error)
      return { tickets: [], error: error.message }
    }

    // Casteamos la respuesta explícitamente a Ticket[]
    return { tickets: (data as Ticket[]) || [], error: null }
  } catch (err: unknown) { // 💡 Se usa unknown en lugar de any para satisfacer ESLint
    const errorMessage = err instanceof Error ? err.message : 'Error interno del servidor al consultar tickets'
    console.error('Error en Server Action getTickets:', err)
    return { tickets: [], error: errorMessage }
  }
}