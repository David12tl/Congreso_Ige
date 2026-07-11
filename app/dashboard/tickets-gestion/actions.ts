'use server'

import { createClient } from '@/lib/supabase/server'

export interface TicketGestionado {
  id: string
  nombre: string
  email: string
  matricula: string | null
  asiento_zona: string | null
  asiento_bloque: string | null
  asiento_fila: string | null
  asiento_numero: number | null
  type: string
  created_at: string
  unidades_academicas?: {
    nombre: string
  } | null
}

export interface MetricasFinancieras {
  totalTicketsEmitidos: number
  cantidadPagados: number
  cantidadPendientes: number
  montoTotalRecaudado: number
  montoTotalPendiente: number
  montoTotalProyectado: number
}

export interface AsistenteTicket {
  id: string
  nombre: string | null
  email: string
  matricula: string | null
  carrera: string | null
  semestre: string | null
  unidad_academica: string | null
  type: string
}

/**
 * Obtiene los asistentes por unidad académica para el encargado
 */
export async function getAsistentesPorUA(): Promise<AsistenteTicket[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  // Verificar permisos de encargado/admin
  const { data: perfil } = await supabase
    .from('profiles')
    .select('id_rol, unidad_academica_id')
    .eq('id', user.id)
    .maybeSingle()

  if (!perfil || (perfil as { id_rol: number }).id_rol !== 2) {
    return []
  }

  const unidadId = (perfil as { unidad_academica_id: number | null }).unidad_academica_id

  if (!unidadId) {
    return []
  }

  const { data: tickets, error } = await (supabase
    .from('tickets')
    .select('id, nombre, email, matricula, carrera, semestre, unidad_academica, type')
    .eq('unidad_academica_id', unidadId)
    .order('created_at', { ascending: false }) as unknown as Promise<{ data: AsistenteTicket[] | null; error: unknown }>)

  if (error) {
    console.error('[getAsistentesPorUA] Error:', (error as { message: string }).message)
    return []
  }

  return tickets || []
}

export async function obtenerTicketsPorRol() {
  const supabase = await createClient()
  
  // 1. Verificar autenticación del usuario
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('No autorizado. Tu sesión de Supabase Auth no es válida o expiró.')
  }

  // 2. Obtener el perfil plano del usuario
  const { data: perfil, error: perfilError } = await supabase
    .from('profiles')
    .select('unidad_academica_id, id_rol')
    .eq('id', user.id)
    .maybeSingle()

  if (perfilError || !perfil) {
    throw new Error(`Error al obtener el perfil del usuario: ${JSON.stringify(perfilError)}`)
  }

  // 3. Obtener el rol y nivel de acceso
  const { data: rol, error: rolError } = await supabase
    .from('roles')
    .select('id_rol, nombre_rol, nivel_acceso')
    .eq('id_rol', perfil.id_rol)
    .maybeSingle()

  if (rolError || !rol) {
    throw new Error('No se pudo recuperar la configuración de roles del usuario.')
  }

  const nombre_rol = rol.nombre_rol
  const nivel_acceso = rol.nivel_acceso ?? 1
  const unidadEncargado = perfil.unidad_academica_id

  // 4. Control de Seguridad por Niveles
  if (nivel_acceso < 2) {
    throw new Error(`Acceso denegado. Se requiere rol de Encargado o Administrador para auditar métricas.`)
  }

  // 5. Construcción de Query para Listado de Tickets
  const queryTickets = supabase
    .from('tickets')
    .select(`
      id, 
      nombre, 
      email, 
      matricula, 
      asiento_zona, 
      asiento_bloque, 
      asiento_fila, 
      asiento_numero, 
      type, 
      created_at:purchased_at, 
      unidad_academica_id, 
      unidades_academicas:unidad_academica_id(nombre)
    `)

  // 6. Aplicar filtros de segmentación si es Encargado (Nivel 2)
  if (nivel_acceso === 2) {
    if (!unidadEncargado) {
      return {
        success: true,
        tickets: [],
        metricas: { totalTicketsEmitidos: 0, cantidadPagados: 0, cantidadPendientes: 0, montoTotalRecaudado: 0, montoTotalPendiente: 0, montoTotalProyectado: 0 },
        vista: nombre_rol,
        unidadEspecifica: true
      }
    }
    queryTickets.eq('unidad_academica_id', unidadEncargado)
  }

  // Ejecutar consulta de listado de boletos
  const { data: tickets, error: ticketsError } = await queryTickets.order('purchased_at', { ascending: false })
  if (ticketsError) {
    throw new Error(`Error al consultar tickets: ${ticketsError.message}`)
  }

  // 7. Cálculo Dinámico de Métricas (Se corrigió a const para cumplir ESLint)
  const metricasQuery = supabase
    .from('tickets')
    .select(`
      id,
      estatus_pago,
      zones:zone_id(price)
    `)

  if (nivel_acceso === 2 && unidadEncargado) {
    metricasQuery.eq('unidad_academica_id', unidadEncargado)
  }

  const { data: metricasRaw, error: metricasError } = await metricasQuery

  if (metricasError) {
    console.error('Error calculando finanzas:', metricasError)
  }

  // Inicialización de la estructura de métricas financieras
  const metricas: MetricasFinancieras = {
    totalTicketsEmitidos: 0,
    cantidadPagados: 0,
    cantidadPendientes: 0,
    montoTotalRecaudado: 0,
    montoTotalPendiente: 0,
    montoTotalProyectado: 0
  }

  if (metricasRaw) {
    // Forzamos un mapeo estricto del tipado dinámico para mitigar el SelectQueryError de Supabase
    const registrosMapeados = metricasRaw as unknown as Array<{
      id: string
      estatus_pago: string | null
      zones: { price: number } | null
    }>

    metricas.totalTicketsEmitidos = registrosMapeados.length
    
    registrosMapeados.forEach(ticket => {
      const precioBoleto = ticket.zones?.price ? Number(ticket.zones.price) : 0
      const estatus = ticket.estatus_pago || 'pending'
      
      const esPagado = estatus === 'pagado' || estatus === 'completed'
      const esPendiente = estatus === 'pending'

      if (esPagado) {
        metricas.cantidadPagados++
        metricas.montoTotalRecaudado += precioBoleto
      } else if (esPendiente) {
        metricas.cantidadPendientes++
        metricas.montoTotalPendiente += precioBoleto
      }
      
      metricas.montoTotalProyectado += precioBoleto
    })
  }

  return {
    success: true,
    tickets: (tickets || []) as unknown as TicketGestionado[],
    metricas,
    vista: nombre_rol,
    unidadEspecifica: nivel_acceso === 2
  }
}