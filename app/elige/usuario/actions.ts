'use server'

import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database.types'

type TicketInsert = Database['public']['Tables']['tickets']['Insert']

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

    const isAlumno = formData.tipo === 'alumno'

    // 💡 PAYLOAD TIPIFICADO: Usa el tipo Insert de la tabla tickets para evitar errores de TypeScript
    const updatePayload: TicketInsert = {
      buyer_id: user.id,
      nombre: formData.nombre,
      email: formData.email,
      type: isAlumno ? 'alumno' : 'empresa',
      matricula: isAlumno ? (formData.matricula ?? null) : null,
      unidad_academica_id: formData.unidad_academica
        ? Number(formData.unidad_academica) || null
        : null,
      semestre: isAlumno ? (formData.semestre ?? null) : null,
      carrera: isAlumno ? (formData.carrera ?? null) : null,
      telefono: !isAlumno ? (formData.telefono ?? null) : null,
      // La columna modalidad solo acepta 'escolarizado' | 'mixto' | null en la base de datos
      modalidad: isAlumno
        ? (formData.modalidad === 'escolarizado' || formData.modalidad === 'mixto'
            ? formData.modalidad
            : 'escolarizado')
        : null,
    }

    const { error: updateError } = await supabase
      .from('tickets')
      .upsert(updatePayload, { onConflict: 'buyer_id' })

    if (updateError) {
      console.error("🛑 Error Detallado de Postgres en el Servidor:", updateError.message)
      return { success: false, message: `Error de escritura en tickets: ${updateError.message}` }
    }

    return { success: true, message: '¡Información guardada exitosamente!' }
  } catch (err) {
    console.error('[actualizarInformacionPerfil] Excepción no controlada:', err instanceof Error ? err.message : String(err))
    return { success: false, message: 'Error crítico al guardar la información.' }
  }
}