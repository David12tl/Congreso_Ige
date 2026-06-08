'use server'

import { revalidatePath } from 'next/cache'
import { CONGRESO_IGE_EVENT_ID } from '@/src/config/auditorioConfig'
import { createClient } from '@/src/lib/supabase/server'
import type { ActionResult, PerfilUsuarioCompleto, PreRegistroInput } from '@/src/components/asientos/types'

// Interface genérica para evitar errores de tipado estricto de Supabase
interface DynamicClient {
  from: (table: string) => {
    select: (columns: string) => {
      eq: (column: string, value: string | number) => {
        single: () => Promise<{ data: Record<string, unknown> | null; error: { message: string } | null }>
        maybeSingle: () => Promise<{ data: Record<string, unknown> | null; error: { message: string } | null }>
      }
      order: (column: string, options: { ascending: boolean }) => Promise<{
        data: Record<string, unknown>[] | null
        error: { message: string } | null
      }>
    }
    insert: (values: Record<string, unknown>) => Promise<{ error: { message: string; code?: string } | null }>
  }
}

/**
 * Obtiene el perfil completo del usuario actual desde la tabla profiles
 * y determina si está completo para poder registrar un boleto.
 * Los campos obligatorios son: unidad_academica_id, telefono y matricula (para alumnos)
 */
export async function getMiPerfilCompleto(): Promise<PerfilUsuarioCompleto | null> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) return null

  const client = supabase as unknown as DynamicClient

  const { data, error } = await client
    .from('profiles')
    .select('email, nombre, telefono, matricula, carrera, semestre, unidad_academica_id, unidades_academicas!profiles_unidad_academica_id_fkey(nombre)')
    .eq('id', user.id)
    .single()

  if (error || !data) {
    console.error('[getMiPerfilCompleto] Error:', error?.message)
    return null
  }

  const profile = data as {
    email: string | null
    nombre: string | null
    telefono: string | null
    matricula: string | null
    carrera: string | null
    semestre: string | null
    unidad_academica_id: number | null
    unidades_academicas: { nombre: string } | null
  }

  const email = profile.email ?? user.email ?? null
  const uaId = profile.unidad_academica_id ?? null
  const uaNombre = profile.unidades_academicas?.nombre ?? null
  const telefono = profile.telefono ?? null
  const matricula = profile.matricula ?? null

  // Determinar tipo: si tiene matricula es alumno, si no externo
  const tipo = matricula ? 'alumno' : 'externo'

  // Perfil completo: debe tener UA, y teléfono (para externos) o matrícula (para alumnos)
  const completo = uaId !== null && (tipo === 'alumno' ? (matricula !== null && matricula !== '') : (telefono !== null && telefono !== ''))

  return {
    email,
    nombre: profile.nombre ?? null,
    telefono,
    matricula,
    carrera: profile.carrera ?? null,
    semestre: profile.semestre ?? null,
    unidadAcademicaId: uaId,
    unidadAcademicaNombre: uaNombre,
    tipo,
    completo,
  }
}

/**
 * Registra un pre-registro de asiento para el usuario logueado.
 * Crea un ticket en estado 'pre-registro' y asigna el asiento.
 */
export async function crearPreRegistro(input: PreRegistroInput): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, message: 'Debes iniciar sesión para apartar un asiento.' }
  }

  // Validar que el perfil esté completo
  const perfil = await getMiPerfilCompleto()
  if (!perfil || !perfil.completo) {
    return { success: false, message: 'Completa tu perfil en /dashboard/perfil antes de apartar un asiento.' }
  }

  // Validar campos requeridos del asiento
  if (!input.zoneId || !input.bloque || !input.fila || !input.numero) {
    return { success: false, message: 'Faltan datos del asiento.' }
  }

  const nombre = input.nombre?.trim() || perfil.nombre || ''
  const email = perfil.email || ''

  if (!nombre) {
    return { success: false, message: 'El nombre es obligatorio.' }
  }

  let ticketType = 'alumno'
  let matricula: string | null = null
  let carrera: string | null = null
  let semestre: string | null = null
  let telefono: string | null = null
  const unidadAcademicaId = perfil.unidadAcademicaId
  let unidadAcademica: string | null = perfil.unidadAcademicaNombre

  if (input.tipo === 'alumno') {
    ticketType = 'alumno'
    matricula = input.matricula?.trim() || perfil.matricula || null
    carrera = input.carrera?.trim() || perfil.carrera || null
    semestre = input.semestre?.trim() || perfil.semestre || null
    telefono = input.telefono?.trim() || perfil.telefono || null
  } else {
    ticketType = 'empresa'
    telefono = input.telefono?.trim() || perfil.telefono || null
    matricula = null
    carrera = null
    semestre = null
    if (input.organizacion?.trim()) {
      unidadAcademica = input.organizacion.trim()
    }
  }

  const ticket: Record<string, unknown> = {
    buyer_id: user.id,
    purchase_id: null,
    event_id: CONGRESO_IGE_EVENT_ID,
    zone_id: input.zoneId,
    type: ticketType,
    nombre,
    email,
    matricula,
    carrera,
    semestre,
    telefono,
    unidad_academica_id: unidadAcademicaId,
    unidad_academica: unidadAcademica ?? 'Externa',
    asiento_zona: input.zoneCode,
    asiento_bloque: input.bloque,
    asiento_fila: input.fila,
    asiento_numero: input.numero,
    estatus_pago: 'pre-registro',
    purchased_at: null,
  }

  const client = supabase as unknown as DynamicClient
  const { error } = await client.from('tickets').insert(ticket)

  if (error) {
    console.error('[crearPreRegistro] Error:', error.message)
    const msg = error.message.toLowerCase()
    if (error.code === '23505' || msg.includes('duplicate') || msg.includes('unique')) {
      return { success: false, message: 'Ese asiento ya fue apartado. Elige otro.' }
    }
    return { success: false, message: `Error al registrar: ${error.message}` }
  }

  revalidatePath('/dashboard/mis-asientos')
  revalidatePath('/monitoreo-mapa')

  return { success: true, message: '¡Asiento apartado exitosamente! Presenta tu pago de $650 MXN con el encargado de tu unidad.' }
}

/**
 * Verifica si el usuario ya tiene un ticket (asiento) registrado
 */
export async function getMiTicketExistente(): Promise<{
  tieneTicket: boolean
  ticketId?: string
  estatusPago?: string
  asientoInfo?: string
} | null> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) return null

  const client = supabase as unknown as DynamicClient

  const { data, error } = await client
    .from('tickets')
    .select('id, estatus_pago, asiento_zona, asiento_bloque, asiento_fila, asiento_numero')
    .eq('buyer_id', user.id)
    .maybeSingle()

  if (error || !data) return { tieneTicket: false }

  const ticket = data as {
    id: string
    estatus_pago: string | null
    asiento_zona: string | null
    asiento_bloque: string | null
    asiento_fila: string | null
    asiento_numero: number | null
  }

  return {
    tieneTicket: true,
    ticketId: ticket.id,
    estatusPago: ticket.estatus_pago ?? 'pre-registro',
    asientoInfo: ticket.asiento_zona && ticket.asiento_bloque && ticket.asiento_fila && ticket.asiento_numero
      ? `${ticket.asiento_zona} / ${ticket.asiento_bloque} / Fila ${ticket.asiento_fila} / Asiento ${ticket.asiento_numero}`
      : undefined,
  }
}