'use server'

// 1. Añadimos la importación que le hace falta a tu linter
import { createClient } from '@/src/lib/supabase/server';

export interface PerfilUsuario {
  email: string | null
  createdAt: string
  rolNombre: string
  nivelAcceso: number
}

interface SupabaseProfileJoin {
  email: string | null
  created_at: string | null
  roles: {
    nombre_rol: string
    nivel_acceso: number | null
  } | null
}

export async function getMiPerfil(): Promise<PerfilUsuario | null> {
  // Aquí es donde se usa el createClient que causaba el error
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) return null

  const client = supabase as unknown as {
    from: (table: string) => {
      select: (columns?: string) => {
        eq: (column: string, value: string) => Promise<{ 
          data: unknown[] | null
          error: { message: string } | null 
        }>
      }
    }
  }

  const { data, error } = await client
    .from('profiles')
    .select('email, created_at, roles(nombre_rol, nivel_acceso)')
    .eq('id', user.id)

  if (error || !data || data.length === 0) return null

  const p = data[0] as unknown as SupabaseProfileJoin

  return {
    email: p.email,
    createdAt: p.created_at ? new Date(p.created_at).toLocaleDateString() : '—',
    rolNombre: p.roles?.nombre_rol || 'Usuario',
    nivelAcceso: p.roles?.nivel_acceso ?? 1,
  }
}