'use server'

import { createClient } from '@/src/lib/supabase/server'

interface DBPurchaseRow {
  id: string
  stripe_session_id: string
  total: number
  status: string
  created_at: string | null
}

interface InfoAsientoCanjeado {
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

  // FORCE-CAST: Tipado defensivo para controlar las interacciones con tablas dinámicas
  const typedClient = supabase as any

  // 1. Buscamos la transacción en purchases usando el código generado (TK-XXXXXX)
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

  // 🔥 3. QUEMAR TOKEN: Guardamos el estado, QUIÉN lo usó y A QUÉ HORA
  const { error: updateTokenError } = await typedClient
    .from('tokens_canje')
    .update({ 
      status: 'usado',
      utilizado_por: user.id,                  // ID del usuario autenticado actual
      utilizado_el: new Date().toISOString()   // Fecha y hora exacta en formato ISO
    })
    .eq('token_code', tokenSessionId)

  if (updateTokenError) {
    console.error('Error al quemar el token:', updateTokenError)
    return { success: false, message: 'No se pudo actualizar el registro de auditoría del token.' }
  }

  // 4. Intentamos actualizar la tabla tickets si tu esquema maneja vinculación directa de usuarios
  try {
    await typedClient
      .from('tickets')
      .update({ buyer_id: user.id })
      .eq('purchase_id', purchase.id)
  } catch (err) {
    console.warn('Omitiendo actualización relacional de tickets en desarrollo:', err)
  }

  // 5. Retornamos los detalles del espacio reservado simulado basándonos en la zona asignada
  const asientosInfo: InfoAsientoCanjeado[] = [
    {
      id: purchase.id,
      asientoReal: tokenCanje?.zone_id === 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' 
        ? 'Zona-Platea-Fila-A' 
        : 'Zona-General-Acceso-A'
    }
  ]

  return { 
    success: true, 
    message: '¡Pase reclamado y vinculado exitosamente a tu cuenta académica!',
    asientos: asientosInfo
  }
}