'use server'

import { createClient } from '@/src/lib/supabase/server'

// 1. Obtener asientos ocupados filtrando por el evento actual
export async function obtenerAsientosOcupados(seccion: string) {
  const supabase = await createClient()

  const { data: tickets, error } = await (supabase as any)
    .from('tickets')
    .select('qr_data') 
    .eq('status', 'ocupado') 

  if (error) {
    console.error('Error al obtener asientos:', error)
    return []
  }

  // Retorna un arreglo plano de strings: ["Platea Central-A-3", "Platea Central-A-4"]
  return (tickets || []).map((t: any) => t.qr_data).filter(Boolean)
}

// 2. Apartar los asientos vinculándolos al evento real enviado desde el cliente
export async function apartarAsientosEnBD(asientosIds: string[], eventId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, message: 'Usuario no autenticado.' }
  if (!eventId) return { success: false, message: 'Error: No se especificó un ID de evento válido.' }

  const filasAInsertar = asientosIds.map((id) => ({
    buyer_id: user.id,
    qr_data: id,          // Guarda la nomenclatura estructurada (ej. "Platea Central-A-5")
    status: 'ocupado',    
    event_id: eventId,    // 🌟 Vinculación dinámica obligatoria con la tabla de eventos
    created_at: new Date().toISOString()
  }))

  const { error } = await (supabase as any)
    .from('tickets') 
    .insert(filasAInsertar)

  if (error) {
    console.error('Error en la inserción de Supabase:', error)
    return { success: false, message: 'No se pudieron guardar los asientos en la base de datos.' }
  }

  return { success: true, message: '¡Lugares reservados y guardados permanentemente!' }
}