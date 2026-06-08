'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { CONGRESO_IGE_EVENT_ID } from '@/src/config/auditorioConfig'
import { createClient } from '@/src/lib/supabase/server'
import type {
  ActionResult,
  AssignmentContext,
  ManualTicketInput,
  UnidadAcademicaOption,
  OccupiedSeat,
} from '@/src/components/asientos/types'
import { getSeatKey } from '@/src/config/auditorioConfig'

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

interface DbClientBasico {
  from: (table: string) => {
    select: (columns: string) => {
      eq: (column: string, value: string) => {
        single: () => Promise<{ data: Record<string, unknown> | null; error: { message: string } | null }>
        maybeSingle: () => Promise<{ data: Record<string, unknown> | null; error: { message: string } | null }>
      }
    }
    update: (values: Record<string, unknown>) => {
      eq: (column: string, value: string) => Promise<{ error: DbError | null }>
    }
  }
}

interface DbClientConOrder {
  from: (table: string) => {
    select: (columns: string) => {
      eq: (column: string, value: string) => {
        order: (column: string, options: { ascending: boolean }) => Promise<{
          data: Record<string, unknown>[] | null
          error: { message: string } | null
        }>
      }
    }
  }
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
    insert: (values: Record<string, unknown>) => Promise<{ error: DbError | null }>
  }
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
}

interface TicketsSeatClient {
  from: (table: 'tickets') => {
    select: (columns: string) => {
      eq: (column: string, value: string) => Promise<{
        data: TicketSeatRow[] | null
        error: { message: string } | null
      }>
    }
  }
}

// ─── FUNCIONES DE MAPA Y ASIENTOS OCUPADOS ────────────────────────────

export async function getOccupiedSeats(): Promise<OccupiedSeat[]> {
  const supabase = await createClient()
  const client = supabase as unknown as TicketsSeatClient

  const { data, error } = await client
    .from('tickets')
    .select('id, zone_id, asiento_zona, asiento_bloque, asiento_fila, asiento_numero, purchase_id, buyer_id')
    .eq('event_id', CONGRESO_IGE_EVENT_ID)

  if (error) {
    console.error('[getOccupiedSeats] Error al consultar tickets:', error.message)
    return []
  }

  return (data ?? [])
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
      ticket.asiento_numero,
    ))
    .map((ticket) => {
      const estatusPago: OccupiedSeat['estatusPago'] = ticket.purchase_id ? 'pagado' : 'pre-registro'
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
  if (!context) redirect('/dashboard')
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
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: 'Debes iniciar sesion para asignar asientos.' }
  }

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

  const ticket: Record<string, unknown> = {
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
    estatus_pago: input.estatusPago ?? 'pagado',
    purchased_at: input.estatusPago === 'pagado' ? new Date().toISOString() : null,
  }

  const { error } = await client.from('tickets').insert(ticket)

  if (error) {
    console.error('[createManualSeatTicket] Error:', error.message)
    return { success: false, message: getControlledErrorMessage(error) }
  }

  revalidatePath('/monitoreo-mapa')
  revalidatePath('/dashboard/generar-tokens')

  return { success: true, message: 'Asiento asignado correctamente.' }
}

export async function confirmarPagoTicket(ticketId: string): Promise<ActionResult & { tokenCode?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: 'Debes iniciar sesión para confirmar pagos.' }
  }

  const client = supabase as unknown as DbClientBasico

  const { error } = await client
    .from('tickets')
    .update({
      estatus_pago: 'pagado',
      purchased_at: new Date().toISOString(),
    })
    .eq('id', ticketId)

  if (error) {
    console.error('[confirmarPagoTicket] Error:', error.message)
    return { success: false, message: `Error al confirmar pago: ${error.message}` }
  }

  const { data: ticketData, error: ticketError } = await client
    .from('tickets')
    .select('event_id, zone_id')
    .eq('id', ticketId)
    .single()

  if (!ticketError && ticketData) {
    const t = ticketData as { event_id: string | null; zone_id: string | null }

    const tokenClient = supabase as unknown as DbClientConOrder
    const { data: tokens } = await tokenClient
      .from('tokens_canje')
      .select('token_code')
      .eq('event_id', t.event_id ?? '')
      .order('created_at', { ascending: false })

    if (tokens && tokens.length > 0) {
      const tokenRow = tokens[0] as { token_code: string }
      revalidatePath('/monitoreo-mapa')
      revalidatePath('/dashboard/generar-tokens')
      return {
        success: true,
        message: 'Pago confirmado. El asiento ahora está en verde (confirmado).',
        tokenCode: tokenRow.token_code,
      }
    }
  }

  revalidatePath('/monitoreo-mapa')
  revalidatePath('/dashboard/generar-tokens')

  return { success: true, message: 'Pago confirmado. El asiento ahora está en verde (confirmado).' }
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

/**
 * Genera tokens para múltiples asientos cobrados usando la función de base de datos
 * `public.generar_codigo_tarjeta_play()` para cada token.
 */
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
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: 'Debes iniciar sesión para generar tokens.' }
  }

  if (!asientos || asientos.length === 0) {
    return { success: false, message: 'Selecciona al menos un asiento para generar tokens.' }
  }

  const PRECIO_POR_BOLETO = 650
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
      // 1. Llamar a la función de base de datos para generar código de 8 dígitos
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: tokenData, error: tokenError } = await (supabase as any).rpc('generar_codigo_tarjeta_play')

      if (tokenError || !tokenData) {
        console.error('[generarTokensMultiples] Error al generar código:', tokenError)
        return {
          success: false,
          message: `Error al generar código de token: ${tokenError?.message || 'No se obtuvo código'}`,
        }
      }

      const tokenCode = String(tokenData)

      // 2. Calcular abono individual
      const abonoIndividual = PRECIO_POR_BOLETO
      const estadoPago: TokenCanjeInsert['estado_pago'] = montoTotalRecibido >= totalEsperado ? 'completado' : 'completado'

      // 3. Insertar en tokens_canje
      const tokenRow: TokenCanjeInsert = {
        token_code: tokenCode,
        event_id: CONGRESO_IGE_EVENT_ID,
        zone_id: asiento.zoneId,
        creado_por: user.id,
        status: 'disponible',
        total_abonado: abonoIndividual,
        estado_pago: estadoPago,
      }

      const { error: insertError } = await supabase
        .from('tokens_canje')
        .insert(tokenRow)

      if (insertError) {
        console.error('[generarTokensMultiples] Error al insertar token:', insertError)
        return {
          success: false,
          message: `Error al registrar token en base de datos: ${insertError.message}`,
        }
      }

      tokensGenerados.push(tokenCode)
    }

    revalidatePath('/monitoreo-mapa')
    revalidatePath('/dashboard/generar-tokens')

    return {
      success: true,
      message: `${tokensGenerados.length} token(s) generados exitosamente.`,
      tokens: tokensGenerados,
    }
  } catch (err) {
    console.error('[generarTokensMultiples] Error general:', err)
    return { success: false, message: 'Ocurrió un error inesperado al generar los tokens.' }
  }
}