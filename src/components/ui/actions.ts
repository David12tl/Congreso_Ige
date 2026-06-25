'use server'

import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database.types'

interface TicketSelect {
  qr_data: string | null
}

// 1. Obtener asientos ocupados filtrando por el evento actual
export async function obtenerAsientosOcupados(eventId: string) {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: tickets, error } = await (supabase as any)
    .from('tickets')
    .eq('type', 'student')
    .eq('event_id', eventId)
    .select('qr_data')

  if (error) {
    console.error('Error al obtener asientos:', error)
    return []
  }

  const ticketsData = (tickets as TicketSelect[] | null) || []
  return ticketsData
    .map((ticket: TicketSelect) => ticket.qr_data)
    .filter((qr): qr is string => qr !== null)
}

// 2. Apartar los asientos vinculándolos al evento real enviado desde el cliente
export async function apartarAsientosEnBD(asientosIds: string[], eventId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, message: 'Usuario no autenticado.' }
  if (!eventId) return { success: false, message: 'Error: No se especificó un ID de evento válido.' }
  if (!user.email) return { success: false, message: 'Error: Tu cuenta de usuario no tiene un email asociado.' }

  const filasAInsertar = asientosIds.map((id) => ({
    buyer_id: user.id,
    email: user.email!,
    qr_data: id,
    event_id: eventId,
    type: 'student',
  }))

  const { error } = await supabase.from('tickets').insert(filasAInsertar)

  if (error) {
    console.error('Error en la inserción de Supabase:', error)
    return { success: false, message: 'No se pudieron guardar los asientos en la base de datos.' }
  }

  return { success: true, message: '¡Lugares reservados y guardados permanentemente!' }
}