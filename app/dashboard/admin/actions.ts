'use server'

import { createClient } from '@/src/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface DashboardData {
  totalUsuarios: number
  encargadosActivos: number
  topZone: string
  topZoneTickets: number
  usuarios: Array<{
    id: string
    email: string
    id_rol: number
    nombre_ticket: string | null
  }>
}

export async function getAdminDashboardData(): Promise<DashboardData> {
  const supabase = await createClient()

  // 1. Obtener conteos globales de perfiles
  const { count: totalUsuarios } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  const { count: encargadosActivos } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('id_rol', 2)

  // 2. Obtener la Zona con más tickets vendidos
  const { data: ticketsData } = await supabase
    .from('tickets')
    .select('zone_id, zones(name)')

  const zoneCounts: Record<string, { name: string; count: number }> = {}

  if (ticketsData) {
    for (const t of ticketsData) {
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

  // 3. Obtener lista de usuarios cruzando perfiles con su nombre en tickets
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, id_rol')
    .order('created_at', { ascending: false })

  const { data: tickets } = await supabase
    .from('tickets')
    .select('buyer_id, nombre')

  const typedProfiles = profiles ?? []
  const typedUserTickets = tickets ?? []

  // Mapeamos asociando el nombre real si el usuario compró un ticket
  const usuariosMapped = typedProfiles.map((profile) => {
    const ticketAsociado = typedUserTickets.find((t) => t.buyer_id === profile.id)
    return {
      id: profile.id,
      email: profile.email ?? 'Sin correo',
      id_rol: profile.id_rol,
      nombre_ticket: ticketAsociado?.nombre ?? 'Usuario Registrado',
    }
  })

  return {
    totalUsuarios: totalUsuarios || 0,
    encargadosActivos: encargadosActivos || 0,
    topZone,
    topZoneTickets,
    usuarios: usuariosMapped,
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

  revalidatePath('/dashboard/admin')
}
