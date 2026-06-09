'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/src/lib/supabase/server'
import type { ActionResult } from '@/src/components/asientos/types'

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
  asiento: string
  tipo: string
}

export interface ResultadoValidacionQR {
  success: boolean
  message: string
  asistente?: AsistenteValidado
}

interface SupabaseFluentBuilder {
  select: (columns?: string) => SupabaseFluentBuilder
  insert: (values: Record<string, unknown>) => SupabaseFluentBuilder
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

  const [profileRes, tokenRes, ticketRes] = await Promise.all([
    client.from('profiles').select('nombre, email, matricula, carrera, semestre, telefono, unidad_academica_id').eq('id', user.id).maybeSingle(),
    client.from('tokens_canje').select('id, seat_id, type').eq('utilizado_por', user.id).maybeSingle(),
    client.from('tickets').select('id, qr_data, nombre, email, asiento_zona, asiento_bloque, asiento_fila, asiento_numero, type, matricula, carrera, semestre, telefono, unidad_academica_id').or(`id.eq.${user.id},buyer_id.eq.${user.id}`).maybeSingle()
  ])

  const profileData = profileRes?.data as Record<string, unknown> | null
  const tokenData = tokenRes?.data as { id: string; seat_id: string | null; type: string } | null
  const ticketDb = ticketRes?.data as Record<string, unknown> | null

  const nombreFinal = (ticketDb?.nombre as string) || (profileData?.nombre as string) || 'Usuario Registrado'
  const emailFinal = (ticketDb?.email as string) || (profileData?.email as string) || user.email || ''
  const matriculaFinal = (ticketDb?.matricula as string) || (profileData?.matricula as string) || null

  if (tokenData?.type) {
    tipoFinal = tokenData.type === 'empresa' ? 'empresa' : 'alumno'
  } else if (ticketDb?.type) {
    tipoFinal = ticketDb.type as string
  }

  if (ticketDb && ticketDb.asiento_fila && ticketDb.asiento_fila !== 'N/A') {
    asientoZona = (ticketDb.asiento_zona as string) || 'General'
    asientoBloque = (ticketDb.asiento_bloque as string) || 'Único'
    asientoFila = (ticketDb.asiento_fila as string) || 'N/A'
    asientoNumero = ticketDb.asiento_numero !== null ? Number(ticketDb.asiento_numero) : null
    qrDataFinal = (ticketDb.qr_data as string) || `ELIGE2026|${ticketDb.id}|${matriculaFinal || 'SIN_MATRICULA'}|${asientoZona}-${asientoBloque}-${asientoFila}-${asientoNumero}`
  } else if (tokenData?.seat_id) {
    const { data: seatData } = await client
      .from('seats')
      .select('zona, bloque, fila, numero')
      .eq('id', tokenData.seat_id)
      .maybeSingle() as unknown as { data: { zona: string; bloque: string; fila: string; numero: number } | null }

    if (seatData) {
      asientoZona = seatData.zona
      asientoBloque = seatData.bloque
      asientoFila = seatData.fila
      asientoNumero = Number(seatData.numero)
      qrDataFinal = `ELIGE2026|${ticketDb?.id || user.id}|${matriculaFinal || 'SIN_MATRICULA'}|${asientoZona}-${asientoBloque}-${asientoFila}-${asientoNumero}`
    }
  }

  try {
    const payloadBD = {
      asiento_zona: asientoZona,
      asiento_bloque: asientoBloque,
      asiento_fila: asientoFila,
      asiento_numero: asientoNumero,
      qr_data: qrDataFinal,
      nombre: nombreFinal,
      email: emailFinal,
      type: tipoFinal,
      matricula: matriculaFinal,
      carrera: profileData?.carrera || null,
      semestre: profileData?.semestre || null,
      telefono: profileData?.telefono || null,
      offset_asiento: null,
      unidad_academica_id: profileData?.unidad_academica_id || null
    }

    if (ticketDb) {
      if (ticketDb.asiento_fila === 'N/A' && asientoFila !== 'N/A') {
        await client.from('tickets').update({
          asiento_zona: asientoZona,
          asiento_bloque: asientoBloque,
          asiento_fila: asientoFila,
          asiento_numero: asientoNumero,
          qr_data: qrDataFinal
        }).eq('id', ticketDb.id)
      }
    } else {
      await client.from('tickets').insert({
        id: user.id,
        buyer_id: user.id,
        ...payloadBD
      })
    }
  } catch (dbError) {
    console.warn('⚠️ Nota sobre base de datos:', dbError)
  }

  const unidadId = ticketDb?.unidad_academica_id || profileData?.unidad_academica_id
  let unidadNombre: string | null = null
  if (unidadId) {
    try {
      const { data: ua } = await client.from('unidades_academicas').select('name').eq('id', unidadId).maybeSingle() as unknown as { data: { name: string } | null }
      if (ua) unidadNombre = ua.name
    } catch {
      unidadNombre = null
    }
  }

  revalidatePath('/dashboard/generar-qr')

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
 * 2. PROCESAR Y VALIDAR CÓDIGO QR PARA EL ENCARGADO / STAFF
 * ¡Buscador ultra-flexible para evitar falsos negativos escaneando UUID, Texto Largo o Matrícula!
 */
export async function validarCodigoQR(qrData: string): Promise<ResultadoValidacionQR> {
  try {
    if (!qrData) {
      return { success: false, message: 'Código QR vacío o ilegible.' }
    }

    let ticketIdEnQR = qrData.trim()

    // Si viene en formato extendido, extraemos el ID central
    if (qrData.startsWith('ELIGE2026|')) {
      const partes = qrData.split('|')
      ticketIdEnQR = partes[1]?.trim() || qrData.trim()
    }

    if (!ticketIdEnQR) {
      return { success: false, message: 'La estructura interna del código no contiene un identificador válido.' }
    }

    const supabase = await createClient()
    const client = supabase as unknown as SupabaseBypass

    // Ampliamos .or para verificar id primario, id de comprador o coincidencia parcial en la columna completa de qr_data
    const { data: t, error } = await client
      .from('tickets')
      .select('id, nombre, matricula, type, asiento_zona, asiento_bloque, asiento_fila, asiento_numero, qr_data')
      .or(`id.eq.${ticketIdEnQR},buyer_id.eq.${ticketIdEnQR},qr_data.ilike.%${ticketIdEnQR}%`)
      .maybeSingle() as unknown as { data: Record<string, unknown> | null; error: unknown }

    // Si por alguna razón sigue sin aparecer, hacemos un fallback directo por Matrícula escolar
    if (error || !t) {
      const { data: tPorMatricula } = await client
        .from('tickets')
        .select('id, nombre, matricula, type, asiento_zona, asiento_bloque, asiento_fila, asiento_numero')
        .eq('matricula', ticketIdEnQR)
        .maybeSingle() as unknown as { data: Record<string, unknown> | null; error: unknown }

      if (!tPorMatricula) {
        return { 
          success: false, 
          message: `El registro (${ticketIdEnQR.substring(0, 8)}...) no se encuentra indexado bajo ningún boleto activo en el sistema.` 
        }
      }
      
      return estructurarRespuestaExitosa(tPorMatricula)
    }

    return estructurarRespuestaExitosa(t)

  } catch (err) {
    console.error('Error interno en validación:', err)
    return { success: false, message: 'Surgió un error inesperado al procesar el código QR.' }
  }
}

// Función auxiliar para formatear la respuesta sin duplicar lógica
function estructurarRespuestaExitosa(t: Record<string, unknown>): ResultadoValidacionQR {
  const zona = (t.asiento_zona as string) || 'General'
  const bloque = (t.asiento_bloque as string) || 'Único'
  const fila = (t.asiento_fila as string) || 'N/A'
  const numero = t.asiento_numero !== null ? String(t.asiento_numero) : 'N/A'
  const asientoFormateado = `${zona} (${bloque}-${fila}-${numero})`

  return {
    success: true,
    message: '¡Acceso Autorizado! Bienvenido/a al congreso.',
    asistente: {
      nombre: (t.nombre as string) || 'Asistente Registrado',
      matricula: (t.matricula as string) || null,
      asiento: asientoFormateado,
      tipo: (t.type as string) || 'alumno'
    }
  }
}