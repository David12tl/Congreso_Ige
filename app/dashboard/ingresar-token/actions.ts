'use server'

import { createClient } from '@/src/lib/supabase/server'

export interface TicketAsistente {
  id: string
  eventName: string
  zoneName: string  
  nombre: string | null
  email: string
  qrData: string
  type: 'alumno' | 'empresa'
}

// Interfaces estrictas para evitar que TypeScript infiera "never"
interface DBProfileRow {
  id: string
  id_rol: number
  email: string | null
  created_at: string | null
}

interface DBPurchaseRow {
  id: string
  stripe_session_id: string
  total: number
  status: string
  created_at: string | null
}

interface DBTicketRow {
  id: string
  event_id: string
  zone_id: string
  purchase_id: string | null
  buyer_id: string
  type: string
  nombre: string | null
  email: string
  qr_data: string
}

export interface InfoAsientoCanjeado {
  id: string
  asientoReal: string | null
}

export async function activarTokenCompra(tokenSessionId: string): Promise<{ 
  success: boolean; 
  message: string; 
  asientos?: InfoAsientoCanjeado[] 
}> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, message: 'Sesión expirada o no válida.' }
  }

  // FORCE-CAST: Forzamos un cliente genérico temporal para que acepte la tabla 'purchases' y sus columnas
  const typedClient = supabase as unknown as {
    from: (table: string) => {
      select: (columns?: string) => {
        eq: (column: string, value: string) => {
          single: () => Promise<{ data: DBPurchaseRow | null; error: { message: string } | null }>
          maybeSingle: () => Promise<{ data: DBPurchaseRow | null; error: { message: string } | null }>
        }
      }
      update: (values: Record<string, unknown>) => {
        eq: (column: string, value: string) => Promise<{ error: { message: string } | null }>
      }
    }
  }

  // 1. Buscamos la compra en public.purchases usando el cliente forzado
  const { data: purchase, error: pError } = await typedClient
    .from('purchases')
    .select('id, status')
    .eq('stripe_session_id', tokenSessionId)
    .maybeSingle()

  if (pError || !purchase) {
    return { success: false, message: 'El token ingresado no existe o es inválido.' }
  }

  // 🌟 MODIFICADO: Mensaje mucho más claro y descriptivo para el cliente en puerta
  if (purchase.status !== 'completed') {
    return { 
      success: false, 
      message: 'El token no puede ser canjeado hasta que liquides el total del boleto.' 
    }
  }

  // 2. Comprobamos si el token ya fue reclamado previamente en tokens_canje
  const { data: tokenCanje } = await typedClient
    .from('tokens_canje')
    .select('status, zone_id')
    .eq('token_code', tokenSessionId)
    .maybeSingle()

  if (tokenCanje && tokenCanje.status === 'usado') {
    return { success: false, message: 'Este token ya fue utilizado y no puede ser canjeado de nuevo.' }
  }

  // 2. Vinculamos los tickets que tengan este purchase_id al ID del usuario logueado
  // Usamos el cliente dinámico para evitar errores de mapeo en columnas de 'tickets'
  const { error: updateError } = await typedClient
    .from('tickets')
    .update({ buyer_id: user.id })
    .eq('purchase_id', purchase.id)

  if (updateError) {
    return { success: false, message: 'Error al asociar los pases a tu cuenta.' }
  }

  return { success: true, message: '¡Pase reclamado y vinculado exitosamente!' }
}
