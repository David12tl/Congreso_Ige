'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseAdminClient, type User } from '@supabase/supabase-js'
import { CONGRESO_IGE_EVENT_ID } from '@/config/auditorioConfig'
import * as tokenActions from './tokenActions'
import type { TicketSelectResponse } from './types'

const PRE_REGISTRO_PAGE_SIZE = 1000
const PRE_REGISTRO_STATUSES = new Set(['pre-registro', 'pending'])

interface PaginatedRows {
  data: Record<string, unknown>[] | null
  error: { message: string } | null
}

interface PaginatedQuery extends PromiseLike<PaginatedRows> {
  is(column: string, value: null): PaginatedQuery
  or(filters: string): PaginatedQuery
  order(column: string, options?: { ascending?: boolean }): PaginatedQuery
  range(from: number, to: number): PromiseLike<PaginatedRows>
}

interface AdminDataClient {
  from(table: 'profiles' | 'tickets'): {
    select(columns?: string): PaginatedQuery
  }
}

export type ObtenerPreRegistrosResult =
  | { success: true; usuarios: TicketSelectResponse[] }
  | { success: false; message: string }

function texto(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

function correoNormalizado(value: unknown): string | null {
  return texto(value)?.toLowerCase() ?? null
}

function valoresUnicos(values: unknown[]): string[] {
  return Array.from(new Set(values.flatMap((value) => {
    const text = texto(value)
    return text ? [text] : []
  })))
}

async function obtenerTodasLasFilas(
  construirConsulta: () => PaginatedQuery,
  tabla: 'profiles' | 'tickets',
): Promise<Record<string, unknown>[]> {
  const filas: Record<string, unknown>[] = []

  for (let desde = 0; ; desde += PRE_REGISTRO_PAGE_SIZE) {
    const { data, error } = await construirConsulta().range(desde, desde + PRE_REGISTRO_PAGE_SIZE - 1)
    if (error) {
      throw new Error(`Error consultando ${tabla} (desde ${desde}): ${error.message}`)
    }

    const pagina = data ?? []
    filas.push(...pagina)
    if (pagina.length < PRE_REGISTRO_PAGE_SIZE) return filas
  }
}

/**
 * Obtiene todos los pre-registros en servidor, sin depender de RLS ni del límite
 * predeterminado de PostgREST, y los cruza con profiles y Auth para enriquecerlos.
 */
export async function obtenerPreRegistros(): Promise<ObtenerPreRegistrosResult> {
  const sessionClient = await createClient()
  const { data: { user }, error: authError } = await sessionClient.auth.getUser()

  if (authError) {
    console.error('[obtenerPreRegistros] Error validando la sesión:', authError.message)
    return { success: false, message: 'No se pudo validar la sesión actual.' }
  }
  if (!user) {
    return { success: false, message: 'Debes iniciar sesión para buscar pre-registros.' }
  }

  const { data: perfilActual, error: perfilError } = await sessionClient
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (perfilError) {
    console.error('[obtenerPreRegistros] Error consultando el perfil:', perfilError.message)
    return { success: false, message: 'No se pudo validar el perfil y los permisos.' }
  }
  if (!perfilActual) {
    return { success: false, message: 'No se encontró el perfil de la sesión.' }
  }

  const perfilActualComoRegistro = perfilActual as unknown as Record<string, unknown>
  const rolActual = Number(perfilActualComoRegistro.role_id ?? perfilActualComoRegistro.id_rol)
  if (rolActual !== 1 && rolActual !== 2) {
    return { success: false, message: 'No tienes permisos para consultar pre-registros.' }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('[obtenerPreRegistros] Faltan las variables de configuración del cliente administrativo.')
    return { success: false, message: 'La consulta administrativa no está configurada en el servidor.' }
  }

  const adminClient = createSupabaseAdminClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const adminQueryClient = adminClient as unknown as AdminDataClient

  try {
    const usuariosAuth: User[] = []
    for (let page = 1; ; page += 1) {
      const { data, error } = await adminClient.auth.admin.listUsers({
        page,
        perPage: PRE_REGISTRO_PAGE_SIZE,
      })
      if (error) {
        throw new Error(`Error listando usuarios de Auth (página ${page}): ${error.message}`)
      }

      usuariosAuth.push(...data.users)
      if (data.users.length < PRE_REGISTRO_PAGE_SIZE) break
    }

    const [perfiles, tickets] = await Promise.all([
      obtenerTodasLasFilas(
        () => adminQueryClient.from('profiles').select('*').order('id', { ascending: true }),
        'profiles',
      ),
      obtenerTodasLasFilas(
        () => adminQueryClient
          .from('tickets')
          .select('*')
          .is('asiento_numero', null)
          .or('estatus_pago.ilike.%pre-registro%,estatus_pago.ilike.%pending%')
          .order('id', { ascending: true }),
        'tickets',
      ),
    ])

    const perfilesPorId = new Map<string, Record<string, unknown>>()
    const perfilesPorCorreo = new Map<string, Record<string, unknown>>()
    for (const perfil of perfiles) {
      const id = texto(perfil.id)
      const email = correoNormalizado(perfil.email)
      if (id) perfilesPorId.set(id, perfil)
      if (email) perfilesPorCorreo.set(email, perfil)
    }

    const authPorId = new Map(usuariosAuth.map((authUser) => [authUser.id, authUser]))
    const authPorCorreo = new Map<string, User>()
    for (const authUser of usuariosAuth) {
      const email = correoNormalizado(authUser.email)
      if (email) authPorCorreo.set(email, authUser)
    }

    const usuarios = tickets.flatMap((ticket): TicketSelectResponse[] => {
      const estatusPago = texto(ticket.estatus_pago)?.toLowerCase()
      if (!estatusPago || !PRE_REGISTRO_STATUSES.has(estatusPago)) return []
      if (ticket.asiento_numero != null) return []

      const buyerId = texto(ticket.buyer_id)
      const emailTicket = correoNormalizado(ticket.email)
      const perfil = (buyerId ? perfilesPorId.get(buyerId) : undefined)
        ?? (emailTicket ? perfilesPorCorreo.get(emailTicket) : undefined)
      const emailPerfil = correoNormalizado(perfil?.email)
      const authUser = (buyerId ? authPorId.get(buyerId) : undefined)
        ?? (emailTicket ? authPorCorreo.get(emailTicket) : undefined)
        ?? (emailPerfil ? authPorCorreo.get(emailPerfil) : undefined)

      const correosBusqueda = valoresUnicos([
        ticket.email,
        perfil?.email,
        authUser?.email,
      ])
      const email = texto(ticket.email) ?? texto(perfil?.email) ?? texto(authUser?.email) ?? ''
      const matriculasBusqueda = valoresUnicos([
        ticket.matricula,
        perfil?.matricula,
        ...correosBusqueda.map((correo) => correo.split('@')[0]),
      ])
      const metadata = authUser?.user_metadata
      const nombre = texto(ticket.nombre)
        ?? texto(metadata?.full_name)
        ?? texto(metadata?.name)
        ?? texto(perfil?.nombre)
        ?? null

      return [{
        id: texto(ticket.id) ?? '',
        buyer_id: buyerId,
        nombre,
        email,
        matricula: texto(ticket.matricula) ?? texto(perfil?.matricula) ?? null,
        matriculasBusqueda,
        correosBusqueda,
        estatus_pago: texto(ticket.estatus_pago),
        asiento_numero: null,
        type: texto(ticket.type),
      }]
    })

    return { success: true, usuarios }
  } catch (error) {
    console.error('[obtenerPreRegistros] Error al consultar pre-registros:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'No se pudieron consultar los pre-registros.',
    }
  }
}

// Re-exportamos explícitamente las funciones asíncronas para cumplir las reglas estricta de Next.js.
// Usamos Parameters<typeof ...> y ReturnType<typeof ...> para heredar el tipado exacto automáticamente.

export async function getOccupiedSeats(...args: Parameters<typeof tokenActions.getOccupiedSeats>): Promise<ReturnType<typeof tokenActions.getOccupiedSeats>> {
  return tokenActions.getOccupiedSeats(...args)
}

export async function getOccupiedSeatKeys(...args: Parameters<typeof tokenActions.getOccupiedSeatKeys>): Promise<ReturnType<typeof tokenActions.getOccupiedSeatKeys>> {
  return tokenActions.getOccupiedSeatKeys(...args)
}

export async function getSeatStatusMap(...args: Parameters<typeof tokenActions.getSeatStatusMap>): Promise<ReturnType<typeof tokenActions.getSeatStatusMap>> {
  return tokenActions.getSeatStatusMap(...args)
}

export async function getAssignmentContext(...args: Parameters<typeof tokenActions.getAssignmentContext>): Promise<ReturnType<typeof tokenActions.getAssignmentContext>> {
  return tokenActions.getAssignmentContext(...args)
}

// Corregido: Se eliminó el espacio y el texto 'get ' erróneo dentro de Parameters<...>
export async function requireAssignmentContext(...args: Parameters<typeof tokenActions.requireAssignmentContext>): Promise<ReturnType<typeof tokenActions.requireAssignmentContext>> {
  return tokenActions.requireAssignmentContext(...args)
}

export async function createManualSeatTicket(...args: Parameters<typeof tokenActions.createManualSeatTicket>): Promise<ReturnType<typeof tokenActions.createManualSeatTicket>> {
  return tokenActions.createManualSeatTicket(...args)
}

export async function confirmarPagoTicket(...args: Parameters<typeof tokenActions.confirmarPagoTicket>): Promise<ReturnType<typeof tokenActions.confirmarPagoTicket>> {
  return tokenActions.confirmarPagoTicket(...args)
}

export async function generarTokensMultiples(...args: Parameters<typeof tokenActions.generarTokensMultiples>): Promise<ReturnType<typeof tokenActions.generarTokensMultiples>> {
  return tokenActions.generarTokensMultiples(...args)
}

export async function cobrarAsientoYGenerarToken(...args: Parameters<typeof tokenActions.cobrarAsientoYGenerarToken>): Promise<ReturnType<typeof tokenActions.cobrarAsientoYGenerarToken>> {
  return tokenActions.cobrarAsientoYGenerarToken(...args)
}

export async function liquidarRestoAsiento(...args: Parameters<typeof tokenActions.liquidarRestoAsiento>): Promise<ReturnType<typeof tokenActions.liquidarRestoAsiento>> {
  return tokenActions.liquidarRestoAsiento(...args)
}

export async function getApartadoInfo(...args: Parameters<typeof tokenActions.getApartadoInfo>): Promise<ReturnType<typeof tokenActions.getApartadoInfo>> {
  return tokenActions.getApartadoInfo(...args)
}

// Tipos para generar-tokens
export interface GenerarTokenResult {
  success: boolean
  token?: string
  message: string
}

export interface TaquillaTokensView {
  id: string
  token_code: string
  zone_id: string
  status: string
  created_at: string
}

// Función para generar un token individual
export async function generarToken(): Promise<GenerarTokenResult> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, message: 'Debes iniciar sesión para generar tokens.' }
  }

  // Verificar permisos de admin/encargado
  const { data: perfil } = await supabase
    .from('profiles')
    .select('id_rol')
    .eq('id', user.id)
    .maybeSingle()

  if (!perfil || (perfil as { id_rol: number }).id_rol !== 1) {
    return { success: false, message: 'No tienes permisos para generar tokens.' }
  }

  // Generar código de token usando UUID
  const { v4: uuidv4 } = await import('uuid')
  const tokenCode = `IGE-2026-${uuidv4().split('-')[0].toUpperCase()}-${uuidv4().split('-')[1].toUpperCase()}`

  // Insertar el token en la base de datos
  const { data: token, error } = await supabase
    .from('tokens_canje')
    .insert({
      token_code: tokenCode,
      event_id: CONGRESO_IGE_EVENT_ID,
      zone_id: null,
      creado_por: user.id,
      status: 'disponible',
      total_abonado: 0,
      estado_pago: 'sin_pago'
    } as never)
    .select()
    .maybeSingle()

  if (error) {
    console.error('[generarToken] Error:', error.message)
    return { success: false, message: `Error al generar token: ${error.message}` }
  }

  return {
    success: true,
    token: (token as { token_code: string }).token_code,
    message: 'Token generado exitosamente.'
  }
}

// Los tipos no se ven afectados por las restricciones de 'use server'
export type { ApartadoInfoLocal } from './tokenActions'
export type { OccupiedSeat, AssignmentContext, ManualTicketInput, ActionResult } from '@/components/asientos/types'
