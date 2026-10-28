'use server'

import { createClient } from '@/lib/supabase/client'
import { revalidatePath } from 'next/cache'

export async function obtenerComprobantesPorUsuario(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('comprobantes_pago')
    .select(`
      id,
      matricula,
      file_url,
      file_path,
      estado,
      created_at,
      profile_id
    `)
    .eq('profile_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error al obtener comprobantes:', error)
    return []
  }

  return data
}

export async function cambiarEstadoComprobante(
  comprobanteId: string, 
  nuevoEstado: 'aprobado' | 'rechazado',
  userId: string
) {
  const supabase = await createClient()

  // 1. Actualizar el estado del comprobante
  const { error } = await supabase
    .from('comprobantes_pago')
    .update({ estado: nuevoEstado })
    .eq('id', comprobanteId)

  if (error) {
    return { success: false, message: 'No se pudo actualizar el estado.' }
  }

  // 2. Si es aprobado, marcar su token_canje como completado
  if (nuevoEstado === 'aprobado') {
    await supabase
      .from('tokens_canje')
      .update({ estado_pago: 'completado' })
      .eq('utilizado_por', userId)
  }

  revalidatePath(`/admin/usuarios_ua/${userId}`)
  return { success: true }
}