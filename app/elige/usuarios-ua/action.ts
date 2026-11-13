'use server'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient as createSessionClient } from '@/lib/supabase/server'

export interface UsuarioUA {
  id: string
  nombre: string | null
  nombres_busqueda: string[]
  email: string
  correos_busqueda: string[]
  carrera: string | null
  semestre: string | null
  matricula: string | null
  matriculas_busqueda: string[]
  modalidad: 'escolarizado' | 'mixto' | null
  unidad_academica: string | null
  unidad_academica_id: number | null
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

function valoresTexto(...values: unknown[]): string[] {
  return Array.from(new Set(values.flatMap((value) => {
    const texto = valorUtilizable(value)
    return texto ? [texto] : []
  })))
}

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

  const usuarioAuthPorId = new Map(usuariosAuth.map((authUser) => [authUser.id, authUser]))

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

  const ticketsPorAlumno = new Map<string, TicketFila[]>()
  for (const ticket of ticketRows) {
    if (!ticket.buyer_id) continue
    const ticketsAlumno = ticketsPorAlumno.get(ticket.buyer_id) ?? []
    ticketsAlumno.push(ticket)
    ticketsPorAlumno.set(ticket.buyer_id, ticketsAlumno)
  }

  return profileRows.flatMap((perfil): UsuarioUA[] => {
    const idRol = Number(perfil.role_id ?? perfil.id_rol)
    if (idRol !== 3) return []

    const ticketsAlumno = ticketsPorAlumno.get(perfil.id) ?? []
    const ticket = ticketsAlumno[0]
    const usuarioAuth = usuarioAuthPorId.get(perfil.id)
    const metadata = usuarioAuth?.user_metadata
    const nombreAuthCompleto = valorUtilizable(metadata?.full_name)
    const nombreAuth = valorUtilizable(metadata?.name)
    const emailAuth = valorUtilizable(usuarioAuth?.email)
    const emailPerfil = valorUtilizable(perfil.email)
    const emailTicket = valorUtilizable(ticket?.email)
    const correosBusqueda = valoresTexto(
      emailAuth,
      emailPerfil,
      ...ticketsAlumno.map((fila) => fila.email)
    )
    const nombresBusqueda = valoresTexto(
      ...ticketsAlumno.map((fila) => fila.nombre),
      perfil.nombre,
      nombreAuthCompleto,
      nombreAuth
    )
    const matriculasBusqueda = valoresTexto(
      ...ticketsAlumno.map((fila) => fila.matricula),
      ...correosBusqueda.map((email) => email.split('@')[0])
    )

    return [{
      id: perfil.id,
      nombre: valorUtilizable(ticket?.nombre) ||
        nombreAuthCompleto ||
        nombreAuth ||
        valorUtilizable(perfil.nombre),
      nombres_busqueda: nombresBusqueda,
      email: emailAuth || emailPerfil || emailTicket || '',
      correos_busqueda: correosBusqueda,
      matricula: valorUtilizable(ticket?.matricula) ||
        valorUtilizable((emailAuth || emailPerfil || emailTicket || '').split('@')[0]),
      matriculas_busqueda: matriculasBusqueda,
      carrera: ticket ? valorUtilizable(ticket.carrera) : null,
      semestre: ticket ? valorUtilizable(ticket.semestre) : null,
      modalidad: ticket?.modalidad ?? null,
      unidad_academica: perfil.unidades_academicas?.nombre || null,
      unidad_academica_id: perfil.unidad_academica_id ?? null,
      id_rol: perfil.roles?.nombre_rol || 'Usuario',
      created_at: ticket?.purchased_at || perfil.created_at || '',
      estatus_pago: ticket?.estatus_pago ?? null,
    }]
  })
}
