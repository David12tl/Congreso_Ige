import type { TokenCanje } from './TokensTable'

export interface RawTokenRow {
  id: string
  token_code: string
  status: string
  estado_pago?: string | null
  total_abonado?: number | string | null
  created_at: string
  utilizado_el?: string | null
  utilizado_por?: string | null
  creado_por?: string | null
  zone_id?: string | null
  ticket_id?: string | null
  cliente_nombre?: string | null
  cliente_correo?: string | null
  matricula?: string | null
  [key: string]: unknown
}

export interface TicketLookupRow {
  id: string
  nombre: string | null
  email: string | null
  matricula: string | null
  purchase_id?: string | null
  buyer_id?: string | null
}

export interface PurchaseLookupRow {
  id: string
  created_at?: string | null
  amount_paid?: number | string | null
}

/**
 * Enriquece la lista de tokens resolviendo el nombre, correo y matrícula del alumno
 * mediante una cadena de fallback prioritaria:
 * 1. Datos ya resueltos en la vista (si no son genéricos como 'Usuario Registrado').
 * 2. Usuario que ya canjeó el token (utilizado_por -> tickets.buyer_id).
 * 3. Relación directa por ticket_id (si existiera en la fila del token).
 * 4. Creador del token asociado al buyer_id (p. ej. pases especiales o docentes).
 * 5. Correlación de compra/ticket dentro de una ventana temporal cercana (< 5s).
 * Fallback final: 'Sin asignar' para el nombre y cadena vacía para correo y matrícula.
 */
export function enriquecerTokensConDetalles(
  tokens: RawTokenRow[],
  tickets: TicketLookupRow[],
  purchases: PurchaseLookupRow[]
): TokenCanje[] {
  const ticketsByBuyer = new Map<string, TicketLookupRow>()
  const ticketsByPurchase = new Map<string, TicketLookupRow>()
  const ticketsById = new Map<string, TicketLookupRow>()

  for (const tk of tickets) {
    if (tk.id) ticketsById.set(tk.id, tk)
    if (tk.buyer_id) ticketsByBuyer.set(tk.buyer_id, tk)
    if (tk.purchase_id) ticketsByPurchase.set(tk.purchase_id, tk)
  }

  const purchasesSorted = [...purchases]
    .filter((p) => Boolean(p.created_at))
    .sort((a, b) => new Date(a.created_at!).getTime() - new Date(b.created_at!).getTime())

  return tokens.map((t): TokenCanje => {
    let resolvedNombre =
      t.cliente_nombre && t.cliente_nombre.trim().toLowerCase() !== 'usuario registrado'
        ? t.cliente_nombre.trim()
        : ''
    let resolvedCorreo = t.cliente_correo ? t.cliente_correo.trim() : ''
    let resolvedMatricula = t.matricula ? t.matricula.trim() : ''

    // Si aún no tenemos los datos completos del alumno (ej. token en status disponible)
    if (!resolvedNombre || !resolvedCorreo) {
      let matchedTicket: TicketLookupRow | null = null

      // 1. Prioridad: usuario que ya canjeó el token
      if (t.utilizado_por && ticketsByBuyer.has(t.utilizado_por)) {
        matchedTicket = ticketsByBuyer.get(t.utilizado_por) || null
      }
      // 2. Prioridad: relación directa por ticket_id si estuviera presente
      else if (t.ticket_id && ticketsById.has(t.ticket_id)) {
        matchedTicket = ticketsById.get(t.ticket_id) || null
      }
      // 3. Prioridad: creado_por asociado al buyer_id (ej. tokens de docentes)
      else if (t.creado_por && ticketsByBuyer.has(t.creado_por)) {
        matchedTicket = ticketsByBuyer.get(t.creado_por) || null
      }
      // 4. Prioridad: correlación temporal con purchase_id del alumno comprador
      else if (t.created_at) {
        const tTime = new Date(t.created_at).getTime()
        const pMatch = purchasesSorted.find(
          (p) => Math.abs(new Date(p.created_at!).getTime() - tTime) < 5000
        )
        if (pMatch && ticketsByPurchase.has(pMatch.id)) {
          matchedTicket = ticketsByPurchase.get(pMatch.id) || null
        }
      }

      if (matchedTicket) {
        resolvedNombre = resolvedNombre || matchedTicket.nombre?.trim() || ''
        resolvedCorreo = resolvedCorreo || matchedTicket.email?.trim() || ''
        resolvedMatricula = resolvedMatricula || matchedTicket.matricula?.trim() || ''
      }
    }

    return {
      id: t.id,
      token_code: t.token_code,
      status: t.status,
      estado_pago: (t.estado_pago as string) || 'faltante',
      total_abonado: t.total_abonado ?? 0,
      created_at: t.created_at,
      utilizado_el: t.utilizado_el,
      cliente_nombre: resolvedNombre || 'Sin asignar',
      cliente_correo: resolvedCorreo || '',
      matricula: resolvedMatricula || '',
    }
  })
}

