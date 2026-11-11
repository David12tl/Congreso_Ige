'use server'

import { createClient } from '@/lib/supabase/server'
import { normalizeStudentModality } from '@/lib/tickets/modality'
import { resolveUnidadAcademicaId } from '@/lib/tickets/resolveUnidadAcademica'
import { CONGRESO_IGE_EVENT_ID } from '@/config/auditorioConfig'

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
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) return { success: false, message: 'Usuario no autenticado.' }
  if (eventId !== CONGRESO_IGE_EVENT_ID) return { success: false, message: 'El evento seleccionado no es válido.' }
  const userEmail = user.email
  if (!userEmail) return { success: false, message: 'Error: Tu cuenta de usuario no tiene un email asociado.' }

  let unidadAcademicaId: number | null
  try {
    unidadAcademicaId = await resolveUnidadAcademicaId(supabase, user.id, userEmail)
  } catch (error) {
    console.error('[apartarAsientosEnBD] Error al consultar Unidad Académica:', error)
    return { success: false, message: 'No se pudo validar tu Unidad Académica. Intenta de nuevo.' }
  }

  if (unidadAcademicaId == null) {
    return { success: false, message: 'Selecciona una Unidad Académica antes de apartar tu boleto.' }
  }

  const filasAInsertar = asientosIds.map((id) => ({
    buyer_id: user.id,
    email: userEmail,
    qr_data: id,
    event_id: CONGRESO_IGE_EVENT_ID,
    unidad_academica_id: unidadAcademicaId,
    type: 'student',
    modalidad: normalizeStudentModality(null),
  }))

  const { error } = await supabase.from('tickets').insert(filasAInsertar)

  if (error) {
    console.error('Error en la inserción de Supabase:', error)
    return { success: false, message: 'No se pudieron guardar los asientos en la base de datos.' }
  }

  return { success: true, message: '¡Lugares reservados y guardados permanentemente!' }
}