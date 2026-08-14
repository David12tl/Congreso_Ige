'use server'

import { createClient } from '@/lib/supabase/server'

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

export async function obtenerTicketsPorRol() {
  const supabase = await createClient()
  
  // 1. Obtener usuario autenticado
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('No autorizado. Tu sesión de Supabase Auth no es válida o expiró.')
  }

  // 2. Obtener el perfil y la unidad académica del usuario
  const { data: perfil, error: perfilError } = await supabase
    .from('profiles')
    .select('unidad_academica_id, id_rol')
    .eq('id', user.id)
    .maybeSingle()

  if (perfilError || !perfil) {
    throw new Error(`Error al obtener el perfil: ${perfilError?.message}`)
  }

  // 3. Obtener el nivel de acceso del rol
  const { data: rol, error: rolError } = await supabase
    .from('roles')
    .select('nivel_acceso')
    .eq('id_rol', perfil.id_rol)
    .maybeSingle()

  if (rolError || !rol) {
    throw new Error('No se pudo recuperar la configuración del rol.')
  }

  const nivel_acceso = rol.nivel_acceso ?? 1
  const unidadEncargado = perfil.unidad_academica_id

  // Control de seguridad: Mínimo Nivel 2
  if (nivel_acceso < 2) {
    throw new Error('Acceso denegado. Se requiere nivel 2 o superior.')
  }

  // 4. Construir la consulta principal a la tabla tickets
  // Hacemos un join automático con unidades_academicas para sacar el nombre
  let queryTickets = supabase
    .from('tickets')
    .select(`
      id, 
      nombre, 
      email, 
      matricula, 
      carrera, 
      semestre, 
      type, 
      unidades_academicas(nombre)
    `)

  // 5. REGLA DE NEGOCIO: Filtrar según el Nivel de Acceso
  // Si es Nivel 3 (Admin), la consulta corre tal cual (trae TODOS)
  // Si es Nivel 2 (Encargado), filtramos por la unidad del perfil
  if (nivel_acceso === 2) {
    if (!unidadEncargado) {
      // Si por alguna razón es Nivel 2 pero no tiene unidad asignada en su perfil, no mostramos nada
      return { success: true, tickets: [] } 
    }
    queryTickets = queryTickets.eq('unidad_academica_id', unidadEncargado)
  }

  // 6. Ejecutar la consulta ordenando por los más recientes
  const { data: ticketsData, error: ticketsError } = await queryTickets.order('purchased_at', { ascending: false })
  
  if (ticketsError) {
    throw new Error(`Error al consultar tickets: ${ticketsError.message}`)
  }

  // 7. Formatear y mapear los datos para la interfaz AsistenteTicket
  const asistentes: AsistenteTicket[] = (ticketsData || []).map((t: any) => ({
    id: t.id,
    nombre: t.nombre,
    email: t.email,
    matricula: t.matricula,
    carrera: t.carrera,
    semestre: t.semestre,
    // Extraemos el string del objeto anidado generado por Supabase
    unidad_academica: t.unidades_academicas?.nombre || 'No Especificada',
    type: t.type
  }))

  return {
    success: true,
    tickets: asistentes
  }
}