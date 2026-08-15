'use server'

import { createClient } from '@/lib/supabase/server'

export interface UsuarioUA {
  id: string
  nombre: string | null
  email: string
  carrera: string | null
  semestre: string | null
  matricula: string | null
  unidad_academica: string | null
  id_rol: string | null
  created_at: string
}

export async function getUsuariosPorUA(): Promise<UsuarioUA[]> {
  const supabase = await createClient()

  // 1. Consultar en paralelo las tablas profiles, roles y unidades_academicas
  const [profilesRes, rolesRes, uaRes] = await Promise.all([
    supabase.from('profiles').select('*'),
    supabase.from('roles').select('*'),
    supabase.from('unidades_academicas').select('*'),
  ])

  if (profilesRes.error || !profilesRes.data) {
    console.error('Error al obtener profiles:', profilesRes.error)
    return []
  }

  const profilesData = profilesRes.data
  const rolesData = rolesRes.data || []
  const uaData = uaRes.data || []

  // 2. Filtrar estrictamente los usuarios con rol 3 (id_rol o role_id)
  const perfilesUsuarios = profilesData.filter((p: any) => {
    return Number(p.id_rol) === 3 || Number(p.role_id) === 3
  })

  if (perfilesUsuarios.length === 0) {
    return []
  }

  // 3. Obtener los IDs de los usuarios para consultar sus tickets usando 'buyer_id'
  const userIds = perfilesUsuarios.map((p: any) => p.id)

  const { data: ticketsData, error: ticketsError } = await supabase
    .from('tickets')
    .select('*')
    .in('buyer_id', userIds)

  if (ticketsError) {
    console.error('Error al obtener tickets:', ticketsError)
  }

  const ticketsList = ticketsData || []

  // 4. Crear mapas para traducir IDs numéricos a nombres legibles
  const rolesMap = new Map()
  rolesData.forEach((r: any) => {
    rolesMap.set(Number(r.id_rol), r.nombre_rol)
  })

  const uaMap = new Map()
  uaData.forEach((ua: any) => {
    uaMap.set(Number(ua.id), ua.nombre)
  })

  // 5. Mapear y fusionar toda la información correctamente
  return perfilesUsuarios.map((p: any): UsuarioUA => {
    // Relacionar perfil con ticket mediante buyer_id
    const ticket = ticketsList.find((t: any) => t.buyer_id === p.id)

    // Obtener el nombre de la unidad académica (puede estar en el perfil o en el ticket)
    const uaId = p.unidad_academica_id || ticket?.unidad_academica_id
    const nombreUA = uaId ? uaMap.get(Number(uaId)) || null : null

    // Obtener el nombre del rol desde la tabla roles
    const rolId = Number(p.id_rol) || Number(p.role_id) || 3
    const nombreRol = rolesMap.get(rolId) || `Rol ${rolId}`

    return {
      id: p.id,
      nombre: ticket?.nombre || null,
      email: p.email || '',
      carrera: ticket?.carrera || null,
      semestre: ticket?.semestre ? String(ticket.semestre) : null,
      matricula: ticket?.matricula || null,
      unidad_academica: nombreUA,
      id_rol: nombreRol,
      created_at: p.created_at,
    }
  })
}