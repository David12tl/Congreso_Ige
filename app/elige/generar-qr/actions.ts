'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { CONGRESO_IGE_EVENT_ID } from '@/config/auditorioConfig'
import type { ActionResult } from '@/components/asientos/types'
import { generateCredentialPDF } from '@/lib/credentials/pdf-generator'
import { normalizeStudentModality } from '@/lib/tickets/modality'
import { resolveUnidadAcademicaId } from '@/lib/tickets/resolveUnidadAcademica'

// ─── INTERFACES DE DATOS ESTRICTAS ───────────────────────────────────

export interface DatosTicketParaQR {
  ticketId: string
  qrData: string
  nombre: string
  email: string
  matricula: string | null
  carrera: string | null
  semestre: string | null
  telefono: string | null
  asientoZona: string | null
  asientoBloque: string | null
  asientoFila: string | null
  asientoNumero: number | null
  tipo: string
  unidadAcademica: string | null
}

export interface AsistenteValidado {
  nombre: string
  matricula: string | null
  carrera?: string | null
  email?: string | null
  asiento: string
  tipo: string
}

export interface ResultadoValidacionQR {
  success: boolean
  message: string
  asistente?: AsistenteValidado
  ticketId?: string
}

interface SupabaseFluentBuilder {
  select: (columns?: string) => SupabaseFluentBuilder
  insert: (values: Record<string, unknown>) => Promise<{ error: unknown }>
  update: (values: Record<string, unknown>) => SupabaseFluentBuilder
  eq: (column: string, value: unknown) => SupabaseFluentBuilder
  or: (filters: string) => SupabaseFluentBuilder
  single: () => Promise<{ data: Record<string, unknown> | null; error: unknown }>
  maybeSingle: () => Promise<{ data: Record<string, unknown> | null; error: unknown }>
}

interface SupabaseBypass {
  from: (table: string) => SupabaseFluentBuilder
}

/**
 * 1. OBTENER, REPARAR Y SINCRONIZAR TICKET (Evita Duplicidad Absoluta)
 */
export async function obtenerQRData(): Promise<ActionResult & { ticket?: DatosTicketParaQR }> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, message: 'Debes iniciar sesión para acceder a esta sección.' }
  }

  const client = supabase as unknown as SupabaseBypass

  let asientoZona = 'General'
  let asientoBloque = 'Único'
  let asientoFila = 'N/A'
  let asientoNumero: number | null = null
  let qrDataFinal = `ELIGE2026|${user.id}|SIN_MATRICULA|General-Único-N/A-NA`
  let tipoFinal = 'alumno'

  const [profileRes, ticketRes] = await Promise.all([
    client.from('profiles').select('nombre, email, matricula, carrera, semestre, telefono, unidad_academica_id').eq('id', user.id).maybeSingle(),
    client.from('tickets').select('id, qr_data, nombre, email, asiento_zona, asiento_bloque, asiento_fila, asiento_numero, type, matricula, modalidad, carrera, semestre, telefono, unidad_academica_id').or(`id.eq.${user.id},buyer_id.eq.${user.id}`).maybeSingle()
  ])

  const profileData = profileRes?.data as Record<string, unknown> | null
  const ticketDb = ticketRes?.data as Record<string, unknown> | null

  const nombreFinal = (ticketDb?.nombre as string) || (profileData?.nombre as string) || 'Usuario Registrado'
  const emailFinal = (ticketDb?.email as string) || (profileData?.email as string) || user.email || ''
  const matriculaFinal = (ticketDb?.matricula as string) || (profileData?.matricula as string) || null

  if (!ticketDb) {
    return { success: false, message: 'Primero debes completar el registro o comprar un boleto.' }
  }

  if (ticketDb?.type) {
    tipoFinal = ticketDb.type as string
  }

  if (ticketDb) {
    asientoZona = (ticketDb.asiento_zona as string) || asientoZona
    asientoBloque = (ticketDb.asiento_bloque as string) || asientoBloque
    asientoFila = (ticketDb.asiento_fila as string) || asientoFila
    asientoNumero = ticketDb.asiento_numero != null ? Number(ticketDb.asiento_numero) : null
    qrDataFinal = (ticketDb.qr_data as string) || `ELIGE2026|${ticketDb.id}|${matriculaFinal || 'SIN_MATRICULA'}|${asientoZona}-${asientoBloque}-${asientoFila}-${asientoNumero}`
  }

  let unidadAcademicaId = Number(ticketDb?.unidad_academica_id || profileData?.unidad_academica_id) || null
  if (!unidadAcademicaId) {
    try {
      unidadAcademicaId = await resolveUnidadAcademicaId(supabase, user.id, user.email ?? null)
    } catch (profileError) {
      console.error('[obtenerQRData] Error al consultar Unidad Académica:', profileError)
      return { success: false, message: 'No se pudo validar tu Unidad Académica.' }
    }
  }

  if (!unidadAcademicaId) {
    return { success: false, message: 'Asigna una Unidad Académica antes de generar tu boleto.' }
  }

  const payloadBD = {
    event_id: CONGRESO_IGE_EVENT_ID,
    asiento_zona: asientoZona,
    asiento_bloque: asientoBloque,
    asiento_fila: asientoFila,
    asiento_numero: asientoNumero,
    qr_data: qrDataFinal,
    nombre: nombreFinal,
    email: emailFinal,
    type: tipoFinal,
    modalidad: tipoFinal === 'alumno'
      ? normalizeStudentModality(ticketDb?.modalidad)
      : null,
    matricula: matriculaFinal,
    carrera: profileData?.carrera || ticketDb?.carrera || null,
    semestre: profileData?.semestre || ticketDb?.semestre || null,
    telefono: profileData?.telefono || ticketDb?.telefono || null,
    unidad_academica_id: unidadAcademicaId,
  }

  const { error: updateError } = await client.from('tickets').update(payloadBD).eq('id', ticketDb.id).maybeSingle()
  if (updateError) {
    console.error('[obtenerQRData] Error al actualizar el ticket:', updateError)
    return { success: false, message: 'No se pudo actualizar tu boleto.' }
  }

  const unidadId = unidadAcademicaId
  let unidadNombre: string | null = null
  if (unidadId) {
    try {
      const { data: ua } = await client.from('unidades_academicas').select('name').eq('id', unidadId).maybeSingle() as unknown as { data: { name: string } | null }
      if (ua) unidadNombre = ua.name
    } catch {
      unidadNombre = null
    }
  }

  revalidatePath('/elige/generar-qr')

  return {
    success: true,
    message: 'Tu pase ha sido procesado de manera exitosa.',
    ticket: {
      ticketId: (ticketDb?.id as string) || user.id,
      qrData: qrDataFinal,
      nombre: nombreFinal,
      email: emailFinal,
      matricula: matriculaFinal,
      carrera: (profileData?.carrera as string) || (ticketDb?.carrera as string) || null,
      semestre: (profileData?.semestre as string) || (ticketDb?.semestre as string) || null,
      telefono: (profileData?.telefono as string) || (ticketDb?.telefono as string) || null,
      asientoZona: asientoZona,
      asientoBloque: asientoBloque,
      asientoFila: asientoFila,
      asientoNumero: asientoNumero,
      tipo: tipoFinal,
      unidadAcademica: unidadNombre,
    },
  }
}

/**
 * 2. Valida QR de boletos y tokens usados para su dueño o personal autorizado.
 */
export async function validarCodigoQR(qrData: string): Promise<ResultadoValidacionQR> {
  try {
    if (!qrData) {
      return { success: false, message: 'Código QR vacío o ilegible.' }
    }

    const qrText = qrData.trim()
    const ticketIdEnQR = qrText.match(/(?:^|\n)ID:\s*(.+)$/im)?.[1]?.trim() || qrText
    const esQRDeTicket = ticketIdEnQR.startsWith('ELIGE2026|')

    if (!ticketIdEnQR) {
      return { success: false, message: 'La estructura interna del código no contiene un identificador válido.' }
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, message: 'Debes iniciar sesión para verificar un código QR.' }
    }

    const client = supabase as unknown as SupabaseBypass
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id_rol')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError) {
      console.error('[validarCodigoQR] Error al consultar el rol:', profileError.message)
      return { success: false, message: 'No se pudo validar tu permiso para consultar el boleto.' }
    }

    const esPersonal = profile?.id_rol === 1 || profile?.id_rol === 2
    const columnasTicket = 'id, buyer_id, event_id, nombre, email, matricula, carrera, type, asiento_zona, asiento_bloque, asiento_fila, asiento_numero, qr_data'

    if (!esQRDeTicket) {
      const { data: token, error: tokenError } = await client
        .from('tokens_canje')
        .select('status, utilizado_por, event_id')
        .eq('token_code', ticketIdEnQR)
        .maybeSingle()

      if (tokenError) {
        console.error('[validarCodigoQR] Error al consultar el token:', tokenError)
        return { success: false, message: 'No se pudo consultar el token escaneado.' }
      }

      if (token) {
        if (token.status !== 'usado') {
          return { success: false, message: 'Este token todavía no está canjeado y no corresponde a un boleto asignado.' }
        }

        if (!token.utilizado_por || (token.utilizado_por !== user.id && !esPersonal)) {
          return { success: false, message: 'El token ya fue canjeado por otra persona.' }
        }

        const { data: ticket, error: ticketError } = await client
          .from('tickets')
          .select(columnasTicket)
          .eq('buyer_id', token.utilizado_por)
          .or(`event_id.eq.${token.event_id},event_id.is.null`)
          .maybeSingle() as unknown as { data: Record<string, unknown> | null; error: unknown }

        if (ticketError) {
          console.error('[validarCodigoQR] Error al consultar el boleto asignado:', ticketError)
          return { success: false, message: 'No se pudo consultar el boleto asignado al token.' }
        }

        if (!ticket) {
          return { success: false, message: 'El token está usado, pero no se encontró el boleto asignado.' }
        }

        return estructurarRespuestaExitosa(
          ticket,
          'Token ya canjeado. Estos son los datos del boleto asignado; puedes descargar su PDF.',
        )
      }
    }

    let ticketId = ticketIdEnQR
    if (ticketId.startsWith('ELIGE2026|')) {
      ticketId = ticketId.split('|')[1]?.trim() || ticketId
    }

    let t: Record<string, unknown> | null = null
    for (const [column, value] of [
      ['id', ticketId],
      ['buyer_id', ticketId],
      ['qr_data', qrText],
      ['matricula', ticketId],
    ]) {
      const { data, error } = await client
        .from('tickets')
        .select(columnasTicket)
        .eq(column, value)
        .maybeSingle() as unknown as { data: Record<string, unknown> | null; error: unknown }

      if (error) {
        console.error(`[validarCodigoQR] Error al consultar tickets por ${column}:`, error)
        return { success: false, message: 'No se pudo consultar el boleto escaneado.' }
      }

      if (data) {
        t = data
        break
      }
    }

    if (!t) {
      return {
        success: false,
        message: `El registro (${ticketIdEnQR.substring(0, 8)}...) no se encuentra indexado bajo ningún boleto activo en el sistema.`,
      }
    }

    if (t.buyer_id !== user.id && t.id !== user.id && !esPersonal) {
      return { success: false, message: 'No tienes permiso para consultar el boleto de otra persona.' }
    }

    return estructurarRespuestaExitosa(t)

  } catch (err) {
    console.error('Error interno en validación:', err)
    return { success: false, message: 'Surgió un error inesperado al procesar el código QR.' }
  }
}

// Función auxiliar para formatear la respuesta sin duplicar lógica
function estructurarRespuestaExitosa(
  t: Record<string, unknown>,
  message = '¡Acceso Autorizado! Bienvenido/a al congreso.',
): ResultadoValidacionQR {
  const zona = (t.asiento_zona as string) || 'General'
  const bloque = (t.asiento_bloque as string) || 'Único'
  const fila = (t.asiento_fila as string) || 'N/A'
  const numero = t.asiento_numero !== null ? String(t.asiento_numero) : 'N/A'
  const asientoFormateado = `${zona} (${bloque}-${fila}-${numero})`

  return {
    success: true,
    message,
    ticketId: t.id as string,
    asistente: {
      nombre: (t.nombre as string) || 'Asistente Registrado',
      matricula: (t.matricula as string) || null,
      carrera: (t.carrera as string) || null,
      email: (t.email as string) || null,
      asiento: asientoFormateado,
      tipo: (t.type as string) || 'alumno'
    }
  }
}

/**
 * 4. GENERAR Y DESCARGAR PDF DEL GAFETE DE DOCENTE/ORGANIZADOR
 */
export async function descargarGafeteDocentePDF(): Promise<{ success: boolean; pdfBase64?: string; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Debes iniciar sesión para descargar el gafete.' }
    }

    // 1. Buscamos el ticket del docente.
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select('id, nombre, email, type, qr_data, event_id, zone_id, semestre, carrera, matricula, asiento_zona')
      .eq('buyer_id', user.id)
      .eq('type', 'docente')
      .single()

    if (ticketError) throw ticketError;
    if (!ticket) {
      return { success: false, error: 'No se encontró un registro de organizador para este usuario.' }
    }

    // Validaciones para asegurar que es un gafete de organizador sin asiento asignado
    const isOrganizador =
      ticket.type === 'docente' &&
      ticket.event_id === CONGRESO_IGE_EVENT_ID &&
      ticket.zone_id === null &&
      ticket.semestre === null &&
      ticket.carrera === null &&
      ticket.matricula === null &&
      ticket.asiento_zona === null

    if (!isOrganizador) {
      return { success: false, error: 'Este ticket no corresponde a un gafete de organizador.' }
    }

    const credentialData = {
      nombre: ticket.nombre || 'Organizador',
      matricula: 'ORGANIZADOR', // Placeholder para el campo de matrícula
      carrera: 'Staff del Evento',
      asiento_zona: '', // Se envía vacío para que no se muestre en el PDF
      asiento_fila: '', // Se envía vacío para que no se muestre en el PDF
      asiento_numero: 0, // Se envía 0 para que no se muestre en el PDF
      qr_data: ticket.qr_data || ticket.id,
      email: ticket.email || user.email || '',
      isOrganizador: true, // Flag para la plantilla especial del PDF
    }

    const pdfBuffer = await generateCredentialPDF(credentialData)
    const pdfBase64 = pdfBuffer.toString('base64')

    return { success: true, pdfBase64 }
  } catch (error) {
    console.error('Error generando PDF de gafete de docente:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido al generar el PDF' }
  }
}

/**
 * 3. GENERAR Y DESCARGAR PDF DEL TICKET
 */
export async function descargarTicketPDF(ticketId?: string): Promise<{ success: boolean; pdfBase64?: string; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Debes iniciar sesión para descargar el ticket.' }
    }

    const client = supabase as unknown as SupabaseBypass

    const ticketQuery = client
      .from('tickets')
      .select('id, buyer_id, nombre, email, matricula, carrera, qr_data, asiento_zona, asiento_bloque, asiento_fila, asiento_numero')
    const { data: ticket, error: ticketError } = ticketId
      ? await ticketQuery.eq('id', ticketId).maybeSingle() as unknown as { data: Record<string, unknown> | null; error: unknown }
      : await ticketQuery
          .or(`id.eq.${user.id},buyer_id.eq.${user.id}`)
          .maybeSingle() as unknown as { data: Record<string, unknown> | null; error: unknown }

    if (ticketError) {
      console.error('[descargarTicketPDF] Error al consultar el ticket:', ticketError)
      return { success: false, error: 'No se pudo consultar el boleto en la base de datos.' }
    }
    if (!ticket) {
      return { success: false, error: 'No tienes un ticket generado.' }
    }

    if (ticket.buyer_id !== user.id && ticket.id !== user.id) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id_rol')
        .eq('id', user.id)
        .maybeSingle()

      if (profileError) {
        console.error('[descargarTicketPDF] Error al consultar el rol:', profileError.message)
        return { success: false, error: 'No se pudo validar tu permiso para descargar el boleto.' }
      }

      if (profile?.id_rol !== 1 && profile?.id_rol !== 2) {
        return { success: false, error: 'No tienes permiso para descargar el boleto de otra persona.' }
      }
    }

    const idTicket = ticket.id as string
    const nombre = (ticket.nombre as string) || 'Usuario'
    const email = (ticket.email as string) || user.email || ''
    const matricula = (ticket.matricula as string) || 'S/N'
    const carrera = (ticket.carrera as string) || 'No especificada'
    const asientoZona = (ticket.asiento_zona as string) || 'General'
    const asientoFila = (ticket.asiento_fila as string) || 'A'
    const asientoNumero = ticket.asiento_numero !== null ? Number(ticket.asiento_numero) : 0
    const qr_data = (ticket.qr_data as string) || idTicket

    const credentialData = {
      nombre,
      matricula,
      carrera,
      asiento_zona: asientoZona,
      asiento_bloque: (ticket.asiento_bloque as string | null) || null,
      asiento_fila: asientoFila,
      asiento_numero: asientoNumero,
      qr_data,
      email,
    }

    const pdfBuffer = await generateCredentialPDF(credentialData)
    const pdfBase64 = pdfBuffer.toString('base64')

    return { success: true, pdfBase64 }
  } catch (error) {
    console.error('Error generando PDF del ticket:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido al generar el PDF',
    }
  }
}
