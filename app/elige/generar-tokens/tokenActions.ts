'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { CONGRESO_IGE_EVENT_ID, ZONE_UUIDS, getZoneUuid } from '@/config/auditorioConfig'
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
import { normalizeStudentModality } from '@/lib/tickets/modality'
import { resolveUnidadAcademicaId } from '@/lib/tickets/resolveUnidadAcademica'

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
  buyer_id: string | null
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

interface TokenDetailLookupClient {
  from: (table: 'vista_tokens_detalles') => {
    select: (columns: 'id') => {
      ilike: (column: 'email' | 'email_alumno', value: string) => {
        limit: (count: number) => Promise<{ data: Array<{ id: string }> | null; error: DbError | null }>
      }
    }
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
  if (input.estatusPago === 'pagado') {
    return { success: false, message: 'Los tickets pagados deben procesarse desde el flujo transaccional de cobro.' }
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

  let unidadId = isAdmin ? input.unidadAcademicaId ?? null : encargadoUnidad.id
  const nombre = cleanText(input.nombre, 160)
  const email = cleanText(input.email, 180).toLowerCase()

  if (!nombre || !email || !input.zoneId || !input.bloque || !input.fila || !input.numero) {
    return { success: false, message: 'Completa los datos obligatorios del alumno y asiento.' }
  }

  const { data: buyerProfile, error: buyerProfileError } = await supabase
    .from('profiles')
    .select('id')
    .ilike('email', email)
    .maybeSingle()

  if (buyerProfileError) {
    console.error('[createManualSeatTicket] Error al consultar el perfil del alumno:', buyerProfileError.message)
    return { success: false, message: 'No se pudo validar la cuenta del alumno.' }
  }
  if (!buyerProfile) {
    return { success: false, message: 'El alumno debe crear una cuenta antes de registrar su boleto.' }
  }

  if (!unidadId) {
    try {
      unidadId = await resolveUnidadAcademicaId(supabase, buyerProfile.id, email)
    } catch (profileError) {
      console.error('[createManualSeatTicket] Error al resolver Unidad Académica:', profileError)
      return { success: false, message: 'No se pudo validar la Unidad Académica del alumno.' }
    }
  }

  const unidad = unidades.find((item) => item.id === unidadId)
  if (!unidadId || !unidad) {
    return {
      success: false,
      message: isAdmin
        ? 'Selecciona una unidad academica valida.'
        : 'Tu usuario de encargado no tiene una unidad academica asignada.',
    }
  }

  const resolvedZoneId = getZoneUuid(input.zoneId) || getZoneUuid(input.zoneCode) || ZONE_UUIDS[input.zoneCode?.toLowerCase().replace(/[\s_-]/g, '')] || input.zoneId
  const ticketType = 'alumno'

  const ticketData = {
    buyer_id: buyerProfile.id,
    purchase_id: null,
    event_id: CONGRESO_IGE_EVENT_ID,
    zone_id: resolvedZoneId,
    type: ticketType,
    modalidad: ticketType === 'alumno' ? normalizeStudentModality(input.modalidad) : null,
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
    estatus_pago: 'apartado',
    purchased_at: null,
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
    const { data: ticketData, error: ticketError } = await supabase
      .from('tickets')
      .select('buyer_id, email, nombre, modalidad, event_id, zone_id, unidad_academica_id, asiento_zona, asiento_bloque, asiento_fila, asiento_numero, purchase_id')
      .eq('id', ticketId)
      .maybeSingle()

    if (ticketError || !ticketData) {
      console.error('[confirmarPagoTicket] Error al consultar ticket:', ticketError?.message)
      return { success: false, message: 'No se encontró el boleto que se quiere cobrar.' }
    }

    const ticket = ticketData as unknown as {
      buyer_id: string
      email: string
      nombre: string | null
      modalidad: string | null
      event_id: string | null
      zone_id: string | null
      unidad_academica_id: number | null
      asiento_zona: string | null
      asiento_bloque: string | null
      asiento_fila: string | null
      asiento_numero: number | null
      purchase_id: string | null
    }

    if (!ticket.zone_id || !ticket.asiento_zona || !ticket.asiento_bloque || !ticket.asiento_fila || !ticket.asiento_numero) {
      return { success: false, message: 'El boleto no tiene un asiento completo asignado.' }
    }

    if (ticket.purchase_id) {
      const apartado = await getApartadoInfo(ticketId)
      if (!apartado.success || !apartado.info) return apartado
      const result = await liquidarRestoAsiento(ticketId, apartado.info.montoRestante)
      return {
        success: result.success,
        message: result.message,
        tokenCode: result.tokenCode,
      }
    }

    const result = await cobrarAsientoYGenerarToken(
      {
        zoneId: ticket.zone_id,
        zoneCode: ticket.asiento_zona,
        bloque: ticket.asiento_bloque,
        fila: ticket.asiento_fila,
        numero: ticket.asiento_numero,
      },
      PRECIO_POR_BOLETO,
      ticket.nombre ?? undefined,
      ticket.email,
      ticketId,
      'pago',
    )

    return {
      success: result.success,
      message: result.message,
      tokenCode: result.token,
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
      const resolvedZoneId = getZoneUuid(asiento.zoneId) || getZoneUuid(asiento.zoneCode) || asiento.zoneId

      const tokenRow: TokenCanjeInsert = {
        token_code: tokenCode,
        event_id: CONGRESO_IGE_EVENT_ID,
        zone_id: resolvedZoneId,
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
    if (
      !seat?.zoneId ||
      !seat.zoneCode ||
      !seat.bloque ||
      !seat.fila ||
      !Number.isInteger(seat.numero) ||
      seat.numero < 1 ||
      !Number.isFinite(montoRecibido) ||
      montoRecibido <= 0 ||
      montoRecibido > PRECIO_POR_BOLETO
    ) {
      return { success: false, message: 'Los datos del asiento o del pago no son válidos.' }
    }

    let alumnoId: string | null = null
    let alumnoEmail = email?.trim() || null
    let modalidad = normalizeStudentModality(null)

    if (ticketId) {
      const { data: ticket, error: ticketLookupError } = await supabase
        .from('tickets')
        .select('buyer_id, email, modalidad')
        .eq('id', ticketId)
        .maybeSingle()

      if (ticketLookupError) {
        console.error('[cobrarAsientoYGenerarToken] Error al consultar alumno:', ticketLookupError.message)
        return { success: false, message: `No se pudo validar al alumno: ${ticketLookupError.message}` }
      }

      if (ticket) {
        const student = ticket as { buyer_id: string | null; email: string | null; modalidad: string | null }
        alumnoId = student.buyer_id
        alumnoEmail = student.email?.trim() || alumnoEmail
        modalidad = normalizeStudentModality(student.modalidad)
      } else {
        return { success: false, message: 'No se encontró el pre-registro seleccionado.' }
      }
    } else if (alumnoEmail) {
      const { data: ticket, error: ticketLookupError } = await supabase
        .from('tickets')
        .select('buyer_id, email, modalidad')
        .ilike('email', alumnoEmail)
        .limit(1)
        .maybeSingle()

      if (ticketLookupError) {
        console.error('[cobrarAsientoYGenerarToken] Error al buscar alumno por correo:', ticketLookupError.message)
        return { success: false, message: `No se pudo validar el correo del alumno: ${ticketLookupError.message}` }
      }

      if (ticket) {
        const student = ticket as { buyer_id: string | null; email: string | null; modalidad: string | null }
        alumnoId = student.buyer_id
        alumnoEmail = student.email?.trim() || alumnoEmail
        modalidad = normalizeStudentModality(student.modalidad)
      }
    }

    if (!alumnoId && alumnoEmail) {
      const { data: buyerProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email')
        .ilike('email', alumnoEmail)
        .maybeSingle()

      if (profileError) {
        console.error('[cobrarAsientoYGenerarToken] Error al buscar perfil del comprador:', profileError.message)
        return { success: false, message: 'No se pudo validar la cuenta del comprador.' }
      }

      alumnoId = buyerProfile?.id ?? null
      alumnoEmail = buyerProfile?.email?.trim() || alumnoEmail
    }

    if (!alumnoId || !alumnoEmail) {
      return { success: false, message: 'El comprador debe tener una cuenta registrada para emitir el boleto.' }
    }

    let unidadAcademicaId: number | null
    try {
      unidadAcademicaId = await resolveUnidadAcademicaId(supabase, alumnoId, alumnoEmail)
    } catch (profileError) {
      console.error('[cobrarAsientoYGenerarToken] Error al resolver Unidad Académica:', profileError)
      return { success: false, message: 'No se pudo validar la Unidad Académica del comprador.' }
    }

    if (unidadAcademicaId == null) {
      return { success: false, message: 'El comprador debe asignar una Unidad Académica antes de comprar el boleto.' }
    }

    try {
      const detailLookup = supabase as unknown as TokenDetailLookupClient
      const [usedTokenLookup, emailTokenLookup, studentEmailTokenLookup] = await Promise.all([
        alumnoId
          ? supabase.from('tokens_canje').select('id').eq('utilizado_por', alumnoId).maybeSingle()
          : Promise.resolve({ data: null, error: null }),
        alumnoEmail
          ? detailLookup.from('vista_tokens_detalles').select('id').ilike('email', alumnoEmail).limit(1)
          : Promise.resolve({ data: null, error: null }),
        alumnoEmail
          ? detailLookup.from('vista_tokens_detalles').select('id').ilike('email_alumno', alumnoEmail).limit(1)
          : Promise.resolve({ data: null, error: null }),
      ])

      const identityLookupError = usedTokenLookup.error || emailTokenLookup.error || studentEmailTokenLookup.error
      if (identityLookupError) throw identityLookupError

      if (usedTokenLookup.data || emailTokenLookup.data?.length || studentEmailTokenLookup.data?.length) {
        return {
          success: false,
          message: 'Este alumno ya tiene un token asignado. No se generó otro.',
        }
      }
    } catch (validationError: unknown) {
      console.error('[cobrarAsientoYGenerarToken] Error al validar token existente:', validationError)
      return {
        success: false,
        message: 'No se pudo validar si el alumno ya tiene token. Intenta de nuevo.',
      }
    }

    // CORREGIDO: La decisión de 'pago completo' vs 'apartado' ahora se basa explícitamente
    // en la intención del usuario (metodoRegistro) y NO en la comparación del monto,
    // para evitar que un anticipo >= PRECIO_POR_BOLETO se confunda con un pago total.
    const esPagoCompleto = metodoRegistro === 'pago'
    if (esPagoCompleto && montoRecibido < PRECIO_POR_BOLETO) {
      return { success: false, message: `Se requieren $${PRECIO_POR_BOLETO.toFixed(2)} MXN para completar el pago.` }
    }
    if (!esPagoCompleto && (!nombre?.trim() || !email?.trim())) {
      return { success: false, message: 'El nombre y correo son obligatorios para registrar un apartado.' }
    }

    const customClient = supabase as unknown as CustomRpcClient
    const { data: tokenCode, error: rpcError } = await customClient.rpc('generar_codigo_tarjeta_play')
    if (rpcError) {
      console.error('[cobrarAsientoYGenerarToken] Error al generar código RPC:', rpcError.message)
      throw rpcError
    }

    const resolvedZoneId = getZoneUuid(seat.zoneId) || getZoneUuid(seat.zoneCode) || seat.zoneId
    if (!tokenCode) {
      throw new Error('No se pudo generar el código del token.')
    }

    const { error: saleError } = await supabase.rpc('registrar_venta_ticket_token', {
      p_ticket_id: ticketId ?? null,
      p_buyer_id: alumnoId,
      p_event_id: CONGRESO_IGE_EVENT_ID,
      p_zone_id: resolvedZoneId,
      p_unidad_academica_id: unidadAcademicaId,
      p_ticket_type: 'alumno',
      p_ticket_data: {
        nombre: nombre?.trim() || null,
        email: alumnoEmail,
        modalidad,
        asiento_zona: seat.zoneCode,
        asiento_bloque: seat.bloque,
        asiento_fila: seat.fila,
        asiento_numero: seat.numero,
      },
      p_token_code: String(tokenCode),
      p_total: PRECIO_POR_BOLETO,
      p_monto: montoRecibido,
      p_paid: esPagoCompleto,
    })

    if (saleError) {
      console.error('[cobrarAsientoYGenerarToken] Error en la transacción de venta:', saleError.message)
      throw saleError
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
  montoLiquidar: number,
): Promise<ActionResult & { tokenCode?: string }> {
  const supabase = await createClient()
  const { result: permissionResult, user } = await ensureStaffPermissions(supabase)
  if (permissionResult || !user) return permissionResult ?? { success: false, message: 'Usuario no verificado.' }

  if (!Number.isFinite(montoLiquidar) || montoLiquidar <= 0) {
    return { success: false, message: 'El monto a liquidar debe ser mayor que cero.' }
  }

  try {
    const { data: ticketRaw, error: ticketError } = await supabase
      .from('tickets')
      .select('id, buyer_id, event_id, purchase_id, zone_id, email')
      .eq('id', ticketId)
      .maybeSingle()

    if (ticketError || !ticketRaw) {
      console.error('[liquidarRestoAsiento] Error al consultar ticket:', ticketError?.message)
      return { success: false, message: 'No se encontró el boleto pendiente de liquidación.' }
    }

    const ticket = ticketRaw as unknown as {
      id: string
      buyer_id: string
      event_id: string | null
      purchase_id: string | null
      zone_id: string | null
      email: string
    }

    if (!ticket.purchase_id || !ticket.zone_id) {
      return { success: false, message: 'No hay una compra pendiente asociada a este boleto.' }
    }

    let unidadAcademicaId: number | null
    try {
      unidadAcademicaId = await resolveUnidadAcademicaId(supabase, ticket.buyer_id, ticket.email)
    } catch (profileError) {
      console.error('[liquidarRestoAsiento] Error al consultar Unidad Académica:', profileError)
      return { success: false, message: 'No se pudo validar la Unidad Académica del comprador.' }
    }

    if (unidadAcademicaId == null) {
      return { success: false, message: 'El comprador debe asignar una Unidad Académica antes de liquidar el boleto.' }
    }

    const { data, error } = await supabase.rpc('liquidar_ticket_y_token', {
      p_ticket_id: ticket.id,
      p_buyer_id: ticket.buyer_id,
      p_event_id: ticket.event_id ?? CONGRESO_IGE_EVENT_ID,
      p_unidad_academica_id: unidadAcademicaId,
      p_monto: montoLiquidar,
      p_token_code: '',
    })

    if (error) {
      console.error('[liquidarRestoAsiento] Error en la transacción de liquidación:', error.message)
      return { success: false, message: error.message || 'No se pudo liquidar el boleto.' }
    }

    const result = data as { token_code?: string } | null
    revalidateTokenPaths()

    return {
      success: true,
      message: 'Cobro liquidado correctamente.',
      tokenCode: result?.token_code,
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
    .select('id, buyer_id, nombre, email, purchase_id, zone_id, purchases(amount_paid, total, status)')
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

  if (t.purchase_id && t.zone_id && t.buyer_id) {
    const { data: tokenData, error: tokenError } = await supabase
      .from('tokens_canje')
      .select('token_code')
      .eq('event_id', CONGRESO_IGE_EVENT_ID)
      .eq('zone_id', t.zone_id)
      .eq('creado_por', t.buyer_id)
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