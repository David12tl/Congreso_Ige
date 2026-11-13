'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { CONGRESO_IGE_EVENT_ID } from '@/config/auditorioConfig'
import { normalizeStudentModality } from '@/lib/tickets/modality'
import { resolveUnidadAcademicaId } from '@/lib/tickets/resolveUnidadAcademica'

// ─── Esquemas de validación ───────────────────────────────────────────────────
const UnidadAcademicaIdSchema = z.coerce
  .number({ error: 'ID de Unidad Académica inválido.' })
  .int('El ID debe ser un entero.')
  .positive('El ID debe ser un número positivo.')

const PreTicketSchema = z.object({
  buyer_id: z.string().uuid(),
  event_id: z.string().uuid(),
  unidad_academica_id: UnidadAcademicaIdSchema,
  type: z.enum(['alumno', 'empresa']),
  nombre: z.string().trim().min(1).max(160),
  email: z.string().trim().email().max(180),
  telefono: z.string().trim().max(40).nullable(),
  matricula: z.string().trim().max(80).nullable(),
  carrera: z.string().trim().max(160).nullable(),
  semestre: z.string().trim().max(30).nullable(),
  modalidad: z.enum(['escolarizado', 'mixto']).nullable(),
  empresa: z.string().trim().max(160).nullable(),
})

export interface PerfilUsuario {
  id: string
  email: string | null
  createdAt: string
  rolNombre: string
  nivelAcceso: number
  unidadAcademicaId: number | null
  unidadAcademicaNombre: string | null
}

export interface UnidadAcademica {
  id: number
  nombre: string
  tipo: 'interno' | 'externo'
}

export async function getMiPerfil(): Promise<PerfilUsuario | null> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.warn('[getMiPerfil] No hay usuario autenticado en Supabase Auth.')
      return null
    }

    // Consulta alineada con las FK exactas: profiles_id_rol_fkey y profiles_unidad_academica_id_fkey
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        email,
        created_at,
        unidad_academica_id,
        roles:profiles_id_rol_fkey (
          nombre_rol,
          nivel_acceso
        ),
        unidades_academicas:profiles_unidad_academica_id_fkey (
          nombre
        )
      `)
      .eq('id', user.id)
      .maybeSingle()

    if (error) {
      console.error(`[getMiPerfil] Error SQL consultando perfil para user ${user.id}:`, error.message)
      return null
    }

    if (!data) {
      console.warn(`[getMiPerfil] No existe registro en profiles para user ${user.id}.`)
      return null
    }

    // Extracción segura de tipos
    const roleData = Array.isArray(data.roles) ? data.roles[0] : data.roles
    const uaData = Array.isArray(data.unidades_academicas) ? data.unidades_academicas[0] : data.unidades_academicas

    const dateObj = data.created_at ? new Date(data.created_at) : null
    const createdAtFormatted = dateObj && !isNaN(dateObj.getTime())
      ? dateObj.toLocaleDateString('es-MX', { timeZone: 'America/Mexico_City' })
      : '—'

    return {
      id: user.id,
      email: data.email ?? user.email ?? null,
      createdAt: createdAtFormatted,
      rolNombre: roleData?.nombre_rol || 'Usuario',
      nivelAcceso: roleData?.nivel_acceso != null ? Number(roleData.nivel_acceso) : 1,
      unidadAcademicaId: data.unidad_academica_id != null ? Number(data.unidad_academica_id) : null,
      unidadAcademicaNombre: uaData?.nombre ?? null,
    }
  } catch (err) {
    console.error('[getMiPerfil] Excepción no controlada:', err instanceof Error ? err.message : String(err))
    return null
  }
}

export async function getUnidadesAcademicas(): Promise<UnidadAcademica[]> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('unidades_academicas')
      .select('id, nombre, tipo')
      .order('nombre', { ascending: true })

    if (error) {
      console.error('[getUnidadesAcademicas] Error SQL:', error.message)
      return []
    }

    if (!data) return []

    // Convertir explícitamente el BigInt id a Number para evitar problemas de serialización JSON en Next.js
    return data.map((ua) => ({
      id: Number(ua.id),
      nombre: String(ua.nombre ?? ''),
      tipo: (ua.tipo as 'interno' | 'externo') || 'interno',
    }))
  } catch (err) {
    console.error('[getUnidadesAcademicas] Excepción no controlada:', err instanceof Error ? err.message : String(err))
    return []
  }
}

export async function actualizarMiUnidadAcademica(unidadAcademicaId: number): Promise<{ success: boolean; message: string }> {
  try {
    const parsed = UnidadAcademicaIdSchema.safeParse(unidadAcademicaId)
    if (!parsed.success) {
      return { success: false, message: parsed.error.issues[0]?.message ?? 'ID inválido.' }
    }
    const safeId = parsed.data

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, message: 'Sesión expirada o no válida.' }
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({
        unidad_academica_id: safeId,
      })
      .eq('id', user.id)
      .select('id')
      .maybeSingle()

    if (error) {
      console.error(`[actualizarMiUnidadAcademica] Error SQL actualizando UA para user ${user.id}:`, error.message)
      return { success: false, message: 'No se pudo guardar la Unidad Académica.' }
    }

    if (!data) {
      return { success: false, message: 'No existe un perfil de usuario para guardar la Unidad Académica.' }
    }

    return { success: true, message: 'Unidad Académica actualizada.' }
  } catch (err) {
    console.error('[actualizarMiUnidadAcademica] Excepción no controlada:', err instanceof Error ? err.message : String(err))
    return { success: false, message: 'Error crítico al guardar la Unidad Académica.' }
  }
}

export async function crearPreRegistro(input: unknown): Promise<{ success: boolean; message: string }> {
  const parsed = PreTicketSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? 'Los datos del registro son inválidos.' }
  }

  const data = parsed.data
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, message: 'Debes iniciar sesión para completar tu registro.' }
  }
  if (data.buyer_id !== user.id || data.event_id !== CONGRESO_IGE_EVENT_ID) {
    return { success: false, message: 'La cuenta o el evento no corresponden a esta sesión.' }
  }

  try {
    const unidadAcademicaId = await resolveUnidadAcademicaId(supabase, user.id, user.email ?? null)
    if (unidadAcademicaId == null || unidadAcademicaId !== data.unidad_academica_id) {
      return { success: false, message: 'Selecciona y guarda una Unidad Académica antes de registrarte.' }
    }

    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id')
      .eq('id', CONGRESO_IGE_EVENT_ID)
      .maybeSingle()

    if (eventError) throw eventError
    if (!event) return { success: false, message: 'El evento de registro no está disponible.' }

    const ticketPayload = {
      buyer_id: user.id,
      event_id: CONGRESO_IGE_EVENT_ID,
      unidad_academica_id: unidadAcademicaId,
      type: data.type,
      nombre: data.nombre,
      email: data.email,
      telefono: data.telefono,
      matricula: data.matricula,
      carrera: data.carrera,
      semestre: data.semestre,
      modalidad: data.type === 'alumno' ? normalizeStudentModality(data.modalidad) : null,
      empresa: data.empresa,
      estatus_pago: 'pre-registro',
    }

    const { data: existingTicket, error: existingTicketError } = await supabase
      .from('tickets')
      .select('id, purchase_id')
      .eq('buyer_id', user.id)
      .maybeSingle()

    if (existingTicketError) throw existingTicketError
    if (existingTicket?.purchase_id) {
      return { success: false, message: 'Tu cuenta ya tiene un boleto activo.' }
    }

    const { error } = existingTicket
      ? await supabase.from('tickets').update(ticketPayload as never).eq('id', existingTicket.id)
      : await supabase.from('tickets').insert(ticketPayload as never)

    if (error) {
      console.error('[crearPreRegistro] Error SQL:', error.message)
      return { success: false, message: 'No se pudo completar el pre-registro. Es posible que ya tengas un ticket.' }
    }

    revalidatePath('/elige/perfil')
    return { success: true, message: 'Pre-registro completado.' }
  } catch (error) {
    console.error('[crearPreRegistro] Error inesperado:', error instanceof Error ? error.message : String(error))
    return { success: false, message: 'Ocurrió un error al guardar el pre-registro.' }
  }
}

