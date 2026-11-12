'use server'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient as createSessionClient } from '@/lib/supabase/server'

export interface UsuarioUA {
  id: string
  nombre: string | null
  email: string
  carrera: string | null
  semestre: string | null
  matricula: string | null
  modalidad: 'escolarizado' | 'mixto' | null
  unidad_academica: string | null
  id_rol: string | null
  created_at: string
  estatus_pago: string | null
}

interface TicketFila {
  id: string
  buyer_id: string | null
  nombre: string | null
  email: string | null
  matricula: string | null
  carrera: string | null
  semestre: string | null
  modalidad: 'escolarizado' | 'mixto' | null
  unidad_academica_id: number | null
  purchased_at: string | null
  estatus_pago: string | null
}

interface ProfileFila {
  id: string
  email: string | null
  id_rol?: number | string | null
  role_id?: number | string | null
  unidad_academica_id: number | null
  nombre?: string | null
  created_at?: string | null
  roles?: { nombre_rol: string } | null
  unidades_academicas?: { nombre: string } | null
}

function valorUtilizable(value: unknown): string | null {
  if (typeof value !== 'string') return (value as string | null) ?? null
  const t = value.trim()
  return t.length > 0 ? t : null
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

interface SupabaseBypass {
  from: (table: string) => {
    select: (columns?: string) => PaginatedQuery
  }
}

const PAGE_SIZE = 1000

async function obtenerTodasLasFilas(
  construirConsulta: () => PaginatedQuery
): Promise<Record<string, unknown>[]> {
  const filas: Record<string, unknown>[] = []

  for (let desde = 0; ; desde += PAGE_SIZE) {
    const { data, error } = await construirConsulta().range(desde, desde + PAGE_SIZE - 1)
    if (error) throw new Error(error.message)

    const pagina = data ?? []
    filas.push(...pagina)
    if (pagina.length < PAGE_SIZE) return filas
  }
}

export async function getUsuariosPorUA(): Promise<UsuarioUA[]> {
  const sessionClient = await createSessionClient()
  const { data: { user }, error: authError } = await sessionClient.auth.getUser()
  if (authError) throw new Error(`[getUsuariosPorUA] Error validando sesión: ${authError.message}`)
  if (!user) throw new Error('[getUsuariosPorUA] Se requiere una sesión autenticada.')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('[getUsuariosPorUA] Configura NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en el entorno del servidor.')
  }

  const adminClient = createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const cli = adminClient as unknown as SupabaseBypass

  const { data: perfilActual, error: perfilActualError } = await cli
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (perfilActualError) {
    throw new Error(`[getUsuariosPorUA] Error consultando el perfil de la sesión: ${perfilActualError.message}`)
  }
  if (!perfilActual) throw new Error('[getUsuariosPorUA] No se encontró el perfil de la sesión.')

  const rolActual = Number(perfilActual.role_id ?? perfilActual.id_rol)
  if (rolActual !== 1 && rolActual !== 2) {
    throw new Error('[getUsuariosPorUA] No tienes permisos para consultar usuarios por UA.')
  }

  const unidadActualRaw = perfilActual.unidad_academica_id
  const unidadActual = Number(unidadActualRaw)
  if (rolActual === 2 && (unidadActualRaw == null || !Number.isFinite(unidadActual))) return []

  const usuariosAuth = []
  for (let page = 1; ; page += 1) {
    const { data, error } = await adminClient.auth.admin.listUsers({
      page,
      perPage: PAGE_SIZE,
    })
    if (error) {
      throw new Error(`[getUsuariosPorUA] Error listando usuarios de Auth (página ${page}): ${error.message}`)
    }

    usuariosAuth.push(...data.users)
    if (data.users.length < PAGE_SIZE) break
  }

  const emailAuthPorId = new Map(
    usuariosAuth.flatMap((authUser) => authUser.email ? [[authUser.id, authUser.email] as const] : [])
  )

  const ticketRows = (await obtenerTodasLasFilas(() =>
    cli
      .from('tickets')
      .select(`
        id,
        buyer_id,
        nombre,
        email,
        matricula,
        carrera,
        semestre,
        modalidad,
        unidad_academica_id,
        purchased_at,
        estatus_pago
      `)
      .order('purchased_at', { ascending: false, nullsFirst: false })
      .order('id', { ascending: false })
  )) as unknown as TicketFila[]

  const construirConsultaPerfiles = () => {
    const query = cli
      .from('profiles')
      .select(`
        *,
        roles!profiles_id_rol_fkey (
          nombre_rol
        ),
        unidades_academicas!profiles_unidad_academica_id_fkey (
          nombre
        )
      `)

    if (rolActual === 2) query.eq('unidad_academica_id', unidadActual)
    return query.order('id', { ascending: true })
  }

  const profileRows = (await obtenerTodasLasFilas(construirConsultaPerfiles)) as unknown as ProfileFila[]

  const ticketMasRecientePorAlumno = new Map<string, TicketFila>()
  for (const ticket of ticketRows) {
    if (ticket.buyer_id && !ticketMasRecientePorAlumno.has(ticket.buyer_id)) {
      ticketMasRecientePorAlumno.set(ticket.buyer_id, ticket)
    }
  }

  return profileRows.flatMap((perfil): UsuarioUA[] => {
    const idRol = Number(perfil.role_id ?? perfil.id_rol)
    if (idRol !== 3) return []

    const ticket = ticketMasRecientePorAlumno.get(perfil.id)
    return [{
      id: perfil.id,
      nombre: valorUtilizable(ticket?.nombre) || valorUtilizable(perfil.nombre),
      email: emailAuthPorId.get(perfil.id) || perfil.email || ticket?.email || '',
      matricula: valorUtilizable(ticket?.matricula) ||
        valorUtilizable((emailAuthPorId.get(perfil.id) || perfil.email || '').split('@')[0]),
      carrera: ticket ? valorUtilizable(ticket.carrera) : null,
      semestre: ticket ? valorUtilizable(ticket.semestre) : null,
      modalidad: ticket?.modalidad ?? null,
      unidad_academica: perfil.unidades_academicas?.nombre || null,
      id_rol: perfil.roles?.nombre_rol || 'Usuario',
      created_at: ticket?.purchased_at || perfil.created_at || '',
      estatus_pago: ticket?.estatus_pago ?? null,
    }]
  })
}
