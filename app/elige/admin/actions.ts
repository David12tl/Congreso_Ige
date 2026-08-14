'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface AdminDashboardData {
  totalUsuarios: number
  totalEncargados: number
  totalUnidadesAcademicas: number
  totalTickets: number
  totalAlumnos: number
  totalEmpresas: number
  topZone: string
  topZoneTickets: number
  usuariosRecientes: Array<{
    id: string
    email: string | null
    id_rol: number
    created_at: string | null
  }>
  ticketsRecientes: Array<{
    id: string
    nombre: string | null
    email: string
    type: string
    purchased_at: string | null
    unidad_academica: string | null
  }>
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const supabase = await createClient()

  // 1. Conteo global de perfiles
  const { count: totalUsuarios } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  // 2. Conteo de encargados (id_rol = 2)
  const { count: totalEncargados } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('id_rol', 2)

  // 3. Conteo de unidades académicas
  const { count: totalUnidadesAcademicas } = await supabase
    .from('unidades_academicas')
    .select('*', { count: 'exact', head: true })

  // 4. Conteo total de tickets
  const { count: totalTickets } = await supabase
    .from('tickets')
    .select('*', { count: 'exact', head: true })

  // 5. Conteo de tickets por tipo
  const { count: totalAlumnos } = await supabase
    .from('tickets')
    .select('*', { count: 'exact', head: true })
    .eq('type', 'alumno')

  const { count: totalEmpresas } = await supabase
    .from('tickets')
    .select('*', { count: 'exact', head: true })
    .eq('type', 'empresa')

  // 6. Obtener la Zona con más tickets vendidos
  const { data: ticketsZones } = await supabase
    .from('tickets')
    .select('zone_id, zones(name)')

  const zoneCounts: Record<string, { name: string; count: number }> = {}

  if (ticketsZones) {
    for (const t of ticketsZones) {
      if (!t.zone_id) continue
      const zoneInfo = t.zones as { name: string } | null
      const name = zoneInfo?.name || 'Zona General'
      if (!zoneCounts[t.zone_id]) {
        zoneCounts[t.zone_id] = { name, count: 0 }
      }
      zoneCounts[t.zone_id].count++
    }
  }

  let topZone = 'Ninguna'
  let topZoneTickets = 0
  for (const z of Object.values(zoneCounts)) {
    if (z.count > topZoneTickets) {
      topZone = z.name
      topZoneTickets = z.count
    }
  }

  // 7. Últimos 5 usuarios registrados (actividad reciente)
  const { data: profilesRecientes } = await supabase
    .from('profiles')
    .select('id, email, id_rol, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  // 8. Últimos 5 tickets comprados (actividad reciente)
  const { data: ticketsRecientesRaw } = await supabase
    .from('tickets')
    .select('id, nombre, email, type, purchased_at, unidades_academicas!tickets_unidad_academica_id_fkey(nombre)')
    .order('purchased_at', { ascending: false, nullsFirst: false })
    .limit(5)

  const typedTicketsRecientes = (ticketsRecientesRaw || []) as Array<{
    id: string
    nombre: string | null
    email: string
    type: string
    purchased_at: string | null
    unidades_academicas: { nombre: string } | null
  }>

  return {
    totalUsuarios: totalUsuarios || 0,
    totalEncargados: totalEncargados || 0,
    totalUnidadesAcademicas: totalUnidadesAcademicas || 0,
    totalTickets: totalTickets || 0,
    totalAlumnos: totalAlumnos || 0,
    totalEmpresas: totalEmpresas || 0,
    topZone,
    topZoneTickets,
    usuariosRecientes: (profilesRecientes || []).map((p) => ({
      id: p.id,
      email: p.email,
      id_rol: p.id_rol,
      created_at: p.created_at,
    })),
    ticketsRecientes: typedTicketsRecientes.map((t) => ({
      id: t.id,
      nombre: t.nombre,
      email: t.email,
      type: t.type,
      purchased_at: t.purchased_at,
      unidad_academica: t.unidades_academicas?.nombre ?? null,
    })),
  }
}

export async function updateUserRole(userId: string, idRol: number) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('profiles')
    .update({ id_rol: idRol })
    .eq('id', userId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/elige/admin')
}