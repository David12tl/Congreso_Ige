'use server'

import { createClient } from '@/lib/supabase/server'
import { normalizeStudentModality } from '@/lib/tickets/modality'
import { CONGRESO_IGE_EVENT_ID } from '@/config/auditorioConfig'
import { resolveUnidadAcademicaId } from '@/lib/tickets/resolveUnidadAcademica'
import { crearPreRegistro } from '../perfil/actions'

export interface ResumenDashboard {
  userEmail: string | null
  hasTicket: boolean
  eventName: string
  daysLeft: number
  ticketType: string | null
}

interface UpdateAsistenteData {
  tipo: 'alumno' | 'empresa'
  nombre: string
  email: string
  matricula?: string
  unidad_academica?: string
  semestre?: string
  carrera?: string
  telefono?: string
  modalidad?: string // 💡 Añadido para cumplir con la restricción de PostgreSQL
}

export async function getResumenAsistente(): Promise<ResumenDashboard> {
  const resultadoPorDefecto: ResumenDashboard = {
    userEmail: null,
    hasTicket: false,
    eventName: 'Congreso IGE 2026',
    daysLeft: 0,
    ticketType: null
  }

  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) return resultadoPorDefecto

    resultadoPorDefecto.userEmail = user.email || null

    // 1. Consultar ticket usando el cliente nativo de Supabase
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select('type')
      .eq('buyer_id', user.id)
      .maybeSingle()

    if (ticketError) {
      console.error('[getResumenAsistente] Error SQL en tickets:', ticketError.message)
    }

    // 2. Consultar evento
    const { data: evento, error: eventError } = await supabase
      .from('events')
      .select('name, start_date')
      .limit(1)
      .maybeSingle()

    if (eventError) {
      console.error('[getResumenAsistente] Error SQL en events:', eventError.message)
    }

    let diasRestantes = 0
    if (evento?.start_date) {
      const fechaInicio = new Date(evento.start_date)
      const hoy = new Date()
      const diferenciaTiempo = fechaInicio.getTime() - hoy.getTime()
      diasRestantes = Math.ceil(diferenciaTiempo / (1000 * 60 * 60 * 24))
      if (diasRestantes < 0) diasRestantes = 0
    }

    return {
      userEmail: user.email || null,
      hasTicket: !!ticket,
      eventName: evento?.name || 'Congreso IGE 2026',
      daysLeft: diasRestantes,
      ticketType: ticket?.type || null
    }
  } catch (err) {
    console.error('[getResumenAsistente] Excepción no controlada:', err instanceof Error ? err.message : String(err))
    return resultadoPorDefecto
  }
}

export async function getMiQR(): Promise<string | null> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: ticket, error } = await supabase
      .from('tickets')
      .select('id')
      .eq('buyer_id', user.id)
      .maybeSingle()

    if (error || !ticket) return null

    const ticketId = ticket.id
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(ticketId)}`
  } catch (err) {
    console.error('[getMiQR] Excepción no controlada:', err instanceof Error ? err.message : String(err))
    return null
  }
}

export async function actualizarInformacionPerfil(formData: UpdateAsistenteData): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, message: 'Sesión expirada o no válida.' }

    let unidadAcademicaId = formData.unidad_academica
      ? Number(formData.unidad_academica) || null
      : null

    if (unidadAcademicaId == null && formData.unidad_academica) {
      const { data: selectedUnit, error: unitError } = await supabase
        .from('unidades_academicas')
        .select('id')
        .eq('nombre', formData.unidad_academica)
        .maybeSingle()

      if (unitError) {
        console.error('[actualizarInformacionPerfil] Error al consultar Unidad Académica:', unitError.message)
        return { success: false, message: 'No se pudo validar la Unidad Académica seleccionada.' }
      }

      unidadAcademicaId = selectedUnit?.id ?? null
    }

    if (unidadAcademicaId == null) {
      unidadAcademicaId = await resolveUnidadAcademicaId(supabase, user.id, user.email ?? null)
    }

    if (unidadAcademicaId == null) {
      return { success: false, message: 'Selecciona una Unidad Académica antes de completar tu perfil.' }
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ unidad_academica_id: unidadAcademicaId })
      .eq('id', user.id)

    if (profileError) {
      console.error('[actualizarInformacionPerfil] Error al guardar Unidad Académica:', profileError.message)
      return { success: false, message: 'No se pudo guardar la Unidad Académica.' }
    }

    const isAlumno = formData.tipo === 'alumno'
    return crearPreRegistro({
      buyer_id: user.id,
      event_id: CONGRESO_IGE_EVENT_ID,
      unidad_academica_id: unidadAcademicaId,
      type: isAlumno ? 'alumno' : 'empresa',
      nombre: formData.nombre,
      email: formData.email,
      telefono: formData.telefono ?? null,
      matricula: isAlumno ? formData.matricula ?? null : null,
      carrera: isAlumno ? formData.carrera ?? null : null,
      semestre: isAlumno ? formData.semestre ?? null : null,
      modalidad: isAlumno ? normalizeStudentModality(formData.modalidad) : null,
      empresa: null,
    })
  } catch (err) {
    console.error('[actualizarInformacionPerfil] Excepción no controlada:', err instanceof Error ? err.message : String(err))
    return { success: false, message: 'Error crítico al guardar la información.' }
  }
}