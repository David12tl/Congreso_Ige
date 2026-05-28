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

interface DBPurchaseRow {
  id: string
  stripe_session_id: string
  total: number
  status: string
  created_at: string | null
}

export async function activarTokenCompra(tokenSessionId: string): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, message: 'Sesión expirada o no válida.' }
  }

  // FORCE-CAST: Cliente dinámico para evitar bloqueos del linter con tablas no mapeadas
  const typedClient = supabase as unknown as {
    from: (table: string) => {
      select: (columns?: string) => {
        eq: (column: string, value: string) => {
          single: () => Promise<{ data: DBPurchaseRow | null; error: { message: string } | null }>
        }
      }
      update: (values: Record<string, unknown>) => {
        eq: (column: string, value: string) => Promise<{ error: { message: string } | null }>
      }
    }
  }

  // 1. Buscamos la compra en public.purchases
  const { data: purchase, error: pError } = await typedClient
    .from('purchases')
    .select('id, status')
    .eq('stripe_session_id', tokenSessionId)
    .single()

  if (pError || !purchase) {
    return { success: false, message: 'El token o ID de sesión de Stripe no existe.' }
  }

  if (purchase.status !== 'completed') {
    return { success: false, message: 'Esta compra aún no ha sido marcada como completada.' }
  }

  // 2. Vinculamos los tickets correspondientes al usuario actual
  const { error: updateError } = await typedClient
    .from('tickets')
    .update({ buyer_id: user.id })
    .eq('purchase_id', purchase.id)

  if (updateError) {
    return { success: false, message: 'Error al asociar los pases a tu cuenta.' }
  }

  return { success: true, message: '¡Pase reclamado y vinculado exitosamente!' }
}
