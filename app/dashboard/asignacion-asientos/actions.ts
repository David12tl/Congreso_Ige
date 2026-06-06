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
} from '@/src/components/asientos/types'

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
    console.error('[getProfileRole] Error al consultar profile:', fallback.error.message)
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
    console.error('[getUnidades] Error al consultar UAs:', error.message)
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

  const ticket = {
    buyer_id: user.id,
    purchase_id: null,
    event_id: CONGRESO_IGE_EVENT_ID,
    zone_id: input.zoneId,
    type: 'alumno',
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
  }

  const { error } = await client.from('tickets').insert(ticket)

  if (error) {
    console.error('[createManualSeatTicket] Error al insertar ticket:', error.message)
    return { success: false, message: getControlledErrorMessage(error) }
  }

  revalidatePath('/monitoreo-mapa')
  revalidatePath('/dashboard/asignacion-asientos')

  return { success: true, message: 'Asiento asignado correctamente.' }
}

export async function requireAssignmentContext() {
  const context = await getAssignmentContext()
  if (!context) redirect('/dashboard')
  return context
}
