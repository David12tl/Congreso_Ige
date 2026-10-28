'use server'

import { createClient } from '@/lib/supabase/server'

export interface ResumenDashboard {
  userEmail: string | null
  hasTicket: boolean
  eventName: string
  daysLeft: number
  ticketType: string | null
}

interface DBEventRow {
  name: string
  start_date: string
}

interface DBTicketRow {
  type: string
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

    const typedClient = supabase as unknown as {
      from: (table: string) => {
        select: (columns?: string) => {
          eq: (column: string, value: string) => {
            maybeSingle: () => Promise<{ data: DBTicketRow | null; error: unknown }>
          }
          limit: (n: number) => {
            maybeSingle: () => Promise<{ data: DBEventRow | null; error: unknown }>
          }
        }
      }
    }

    const { data: ticket } = await typedClient
      .from('tickets')
      .select('type')
      .eq('buyer_id', user.id)
      .maybeSingle()

    const { data: evento } = await typedClient
      .from('events')
      .select('name, start_date')
      .limit(1)
      .maybeSingle()

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

export interface AsientoInfo {
  id: string
  zona: string
  bloque: string
  fila: string
  numero: number
  estado: string
  tipo: string
}

export async function getMiQR(): Promise<string | null> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: ticket, error } = await supabase
      .from('tickets')
      .select('id, zone_id, asiento_zona, asiento_bloque, asiento_fila, asiento_numero')
      .eq('buyer_id', user.id)
      .maybeSingle()

    if (error || !ticket) return null

    const ticketId = (ticket as { id: string }).id
    const qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(ticketId)}`

    return qrCode
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

    const updatePayload = {
      buyer_id: user.id,
      nombre: formData.nombre,
      email: formData.email,
      type: formData.tipo === 'alumno' ? 'alumno' : 'empresa',
      matricula: formData.tipo === 'alumno' ? (formData.matricula ?? null) : null,
      unidad_academica: formData.tipo === 'alumno' ? (formData.unidad_academica ?? null) : null,
      semestre: formData.tipo === 'alumno' ? (formData.semestre ?? null) : null,
      carrera: formData.tipo === 'alumno' ? (formData.carrera ?? null) : null,
      telefono: formData.tipo === 'empresa' ? (formData.telefono ?? null) : null,
    }

    const { error: updateError } = await supabase
      .from('tickets')
      .upsert(
        updatePayload as never,
        { onConflict: 'buyer_id' }
      )

    if (updateError) {
      console.error("🛑 Error Detallado de Postgres en el Servidor:", updateError)
      return { success: false, message: `Error de escritura en la base de datos de tickets: ${updateError.message}` }
    }

    return { success: true, message: '¡Información guardada exitosamente!' }
  } catch (err) {
    console.error('[actualizarInformacionPerfil] Excepción no controlada:', err instanceof Error ? err.message : String(err))
    return { success: false, message: 'Error crítico al guardar la información.' }
  }
}
