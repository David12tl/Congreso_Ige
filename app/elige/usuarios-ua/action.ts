'use server'

import { createClient } from '@/lib/supabase/server'

export interface UsuarioUA {
  id: string
  nombre: string | null
  email: string
  carrera: string | null
  semestre: string | null
  matricula: string | null
  modalidad: 'escolarizado' | 'mixto' | null
  unidad_academica: string | null
  id_rol: string | null
  created_at: string
}

// Tipos de fila de las tablas consultadas (evitan el uso de `any`)
interface ProfileFila {
  id: string
  email: string | null
  id_rol: number
  role_id?: number | null
  unidad_academica_id?: number | null
  created_at: string
}

interface RoleFila {
  id_rol: number
  nombre_rol: string
}

interface UnidadAcademicaFila {
  id: number
  nombre: string
}

interface TicketFila {
  id: string
  buyer_id: string
  nombre: string | null
  email: string
  carrera: string | null
  semestre: string | null
  matricula: string | null
  modalidad: 'escolarizado' | 'mixto' | null
  unidad_academica_id: number | null
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

  const profilesData = profilesRes.data as ProfileFila[]
  const rolesData = (rolesRes.data as RoleFila[]) || []
  const uaData = (uaRes.data as UnidadAcademicaFila[]) || []

  // 2. Filtrar estrictamente los usuarios con rol 3 (id_rol o role_id)
  const perfilesUsuarios = profilesData.filter((p) => {
    return Number(p.id_rol) === 3 || Number(p.role_id) === 3
  })

  if (perfilesUsuarios.length === 0) {
    return []
  }

  // 3. Obtener los IDs de los usuarios para consultar sus tickets usando 'buyer_id'
  const userIds = perfilesUsuarios.map((p) => p.id)

  const { data: ticketsData, error: ticketsError } = await supabase
    .from('tickets')
    .select('*')
    .in('buyer_id', userIds)

  if (ticketsError) {
    console.error('Error al obtener tickets:', ticketsError)
  }

  const ticketsList = (ticketsData as TicketFila[]) || []

  // 4. Crear mapas para traducir IDs numéricos a nombres legibles
  const rolesMap = new Map<number, string>()
  rolesData.forEach((r) => {
    rolesMap.set(Number(r.id_rol), r.nombre_rol)
  })

  const uaMap = new Map<number, string>()
  uaData.forEach((ua) => {
    uaMap.set(Number(ua.id), ua.nombre)
  })

  // 5. Mapear y fusionar toda la información correctamente
  return perfilesUsuarios.map((p): UsuarioUA => {
    // Relacionar perfil con ticket mediante buyer_id
    const ticket = ticketsList.find((t) => t.buyer_id === p.id)

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
      modalidad: ticket?.modalidad || null,
      unidad_academica: nombreUA,
      id_rol: nombreRol,
      created_at: p.created_at,
    }
  })
}