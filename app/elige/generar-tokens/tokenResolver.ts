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
  ticket_id?: string | null
  zone_id?: string | null
  cliente_nombre?: string | null
  cliente_correo?: string | null
  matricula?: string | null
  [key: string]: unknown
}

export interface TokenIdentityRow {
  id: string
  utilizado_por: string | null
  creado_por: string | null
}

export interface TicketLookupRow {
  id: string
  nombre: string | null
  email: string | null
  matricula: string | null
  purchase_id?: string | null
  buyer_id?: string | null
  ticket_id?: string | null
}

export interface PurchaseLookupRow {
  id: string
  created_at?: string | null
  amount_paid?: number | string | null
}

export function attachTokenIdentities(
  tokens: RawTokenRow[],
  identities: TokenIdentityRow[],
): RawTokenRow[] {
  const identitiesByTokenId = new Map(identities.map((identity) => [identity.id, identity]))

  return tokens.map((token) => {
    const identity = identitiesByTokenId.get(token.id)
    return identity ? { ...token, ...identity } : token
  })
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
  const ticketsByEmail = new Map<string, TicketLookupRow | null>()
  const ticketsByMatricula = new Map<string, TicketLookupRow | null>()

  const indexUniqueIdentity = (
    index: Map<string, TicketLookupRow | null>,
    key: string | null,
    ticket: TicketLookupRow,
  ) => {
    const normalizedKey = key?.trim().toLowerCase()
    if (!normalizedKey) return

    const existing = index.get(normalizedKey)
    if (existing === undefined) {
      index.set(normalizedKey, ticket)
    } else if (existing?.buyer_id !== ticket.buyer_id) {
      index.set(normalizedKey, null)
    }
  }

  for (const tk of tickets) {
    if (tk.id) ticketsById.set(tk.id, tk)
    if (tk.buyer_id) ticketsByBuyer.set(tk.buyer_id, tk)
    if (tk.purchase_id) ticketsByPurchase.set(tk.purchase_id, tk)
    indexUniqueIdentity(ticketsByEmail, tk.email, tk)
    indexUniqueIdentity(ticketsByMatricula, tk.matricula, tk)
  }

  const purchasesSorted = [...purchases]
    .filter((p) => Boolean(p.created_at))
    .sort((a, b) => new Date(a.created_at!).getTime() - new Date(b.created_at!).getTime())

  const enriched = tokens.map((t): TokenCanje => {
    let resolvedNombre =
      t.cliente_nombre && t.cliente_nombre.trim().toLowerCase() !== 'usuario registrado'
        ? t.cliente_nombre.trim()
        : ''
    let resolvedCorreo = t.cliente_correo ? t.cliente_correo.trim() : ''
    let resolvedMatricula = t.matricula ? t.matricula.trim() : ''

    let matchedTicket: TicketLookupRow | null = null

    if (t.utilizado_por) {
      matchedTicket = ticketsByBuyer.get(t.utilizado_por) ?? null
    }
    if (!matchedTicket && t.ticket_id) {
      matchedTicket = ticketsById.get(t.ticket_id) ?? null
    }
    if (!matchedTicket && t.creado_por) {
      matchedTicket = ticketsByBuyer.get(t.creado_por) ?? null
    }
    if (!matchedTicket && t.created_at) {
      const tTime = new Date(t.created_at).getTime()
      const pMatch = purchasesSorted.find(
        (p) => Math.abs(new Date(p.created_at!).getTime() - tTime) < 5000
      )
      if (pMatch) matchedTicket = ticketsByPurchase.get(pMatch.id) ?? null
    }

    if (matchedTicket) {
      resolvedNombre = resolvedNombre || matchedTicket.nombre?.trim() || ''
      resolvedCorreo = resolvedCorreo || matchedTicket.email?.trim() || ''
      resolvedMatricula = resolvedMatricula || matchedTicket.matricula?.trim() || ''
    }

    const identityTicket =
      (resolvedCorreo ? ticketsByEmail.get(resolvedCorreo.toLowerCase()) : undefined) ??
      (resolvedMatricula ? ticketsByMatricula.get(resolvedMatricula.toLowerCase()) : undefined)

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
      alumno_id: t.utilizado_por || matchedTicket?.buyer_id || identityTicket?.buyer_id || undefined,
    }
  })

  const preferredToken = (candidate: TokenCanje, current: TokenCanje) => {
    const candidateUsed = candidate.status.trim().toUpperCase() === 'USADO'
    const currentUsed = current.status.trim().toUpperCase() === 'USADO'
    if (candidateUsed !== currentUsed) return candidateUsed
    return new Date(candidate.created_at).getTime() > new Date(current.created_at).getTime()
  }
  const identityIdsByAlias = new Map<string, string | null>()

  for (const token of enriched) {
    if (!token.alumno_id) continue

    const aliases = [
      token.matricula?.trim() ? `matricula:${token.matricula.trim().toLowerCase()}` : null,
      token.cliente_correo?.trim() ? `email:${token.cliente_correo.trim().toLowerCase()}` : null,
    ].filter((alias): alias is string => Boolean(alias))

    for (const alias of aliases) {
      const currentId = identityIdsByAlias.get(alias)
      if (currentId === undefined) identityIdsByAlias.set(alias, token.alumno_id)
      else if (currentId !== token.alumno_id) identityIdsByAlias.set(alias, null)
    }
  }

  const uniqueTokens = new Map<string, TokenCanje>()

  for (const token of enriched) {
    const matriculaAlias = token.matricula?.trim()
      ? `matricula:${token.matricula.trim().toLowerCase()}`
      : null
    const emailAlias = token.cliente_correo?.trim()
      ? `email:${token.cliente_correo.trim().toLowerCase()}`
      : null
    const aliases = [matriculaAlias, emailAlias].filter((alias): alias is string => Boolean(alias))
    const aliasedIds = new Set(aliases
      .map((alias) => identityIdsByAlias.get(alias))
      .filter((id): id is string => Boolean(id)))
    const aliasedAlumnoId = aliasedIds.size === 1 ? [...aliasedIds][0] : undefined
    const safeFallbackAlias = aliases.find((alias) => !identityIdsByAlias.has(alias))
    const identity = token.alumno_id
      ? `id:${token.alumno_id}`
      : aliasedAlumnoId
        ? `id:${aliasedAlumnoId}`
        : safeFallbackAlias ?? null

    if (!identity) {
      uniqueTokens.set(`token:${token.id}`, token)
      continue
    }

    const current = uniqueTokens.get(identity)
    if (!current || preferredToken(token, current)) uniqueTokens.set(identity, token)
  }

  return [...uniqueTokens.values()]
}
