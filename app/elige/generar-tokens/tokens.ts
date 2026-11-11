import { createClient } from '@/lib/supabase/client'
import type { TokenCanje } from './TokensTable'
import {
  enriquecerTokensConDetalles,
  attachTokenIdentities,
  RawTokenRow,
  TokenIdentityRow,
  TicketLookupRow,
  PurchaseLookupRow,
} from './tokenResolver'

export { enriquecerTokensConDetalles }
export type { RawTokenRow, TicketLookupRow, PurchaseLookupRow }

/**
 * Consulta los tokens de canje y los enriquece con la información del alumno asignado/comprador
 * tanto para tokens disponibles como para tokens usados.
 */
export async function obtenerTokensConDetalles(): Promise<TokenCanje[]> {
  const supabase = createClient()
  const nombreVista = 'vista_tokens_detalles' as unknown as 'tokens_canje'

  const [tokensRes, tokenIdentitiesRes, ticketsRes, purchasesRes] = await Promise.all([
    supabase
      .from(nombreVista)
      .select('*')
      .order('created_at', { ascending: false }),
    supabase
      .from('tokens_canje')
      .select('id, utilizado_por, creado_por'),
    supabase
      .from('tickets')
      .select('id, nombre, email, matricula, purchase_id, buyer_id'),
    supabase
      .from('purchases')
      .select('id, amount_paid, created_at'),
  ])

  if (tokensRes.error) {
    console.error('Error al obtener los tokens detallados:', tokensRes.error.message)
    return []
  }

  if (tokenIdentitiesRes.error) {
    console.error('Error al obtener la identidad de los tokens:', tokenIdentitiesRes.error.message)
    return []
  }

  const rawTokens = attachTokenIdentities(
    (tokensRes.data as unknown as RawTokenRow[]) || [],
    (tokenIdentitiesRes.data as unknown as TokenIdentityRow[]) || [],
  )
  const tickets = (ticketsRes.data as unknown as TicketLookupRow[]) || []
  const purchases = (purchasesRes.data as unknown as PurchaseLookupRow[]) || []

  return enriquecerTokensConDetalles(rawTokens, tickets, purchases)
}