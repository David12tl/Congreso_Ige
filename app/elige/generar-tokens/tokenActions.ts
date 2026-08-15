'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { CONGRESO_IGE_EVENT_ID } from '@/config/auditorioConfig'
import type { SupabaseClient, User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import type {
  ActionResult,
  AssignmentContext,
  ManualTicketInput,
  UnidadAcademicaOption,
  OccupiedSeat,
} from '@/components/asientos/types'
import { getSeatKey } from '@/config/auditorioConfig'
import { v4 as uuidv4 } from 'uuid'

const PRECIO_POR_BOLETO = 650

export interface ApartadoInfoLocal {
  ticketId: string
  purchaseId: string | null
  totalAbonado: number
  montoRestante: number
  status: string
  total: number
  tokenCode: string | null
  nombre: string | null
  email: string | null
}

interface TicketWithPurchase {
  id: string
  nombre: string | null
  email: string | null
  zone_id: string | null
  purchase_id: string | null
  purchases: {
    amount_paid: number
    total: number
    status: string
  } | null
}

interface ProfileRoleRow {
  id_rol: number
  unidad_academica_id?: number | null
}

interface StaffTicketRow {
  unidad_academica_id?: number | null
  unidad_academica?: string | null
}

interface DbError {
  code?: string
  message: string
}

interface TicketSeatRow {
  id: string
  zone_id: string | null
  asiento_zona: string | null
  asiento_bloque: string | null
  asiento_fila: string | null
  asiento_numero: number | null
  purchase_id: string | null
  buyer_id: string | null
  purchases?: { status: string } | null // Eliminado estatus_pago de aquí
}

interface AssignmentDataClient {
  from: (table: string) => {
    select: (columns: string) => {
      eq: (column: string, value: string | number) => {
        maybeSingle: () => Promise<{ data: ProfileRoleRow | StaffTicketRow | null; error: DbError | null }>
      }
      order: (column: string, options: { ascending: boolean }) => Promise<{
        data: UnidadAcademicaOption[] | null
        error: DbError | null
      }>
    }
    insert: (values: unknown) => Promise<{ error: DbError | null }>
  }
}

interface CustomRpcClient {
  rpc: (fn: string) => Promise<{ data: unknown; error: DbError | null }>
}

// --- Funciones Helper Reutilizables ---

async function ensureStaffPermissions(supabase: SupabaseClient): Promise<{
  result: ActionResult | null
  user: User | null
  profile: ProfileRoleRow | null
}> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { result: { success: false, message: 'Debes iniciar sesión para realizar esta acción.' }, user: null, profile: null }
  }

  const client = supabase as unknown as AssignmentDataClient
  const profile = await getProfileRole(client, user.id)

  if (!profile || (profile.id_rol !== 1 && profile.id_rol !== 2)) {
    return { result: { success: false, message: 'No tienes permisos para realizar esta acción.' }, user, profile: null }
  }
  return { result: null, user, profile }
}

function revalidateTokenPaths() {
  revalidatePath('/elige/generar-tokens')
  revalidatePath('/monitoreo-mapa')
}

// ─── FUNCIONES DE MAPA Y ASIENTOS OCUPADOS ────────────────────────────

export async function getOccupiedSeats(): Promise<OccupiedSeat[]> {
  const supabase = await createClient()

  // CORREGIDO: Se eliminó 'estatus_pago' del select porque rompe la consulta física de SQL
  const { data, error } = await (supabase
    .from('tickets')
    .select('id, zone_id, asiento_zona, asiento_bloque, asiento_fila, asiento_numero, purchase_id, buyer_id, purchases(status)')
    .eq('event_id', CONGRESO_IGE_EVENT_ID) as unknown as Promise<{ data: Record<string, unknown>[] | null; error: DbError | null }>)

  if (error) {
    console.error('[getOccupiedSeats] Error al consultar tickets:', error.message)
    return []
  }

  const rows = (data ?? []) as unknown as TicketSeatRow[]

  return rows
    .filter((ticket): ticket is TicketSeatRow & {
      asiento_zona: string
      zone_id: string
      asiento_bloque: string
      asiento_fila: string
      asiento_numero: number
    } => Boolean(
      ticket.zone_id &&
      ticket.asiento_zona &&
      ticket.asiento_bloque &&
      ticket.asiento_fila &&
      ticket.asiento_numero !== null,
    ))
    .map((ticket) => {
      const pStatus = ticket.purchases?.status
      let estatusPago: OccupiedSeat['estatusPago'] = 'pre-registro'

      // CORREGIDO: Ahora dependemos 100% de la relación estructurada con `purchases` o la existencia de un `purchase_id`
      if (pStatus === 'completed' || ticket.purchase_id) {
        estatusPago = 'pagado'
      } else if (pStatus === 'pending') {
        estatusPago = 'apartado'
      }

      return {
        ticketId: ticket.id,
        zoneCode: ticket.asiento_zona as OccupiedSeat['zoneCode'],
        zoneId: ticket.zone_id,
        bloque: ticket.asiento_bloque,
        fila: ticket.asiento_fila,
        numero: ticket.asiento_numero,
        estatusPago,
        buyerId: ticket.buyer_id ?? undefined,
      }
    })
}

export async function getOccupiedSeatKeys(): Promise<string[]> {
  return (await getOccupiedSeats()).map(getSeatKey)
}

export async function getSeatStatusMap(): Promise<Record<string, string>> {
  const seats = await getOccupiedSeats()
  const map: Record<string, string> = {}
  for (const seat of seats) {
    if (seat.estatusPago) {
      map[getSeatKey(seat)] = seat.estatusPago
    }
  }
  return map
}

// ─── FUNCIONES DE ASIGNACIÓN DE ASIENTOS ────────────────────────────

async function getProfileRole(client: AssignmentDataClient, userId: string): Promise<ProfileRoleRow | null> {
  const primary = await client
    .from('profiles')
    .select('id_rol, unidad_academica_id')
    .eq('id', userId)
    .maybeSingle()

  if (!primary.error) return primary.data as ProfileRoleRow | null

  const fallback = await client
    .from('profiles')
    .select('id_rol')
    .eq('id', userId)
    .maybeSingle()

  if (fallback.error) {
    console.error('[getProfileRole] Error:', fallback.error.message)
    return null
  }

  return fallback.data as ProfileRoleRow | null
}

async function getUnidades(client: AssignmentDataClient): Promise<UnidadAcademicaOption[]> {
  const { data, error } = await client
    .from('unidades_academicas')
    .select('id, nombre, tipo')
    .order('nombre', { ascending: true })

  if (error) {
    console.error('[getUnidades] Error:', error.message)
    return []
  }

  return data ?? []
}

async function resolveEncargadoUnidad(
  client: AssignmentDataClient,
  userId: string,
  profileUnidadId: number | null | undefined,
  unidades: UnidadAcademicaOption[],
): Promise<{ id: number | null; nombre: string | null }> {
  if (profileUnidadId) {
    const unidad = unidades.find((item) => item.id === profileUnidadId)
    return { id: profileUnidadId, nombre: unidad?.nombre ?? null }
  }

  const { data } = await client
    .from('tickets')
    .select('unidad_academica_id, unidad_academica')
    .eq('buyer_id', userId)
    .maybeSingle()

  const ticket = data as StaffTicketRow | null
  if (ticket?.unidad_academica_id) {
    const unidad = unidades.find((item) => item.id === ticket.unidad_academica_id)
    return { id: ticket.unidad_academica_id, nombre: unidad?.nombre ?? ticket.unidad_academica ?? null }
  }

  if (ticket?.unidad_academica) {
    const unidad = unidades.find((item) => item.nombre === ticket.unidad_academica)
    return { id: unidad?.id ?? null, nombre: ticket.unidad_academica }
  }

  return { id: null, nombre: null }
}

export async function getAssignmentContext(): Promise<AssignmentContext | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const client = supabase as unknown as AssignmentDataClient
  const profile = await getProfileRole(client, user.id)

  if (!profile || (profile.id_rol !== 1 && profile.id_rol !== 2)) {
    return null
  }

  const unidades = await getUnidades(client)
  const role = profile.id_rol === 1 ? 'admin' : 'encargado'

  if (role === 'admin') {
    return {
      userId: user.id,
      role,
      unidadAcademicaId: null,
      unidadAcademicaNombre: null,
      unidades,
    }
  }

  const unidad = await resolveEncargadoUnidad(client, user.id, profile.unidad_academica_id, unidades)

  return {
    userId: user.id,
    role,
    unidadAcademicaId: unidad.id,
    unidadAcademicaNombre: unidad.nombre,
    unidades,
  }
}

export async function requireAssignmentContext() {
  const context = await getAssignmentContext()
  if (!context) redirect('/elige')
  return context
}

function cleanText(value: string, maxLength: number) {
  return value.trim().slice(0, maxLength)
}

function getControlledErrorMessage(error: DbError) {
  const normalized = error.message.toLowerCase()

  if (error.code === '23505' || normalized.includes('duplicate') || normalized.includes('unique')) {
    return 'Ese asiento acaba de ser ocupado. Actualiza el mapa o elige otro lugar.'
  }

  if (error.code === '23514' || normalized.includes('available')) {
    return 'La zona seleccionada ya no tiene disponibilidad.'
  }

  return `No se pudo asignar el asiento: ${error.message}`
}

export async function createManualSeatTicket(input: ManualTicketInput): Promise<ActionResult> {
  const supabase = await createClient()
  const { result: permissionResult, user } = await ensureStaffPermissions(supabase)
  if (permissionResult || !user) return permissionResult ?? { success: false, message: 'Usuario inválido.' }

  const client = supabase as unknown as AssignmentDataClient
  const profile = await getProfileRole(client, user.id)

  if (!profile || (profile.id_rol !== 1 && profile.id_rol !== 2)) {
    return { success: false, message: 'No tienes permisos para asignar asientos.' }
  }

  const unidades = await getUnidades(client)
  const isAdmin = profile.id_rol === 1
  const encargadoUnidad = isAdmin
    ? { id: null, nombre: null }
    : await resolveEncargadoUnidad(client, user.id, profile.unidad_academica_id, unidades)

  const unidadId = isAdmin ? input.unidadAcademicaId : encargadoUnidad.id
  const unidad = unidades.find((item) => item.id === unidadId)

  if (!unidadId || !unidad) {
    return {
      success: false,
      message: isAdmin
        ? 'Selecciona una unidad academica valida.'
        : 'Tu usuario de encargado no tiene una unidad academica asignada.',
    }
  }

  const nombre = cleanText(input.nombre, 160)
  const email = cleanText(input.email, 180).toLowerCase()

  if (!nombre || !email || !input.zoneId || !input.bloque || !input.fila || !input.numero) {
    return { success: false, message: 'Completa los datos obligatorios del alumno y asiento.' }
  }

  const ticketData = {
    buyer_id: user.id,
    purchase_id: null,
    event_id: CONGRESO_IGE_EVENT_ID,
    zone_id: input.zoneId,
    type: input.estatusPago === 'pagado' ? (input.matricula ? 'alumno' : 'empresa') : 'alumno',
    nombre,
    email,
    matricula: cleanText(input.matricula, 80) || null,
    carrera: cleanText(input.carrera, 160) || null,
    semestre: cleanText(input.semestre, 30) || null,
    telefono: cleanText(input.telefono, 40) || null,
    unidad_academica_id: unidad.id,
    unidad_academica: unidad.nombre,
    asiento_zona: input.zoneCode,
    asiento_bloque: input.bloque,
    asiento_fila: input.fila,
    asiento_numero: input.numero,
    // NOTA: Si en un futuro la mutación falla por el campo 'estatus_pago' en la tabla 'tickets', 
    // asegúrate de que el campo real de la base de datos no se llame 'status'.
    estatus_pago: input.estatusPago === 'pagado' ? 'pagado' : 'apartado',
    purchased_at: input.estatusPago === 'pagado' ? new Date().toISOString() : null,
  }

  const { error } = await supabase.from('tickets').insert(ticketData as never)

  if (error) {
    console.error('[createManualSeatTicket] Error:', error.message)
    return { success: false, message: getControlledErrorMessage(error) }
  }

  revalidateTokenPaths()
  return { success: true, message: 'Asiento asignado correctamente.' }
}

export async function confirmarPagoTicket(ticketId: string): Promise<ActionResult & { tokenCode?: string }> {
  const supabase = await createClient()
  const { result: permissionResult } = await ensureStaffPermissions(supabase)
  if (permissionResult) return permissionResult

  try {
    const { error } = await supabase
      .from('tickets')
      .update({
        estatus_pago: 'pagado',
        purchased_at: new Date().toISOString(),
      } as never)
      .eq('id', ticketId)

    if (error) {
      console.error('[confirmarPagoTicket] Error al actualizar ticket:', error.message)
      return { success: false, message: `Error al confirmar pago: ${error.message}` }
    }

    const { data: ticketData, error: ticketError } = await supabase
      .from('tickets')
      .select('event_id, zone_id')
      .eq('id', ticketId)
      .maybeSingle()

    if (ticketError) {
      console.error('[confirmarPagoTicket] Error al obtener datos del ticket:', ticketError.message)
      return { success: false, message: `Error al obtener datos del ticket: ${ticketError.message}` }
    }

    let tokenCode: string | undefined
    if (ticketData) {
      const t = ticketData as { event_id: string | null; zone_id: string | null }

      const { data: tokens, error: tokensError } = await supabase
        .from('tokens_canje')
        .select('token_code')
        .eq('event_id', t.event_id ?? '')
        .eq('zone_id', t.zone_id ?? '')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (tokensError) {
        console.error('[confirmarPagoTicket] Error al buscar token:', tokensError.message)
      } else if (tokens) {
        tokenCode = (tokens as { token_code: string }).token_code
      }
    }

    revalidateTokenPaths()

    return {
      success: true,
      message: 'Pago confirmed. El asiento ahora está en verde (confirmado).',
      tokenCode,
    }
  } catch (err: unknown) {
    const errorDetails = err as Error
    console.error('[confirmarPagoTicket] Error general:', errorDetails)
    return { success: false, message: errorDetails.message || 'Ocurrió un error inesperado al confirmar el pago.' }
  }
}

// ─── FUNCIÓN DE GENERACIÓN DE TOKENS MASIVA ──────────────────────────

interface TokenCanjeInsert {
  token_code: string
  event_id: string
  zone_id: string
  creado_por: string
  status: string
  total_abonado: number
  estado_pago: 'sin_pago' | 'faltante' | 'completado'
}

export async function generarTokensMultiples(
  asientos: Array<{
    zoneId: string
    zoneCode: string
    bloque: string
    fila: string
    numero: number
  }>,
  montoTotalRecibido: number,
): Promise<ActionResult & { tokens?: string[] }> {
  const supabase = await createClient()
  const { result: permissionResult, user } = await ensureStaffPermissions(supabase)
  if (permissionResult || !user) return permissionResult ?? { success: false, message: 'Usuario no autenticado.' }

  if (!asientos || asientos.length === 0) {
    return { success: false, message: 'Selecciona al menos un asiento para generar tokens.' }
  }

  const totalEsperado = asientos.length * PRECIO_POR_BOLETO

  if (montoTotalRecibido < totalEsperado) {
    return {
      success: false,
      message: `El monto recibido ($${montoTotalRecibido.toFixed(2)}) es insuficiente. Se requieren $${totalEsperado.toFixed(2)} MXN para ${asientos.length} asiento(s).`,
    }
  }

  try {
    const tokensGenerados: string[] = []

    for (const asiento of asientos) {
      const customClient = supabase as unknown as CustomRpcClient
      const { data: tokenData, error: rpcError } = await customClient.rpc('generar_codigo_tarjeta_play')

      if (rpcError || !tokenData) {
        console.error('[generarTokensMultiples] Error al generar código RPC:', rpcError?.message || 'No se obtuvo código')
        return {
          success: false,
          message: `Error al generar código de token: ${rpcError?.message || 'No se obtuvo código'}`,
        }
      }

      const tokenCode = String(tokenData)
      const abonoIndividual = PRECIO_POR_BOLETO
      const estadoPago: TokenCanjeInsert['estado_pago'] = 'completado'

      const tokenRow: TokenCanjeInsert = {
        token_code: tokenCode,
        event_id: CONGRESO_IGE_EVENT_ID,
        zone_id: asiento.zoneId,
        creado_por: user.id,
        status: 'disponible',
        total_abonado: abonoIndividual,
        estado_pago: estadoPago,
      }

      const { error: insertError } = await supabase.from('tokens_canje').insert(tokenRow as never)

      if (insertError) {
        console.error('[generarTokensMultiples] Error al insertar token:', insertError.message)
        return {
          success: false,
          message: `Error al registrar token en base de datos: ${insertError.message}`,
        }
      }

      tokensGenerados.push(tokenCode)
    }

    revalidateTokenPaths()

    return {
      success: true,
      message: `${tokensGenerados.length} token(s) generados exitosamente.`,
      tokens: tokensGenerados,
    }
  } catch (err: unknown) {
    const errorDetails = err as Error
    console.error('[generarTokensMultiples] Error general:', errorDetails)
    return { success: false, message: 'Ocurrió un error inesperado al generar los tokens.' }
  }
}

export async function cobrarAsientoYGenerarToken(
  seat: {
    zoneId: string
    zoneCode: string
    bloque: string
    fila: string
    numero: number
  },
  montoRecibido: number,
  nombre?: string,
  email?: string,
  ticketId?: string,
  metodoRegistro: 'pago' | 'apartado' = 'pago',
): Promise<ActionResult & { token?: string }> {
  const supabase = await createClient()
  const { result: permissionResult, user } = await ensureStaffPermissions(supabase)
  if (permissionResult || !user) return permissionResult ?? { success: false, message: 'Usuario no verificado.' }

  try {
    // CORREGIDO: La decisión de 'pago completo' vs 'apartado' ahora se basa explícitamente
    // en la intención del usuario (metodoRegistro) y NO en la comparación del monto,
    // para evitar que un anticipo >= PRECIO_POR_BOLETO se confunda con un pago total.
    const esPagoCompleto = metodoRegistro === 'pago'
    const statusCompra = esPagoCompleto ? 'completed' : 'pending'

    if (!esPagoCompleto && (!nombre?.trim() || !email?.trim())) {
      return { success: false, message: 'El nombre y correo son obligatorios para registrar un apartado.' }
    }

    const customClient = supabase as unknown as CustomRpcClient
    const { data: tokenCode, error: rpcError } = await customClient.rpc('generar_codigo_tarjeta_play')
    if (rpcError) {
      console.error('[cobrarAsientoYGenerarToken] Error al generar código RPC:', rpcError.message)
      throw rpcError
    }

    const purchaseId = uuidv4()
    const purchasePayload = {
      id: purchaseId,
      total: PRECIO_POR_BOLETO,
      amount_paid: montoRecibido,
      status: statusCompra,
    }

    const { error: purchaseError } = await supabase.from('purchases').insert(purchasePayload as never)

    if (purchaseError) {
      console.error('[cobrarAsientoYGenerarToken] Error al insertar purchase:', purchaseError.message)
      throw purchaseError
    }

    // Si se recibió un ticketId, significa que viene de un pre-registro.
    // ACTUALIZAMOS el ticket existente para preservar sus datos originales (matrícula, carrera, semestre, etc.)
    // y solo agregamos la información del asiento y de la compra.
    if (ticketId) {
      const ticketUpdatePayload = {
        zone_id: seat.zoneId,
        asiento_zona: seat.zoneCode,
        asiento_bloque: seat.bloque,
        asiento_fila: seat.fila,
        asiento_numero: seat.numero,
        purchase_id: purchaseId,
        type: 'alumno',
        // NOTA: Si este update falla en runtime, revisa si el campo en DB se llama 'status' en lugar de 'estatus_pago'
        estatus_pago: esPagoCompleto ? 'pagado' : 'apartado',
        purchased_at: esPagoCompleto ? new Date().toISOString() : null,
      }

      const { error: ticketError } = await supabase
        .from('tickets')
        .update(ticketUpdatePayload as never)
        .eq('id', ticketId)

      if (ticketError) {
        console.error('[cobrarAsientoYGenerarToken] Error al actualizar ticket pre-registrado:', ticketError.message)
        throw ticketError
      }
    } else {
      // Si NO hay ticketId, es una venta desde cero: creamos un nuevo ticket.
      const ticketPayload = {
        id: uuidv4(),
        event_id: CONGRESO_IGE_EVENT_ID,
        zone_id: seat.zoneId,
        asiento_zona: seat.zoneCode,
        asiento_bloque: seat.bloque,
        asiento_fila: seat.fila,
        asiento_numero: seat.numero,
        purchase_id: purchaseId,
        type: 'alumno', // Ajustado con el valor permitido por el CHECK constraint de la tabla 'tickets'
        nombre: nombre?.trim() || null,
        email: email?.trim() || null,
        // NOTA: Si este insert falla en runtime, revisa si el campo en DB se llama 'status' en lugar de 'estatus_pago'
        estatus_pago: esPagoCompleto ? 'pagado' : 'apartado',
        purchased_at: esPagoCompleto ? new Date().toISOString() : null,
      }

      const { error: ticketError } = await supabase.from('tickets').insert(ticketPayload as never)

      if (ticketError) {
        console.error('[cobrarAsientoYGenerarToken] Error al insertar ticket:', ticketError.message)
        throw ticketError
      }
    }

    const tokenPayload = {
      token_code: String(tokenCode),
      event_id: CONGRESO_IGE_EVENT_ID,
      zone_id: seat.zoneId,
      creado_por: user.id,
      status: 'disponible',
      total_abonado: montoRecibido,
      estado_pago: esPagoCompleto ? 'completado' : 'faltante',
    }

    const { error: tokenInsertError } = await supabase.from('tokens_canje').insert(tokenPayload as never)

    if (tokenInsertError) {
      console.error('[cobrarAsientoYGenerarToken] Error al insertar token_canje:', tokenInsertError.message)
      throw tokenInsertError
    }

    revalidateTokenPaths()

    return {
      success: true,
      message: esPagoCompleto ? 'Pago liquidado y token generado.' : 'Apartado registrado exitosamente.',
      token: String(tokenCode),
    }
  } catch (err: unknown) {
    const errorDetails = err as Error
    console.error('[cobrarAsientoYGenerarToken] Error general:', errorDetails)
    return { success: false, message: errorDetails.message || 'Error inesperado al procesar el cobro.' }
  }
}

export async function liquidarRestoAsiento(
  ticketId: string,
  montoRecibido: number,
): Promise<ActionResult & { token?: string; tokenCode?: string }> {
  const supabase = await createClient()
  const { result: permissionResult } = await ensureStaffPermissions(supabase)
  if (permissionResult) return permissionResult

  try {
    const { data: ticket, error: tErr } = await supabase
      .from('tickets')
      .select('purchase_id, zone_id')
      .eq('id', ticketId)
      .single()

    if (tErr || !ticket?.purchase_id) {
      console.error('[liquidarRestoAsiento] Error al obtener ticket o purchase_id:', tErr?.message)
      throw new Error('No se pudo encontrar la compra vinculada a este asiento.')
    }

    const { data: purchase, error: pErr } = await (supabase
      .from('purchases')
      .select('amount_paid, total')
      .eq('id', ticket.purchase_id)
      .single() as unknown as Promise<{ data: Record<string, unknown> | null; error: DbError | null }>)

    if (pErr) {
      console.error('[liquidarRestoAsiento] Error al obtener purchase:', pErr.message)
      throw pErr
    }

    const currentPurchase = purchase as unknown as { amount_paid: number | null; total: number | null }
    const montoPrevio = currentPurchase.amount_paid || 0
    const nuevoTotalPagado = montoPrevio + montoRecibido
    const totalEsperadoBoleto = currentPurchase.total || PRECIO_POR_BOLETO
    const esPagoCompleto = nuevoTotalPagado >= totalEsperadoBoleto

    const updatePurchasePayload = {
      amount_paid: nuevoTotalPagado,
      status: esPagoCompleto ? 'completed' : 'pending'
    }

    const { error: upErr } = await supabase
      .from('purchases')
      .update(updatePurchasePayload as never)
      .eq('id', ticket.purchase_id)

    if (upErr) {
      console.error('[liquidarRestoAsiento] Error al actualizar purchase:', upErr.message)
      throw upErr
    }

    if (esPagoCompleto) {
      const updateTicketPayload = { estatus_pago: 'pagado', purchased_at: new Date().toISOString() }
      
      const { error: ticketUpdateError } = await supabase
        .from('tickets')
        .update(updateTicketPayload as never)
        .eq('id', ticketId)

      if (ticketUpdateError) {
        console.error('[liquidarRestoAsiento] Error al actualizar ticket a pagado:', ticketUpdateError.message)
        throw ticketUpdateError
      }

      const updateTokenPayload = { estado_pago: 'completado' }
      
      const { error: tokenUpdateError } = await supabase
        .from('tokens_canje')
        .update(updateTokenPayload as never)
        .eq('zone_id', ticket.zone_id ?? '')
        .order('created_at', { ascending: false })
        .limit(1)

      if (tokenUpdateError) {
        console.warn('[liquidarRestoAsiento] Advertencia: Error al actualizar estado de token_canje:', tokenUpdateError.message)
      }
    }

    const { data: token, error: tokenFetchError } = await supabase
      .from('tokens_canje')
      .select('token_code')
      .eq('zone_id', ticket.zone_id ?? '')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (tokenFetchError) {
      console.error('[liquidarRestoAsiento] Error al buscar token:', tokenFetchError.message)
    }

    revalidateTokenPaths()

    return {
      success: true,
      message: 'Cobro liquidado correctamente.',
      token: (token as { token_code: string } | null)?.token_code
    }
  } catch (err: unknown) {
    const errorDetails = err as Error
    console.error('[liquidarRestoAsiento] Error general:', errorDetails)
    return { success: false, message: errorDetails.message || 'Ocurrió un error al liquidar el pago.' }
  }
}

export async function getApartadoInfo(ticketId: string): Promise<ActionResult & { info?: ApartadoInfoLocal }> {
  const supabase = await createClient()

  const { data: ticket, error } = await (supabase
    .from('tickets')
    .select('id, nombre, email, purchase_id, zone_id, purchases(amount_paid, total, status)')
    .eq('id', ticketId)
    .maybeSingle() as unknown as Promise<{ data: Record<string, unknown> | null; error: DbError | null }>)

  if (error) {
    console.error('[getApartadoInfo] Error al obtener información del ticket:', error.message)
    return { success: false, message: 'Error al obtener información del apartado.' }
  }
  if (!ticket) {
    return { success: false, message: 'No se encontró información del apartado.' }
  }

  const t = ticket as unknown as TicketWithPurchase
  const p = t.purchases
  const totalAbonado = p?.amount_paid || 0
  const total = p?.total || PRECIO_POR_BOLETO

  let tokenCode: string | null = null

  if (t.purchase_id && t.zone_id) {
    const { data: tokenData, error: tokenError } = await supabase
      .from('tokens_canje')
      .select('token_code')
      .eq('event_id', CONGRESO_IGE_EVENT_ID)
      .eq('zone_id', t.zone_id!) // CORRECCIÓN: Usamos '!' para asegurar a TypeScript que t.zone_id no es nulo aquí.
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (tokenError) {
      console.error('[getApartadoInfo] Error al buscar token:', tokenError.message)
    } else if (tokenData) {
      tokenCode = (tokenData as { token_code: string }).token_code
    }
  }

  return {
    success: true,
    message: 'Ok',
    info: {
      ticketId: t.id,
      purchaseId: t.purchase_id,
      totalAbonado,
      montoRestante: Math.max(0, total - totalAbonado),
      status: p?.status || 'pendiente',
      total,
      tokenCode,
      nombre: t.nombre,
      email: t.email,
    },
  }
}