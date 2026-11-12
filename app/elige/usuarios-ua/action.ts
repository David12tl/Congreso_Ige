'use server'

import { createClient } from '@/lib/supabase/server'

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
  range(from: number, to: number): PromiseLike<QueryResult>
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
  const supabase = await createClient()
  const cli = supabase as unknown as SupabaseBypass

  let ticketRows: TicketFila[]
  try {
    ticketRows = (await obtenerTodasLasFilas(() =>
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
  } catch (error) {
    console.error('[getUsuariosPorUA] Error leyendo tickets:', error)
    return []
  }

  let profileRows: ProfileFila[]
  try {
    profileRows = (await obtenerTodasLasFilas(() =>
      cli
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
        .order('id', { ascending: true })
    )) as unknown as ProfileFila[]
  } catch (error) {
    console.error('[getUsuariosPorUA] Error leyendo perfiles:', error)
    return []
  }

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
      email: valorUtilizable(ticket?.email) || perfil.email || '',
      matricula: ticket ? valorUtilizable(ticket.matricula) : null,
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
