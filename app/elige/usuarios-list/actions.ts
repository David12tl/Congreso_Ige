'use server'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient as createSessionClient } from '@/lib/supabase/server'

export interface AsistenteGlobal {
  id: string
  nombre: string | null
  nombres_busqueda: string[]
  email: string
  correos_busqueda: string[]
  carrera: string | null
  semestre: string | null
  matricula: string | null
  matriculas_busqueda: string[]
  unidad_academica: string | null
  unidad_academica_id: number | null
  type: 'alumno' | 'empresa'
  telefono: string | null
  purchased_at: string | null
  estatus_pago: string | null
}

interface QueryResult {
  data: Record<string, unknown>[] | null
  error: { message: string } | null
}

interface PaginatedQuery extends PromiseLike<QueryResult> {
  order(column: string, options?: { ascending?: boolean; nullsFirst?: boolean }): PaginatedQuery
  eq(column: string, value: string | number): PaginatedQuery
  range(from: number, to: number): PromiseLike<QueryResult>
  maybeSingle(): PromiseLike<{
    data: Record<string, unknown> | null
    error: { message: string } | null
  }>
}

interface AdminQueryClient {
  from: (table: string) => {
    select: (columns?: string) => PaginatedQuery
  }
}

const PAGE_SIZE = 1000

function texto(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function valoresTexto(...values: unknown[]): string[] {
  return Array.from(new Set(values.flatMap((value) => {
    const valueText = texto(value)
    return valueText ? [valueText] : []
  })))
}

function numero(value: unknown): number | null {
  if (value == null || value === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

async function obtenerTodasLasFilas(
  construirConsulta: () => PaginatedQuery,
  tabla: string
): Promise<Record<string, unknown>[]> {
  const filas: Record<string, unknown>[] = []

  for (let desde = 0; ; desde += PAGE_SIZE) {
    const { data, error } = await construirConsulta().range(desde, desde + PAGE_SIZE - 1)
    if (error) {
      throw new Error(`[getTodosLosAsistentes] Error consultando ${tabla}: ${error.message}`)
    }

    const pagina = data ?? []
    filas.push(...pagina)
    if (pagina.length < PAGE_SIZE) return filas
  }
}

export async function getTodosLosAsistentes(): Promise<AsistenteGlobal[]> {
  const sessionClient = await createSessionClient()
  const { data: { user }, error: authError } = await sessionClient.auth.getUser()
  if (authError) {
    throw new Error(`[getTodosLosAsistentes] Error validando sesión: ${authError.message}`)
  }
  if (!user) throw new Error('[getTodosLosAsistentes] Se requiere una sesión autenticada.')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('[getTodosLosAsistentes] Configura NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en el entorno del servidor.')
  }

  const adminClient = createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const cli = adminClient as unknown as AdminQueryClient

  const { data: perfilActual, error: perfilActualError } = await cli
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()
  if (perfilActualError) {
    throw new Error(`[getTodosLosAsistentes] Error consultando el perfil de la sesión: ${perfilActualError.message}`)
  }
  if (!perfilActual) throw new Error('[getTodosLosAsistentes] No se encontró el perfil de la sesión.')
  if (Number(perfilActual.role_id ?? perfilActual.id_rol) !== 1) {
    throw new Error('[getTodosLosAsistentes] No tienes permisos para consultar la lista global de usuarios.')
  }

  const usuariosAuth = []
  for (let page = 1; ; page += 1) {
    const { data, error } = await adminClient.auth.admin.listUsers({
      page,
      perPage: PAGE_SIZE,
    })
    if (error) {
      throw new Error(`[getTodosLosAsistentes] Error listando usuarios de Auth (página ${page}): ${error.message}`)
    }

    usuariosAuth.push(...data.users)
    if (data.users.length < PAGE_SIZE) break
  }
  const authPorId = new Map(usuariosAuth.map((authUser) => [authUser.id, authUser]))

  const [profiles, tickets, unidades] = await Promise.all([
    obtenerTodasLasFilas(
      () => cli.from('profiles').select('*').order('id', { ascending: true }),
      'profiles'
    ),
    obtenerTodasLasFilas(
      () => cli
        .from('tickets')
        .select(`
          id,
          buyer_id,
          nombre,
          email,
          carrera,
          semestre,
          matricula,
          unidad_academica_id,
          type,
          telefono,
          purchased_at,
          estatus_pago
        `)
        .order('purchased_at', { ascending: false, nullsFirst: false })
        .order('id', { ascending: false }),
      'tickets'
    ),
    obtenerTodasLasFilas(
      () => cli.from('unidades_academicas').select('id, nombre').order('id', { ascending: true }),
      'unidades_academicas'
    ),
  ])

  const perfilesPorId = new Map(profiles.map((profile) => [String(profile.id), profile]))
  const nombreUnidadPorId = new Map(
    unidades.flatMap((unidad) => {
      const id = numero(unidad.id)
      const nombre = texto(unidad.nombre)
      return id != null && nombre ? [[id, nombre] as const] : []
    })
  )
  const ticketsPorAlumno = new Map<string, Record<string, unknown>[]>()
  for (const ticket of tickets) {
    const buyerId = texto(ticket.buyer_id)
    if (!buyerId) continue
    const ticketsAlumno = ticketsPorAlumno.get(buyerId) ?? []
    ticketsAlumno.push(ticket)
    ticketsPorAlumno.set(buyerId, ticketsAlumno)
  }

  return tickets.map((ticket): AsistenteGlobal => {
    const buyerId = texto(ticket.buyer_id)
    const profile = buyerId ? perfilesPorId.get(buyerId) : undefined
    const authUser = buyerId ? authPorId.get(buyerId) : undefined
    const metadata = authUser?.user_metadata
    const nombreAuthCompleto = texto(metadata?.full_name)
    const nombreAuth = texto(metadata?.name)
    const ticketsAlumno = buyerId ? ticketsPorAlumno.get(buyerId) ?? [ticket] : [ticket]
    const correosBusqueda = valoresTexto(
      ticket.email,
      profile?.email,
      authUser?.email,
      ...ticketsAlumno.map((fila) => fila.email)
    )
    const nombresBusqueda = valoresTexto(
      ...ticketsAlumno.map((fila) => fila.nombre),
      profile?.nombre,
      nombreAuthCompleto,
      nombreAuth
    )
    const matriculasBusqueda = valoresTexto(
      ...ticketsAlumno.map((fila) => fila.matricula),
      ...correosBusqueda.map((email) => email.split('@')[0])
    )
    const unidadAcademicaId = numero(ticket.unidad_academica_id) ??
      numero(profile?.unidad_academica_id)
    const email = texto(ticket.email) || texto(authUser?.email) || texto(profile?.email) || ''

    return {
      id: String(ticket.id ?? ''),
      nombre: texto(ticket.nombre) || nombreAuthCompleto || nombreAuth || texto(profile?.nombre),
      nombres_busqueda: nombresBusqueda,
      email,
      correos_busqueda: correosBusqueda,
      carrera: texto(ticket.carrera),
      semestre: texto(ticket.semestre),
      matricula: texto(ticket.matricula) || texto(email.split('@')[0]),
      matriculas_busqueda: matriculasBusqueda,
      unidad_academica: unidadAcademicaId == null ? null : nombreUnidadPorId.get(unidadAcademicaId) ?? null,
      unidad_academica_id: unidadAcademicaId,
      type: texto(ticket.type) === 'empresa' ? 'empresa' : 'alumno',
      telefono: texto(ticket.telefono),
      purchased_at: texto(ticket.purchased_at),
      estatus_pago: texto(ticket.estatus_pago),
    }
  })
}
