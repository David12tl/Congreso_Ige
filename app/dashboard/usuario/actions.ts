'use server'

import { createClient } from '@/src/lib/supabase/server'

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
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  const resultadoPorDefecto: ResumenDashboard = {
    userEmail: user?.email || null,
    hasTicket: false,
    eventName: 'Congreso IGE 2026',
    daysLeft: 0,
    ticketType: null
  }

  if (authError || !user) return resultadoPorDefecto

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
}

export async function actualizarInformacionPerfil(formData: UpdateAsistenteData): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, message: 'Sesión expirada o no válida.' }

  // Aseguramos mapeo idéntico a las columnas minúsculas de tu DB
  const updatePayload = formData.tipo === 'alumno' 
    ? {
        buyer_id: user.id,
        nombre: formData.nombre,
        email: formData.email,
        matricula: formData.matricula || null,
        unidad_academica: formData.unidad_academica || null,
        semestre: formData.semestre || null,
        carrera: formData.carrera || null,
        type: 'alumno'
      }
    : {
        buyer_id: user.id,
        nombre: formData.nombre,
        email: formData.email,
        telefono: formData.telefono || null,
        type: 'empresa'
      }

  const { error: updateError } = await supabase
    .from('tickets')
    .upsert(
      updatePayload as unknown as Record<string, string | number | null | undefined>, 
      { onConflict: 'buyer_id' }
    )

  if (updateError) {
    // Esto imprimirá el código de error exacto (ej. 42501 de RLS o 23503 de FK) en tu terminal
    console.error("🛑 Error Detallado de Postgres en el Servidor:", updateError)
    return { success: false, message: `Error de escritura en la base de datos de tickets: ${updateError.message}` }
  }

  return { success: true, message: '¡Información guardada exitosamente!' }
}