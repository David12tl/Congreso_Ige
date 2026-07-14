'use server'

import { createClient } from '@/lib/supabase/server'
import type { PerfilUsuarioCompleto } from '@/components/asientos/types'

export interface AsientoInfo {
  id: string
  zona: string
  bloque: string
  fila: string
  numero: number
  estado: string
  tipo: string
}

interface PreRegistroInput {
  zoneId: string
  asientoZona: string
  asientoBloque: string
  asientoFila: string
  asientoNumero: number
  nombre: string
  matricula: string | null
  carrera: string | null
  empresa: string | null
  puesto: string | null
}

interface TicketRow {
  id: string
  zone_id: string | null
  asiento_zona: string | null
  asiento_bloque: string | null
  asiento_fila: string | null
  asiento_numero: number | null
  type: string
  estatus_pago: string | null
}

/**
 * Obtiene el perfil completo del usuario autenticado de forma resiliente.
 */
export async function getMiPerfilCompleto(): Promise<PerfilUsuarioCompleto | null> {
  try {
    const supabase = await createClient()

    // 1. Validar estrictamente la sesión con el servidor de Supabase usando getUser
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return null
    }

    // 2. Consultar el perfil según las columnas existentes en la base de datos
    const { data: perfil, error: dbError } = await supabase
      .from('profiles') 
      .select('id, id_rol, unidad_academica_id')
      .eq('id', user.id)
      .maybeSingle()

    if (dbError) {
      return {
        id: user.id,
        email: user.email || '',
        completo: false,
        nombre: user.user_metadata?.nombre || user.user_metadata?.full_name || '',
        tipo: 'alumno'
      } as unknown as PerfilUsuarioCompleto
    }

    // 3. Usuario en Auth sin fila en profiles — se intenta auto-insertar
    if (!perfil) {
      try {
        await supabase.from('profiles').insert({
          id: user.id,
          email: user.email
        })
      } catch {
        // Auto-inserción fallida: se continúa con datos de Auth
      }

      return {
        id: user.id,
        email: user.email || '',
        completo: false,
        nombre: user.user_metadata?.nombre || user.user_metadata?.full_name || '',
        tipo: 'alumno'
      } as unknown as PerfilUsuarioCompleto
    }

    // 4. Mapear y calcular el perfil usando la metadata de Auth
    const nombreUsuario = user.user_metadata?.nombre || user.user_metadata?.full_name || ''
    const completo = !!nombreUsuario.trim()

    return {
      id: perfil.id,
      email: user.email || '',
      nombre: nombreUsuario,
      tipo: perfil.id_rol === 2 ? 'externo' : 'alumno',
      completo
    } as unknown as PerfilUsuarioCompleto

  } catch {
    return null
  }
}

/**
 * Verifica si el usuario actual ya posee un boleto comprado o un pre-registro activo
 */
export async function getMiTicketExistente() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // Consultamos únicamente campos genéricos válidos de infraestructura para tickets
    const { data: ticket, error } = await supabase
      .from('tickets')
      .select('id')
      .or(`buyer_id.eq.${user.id},email.eq.${user.email}`)
      .maybeSingle()

    if (error) {
      console.error('❌ [getMiTicketExistente] Error al buscar ticket:', error.message)
      return null
    }

    if (!ticket) {
      return null
    }

    return {
      tieneTicket: true,
      ticketId: ticket.id,
      estatusPago: 'pendiente',
      asientoInfo: 'Asiento Reservado'
    }

  } catch (error) {
    console.error('💥 [getMiTicketExistente] Excepción en servidor:', error)
    return null
  }
}

/**
 * Obtiene los asientos del usuario autenticado
 */
export async function getMisAsientos(): Promise<AsientoInfo[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data: tickets, error } = await (supabase
    .from('tickets')
    .select('id, zone_id, asiento_zona, asiento_bloque, asiento_fila, asiento_numero, type, estatus_pago')
    .eq('buyer_id', user.id) as unknown as Promise<{ data: TicketRow[] | null; error: unknown }>)

  if (error) {
    console.error('[getMisAsientos] Error:', (error as { message: string }).message)
    return []
  }

  return (tickets || []).map((t) => ({
    id: t.id,
    zona: t.asiento_zona || 'Sin zona',
    bloque: t.asiento_bloque || 'Sin bloque',
    fila: t.asiento_fila || 'Sin fila',
    numero: t.asiento_numero || 0,
    estado: t.estatus_pago || 'pendiente',
    tipo: t.type || 'alumno'
  }))
}

/**
 * Genera el registro provisional (Pre-Registro) bloqueando la butaca en el mapa
 */
export async function crearPreRegistro(input: PreRegistroInput) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, message: 'Sesión expirada. Por favor vuelve a iniciar sesión.' }
    }

    const emailUsuario = user.email
    if (!emailUsuario) {
      return { success: false, message: 'Tu cuenta no tiene un correo electrónico válido.' }
    }

    // Insertar el registro mapeando los parámetros dinámicos del 'input'
    // Se añade el campo 'type' (exigido por tu base de datos) y 'zone_id' si tu tabla los requiere.
    const { error } = await supabase
      .from('tickets')
      .insert({
        buyer_id: user.id,
        email: emailUsuario,
        asiento_zona: input.asientoZona,
        asiento_bloque: input.asientoBloque,
        asiento_fila: input.asientoFila,
        asiento_numero: input.asientoNumero,
        zone_id: input.zoneId,
        type: input.matricula ? 'alumno' : 'externo' // Cumple con el NOT NULL obligatorio 'type'
      })

    if (error) {
      console.error('❌ [crearPreRegistro] Error de inserción:', error.message)
      return { success: false, message: `Error de base de datos: ${error.message}` }
    }

    return { 
      success: true, 
      message: 'Tu asiento ha sido apartado provisionalmente. Recuerda acudir a la brevedad a liquidarlo para asegurar tu asistencia.' 
    }

  } catch {
    return { success: false, message: 'Ocurrió un error inesperado al procesar tu solicitud.' }
  }
}