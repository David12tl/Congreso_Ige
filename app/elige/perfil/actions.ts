'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

// ─── Esquemas de validación ───────────────────────────────────────────────────
const UnidadAcademicaIdSchema = z.coerce
  .number({ error: 'ID de Unidad Académica inválido.' })
  .int('El ID debe ser un entero.')
  .positive('El ID debe ser un número positivo.')

export interface PerfilUsuario {
  id: string
  email: string | null
  createdAt: string
  rolNombre: string
  nivelAcceso: number
  unidadAcademicaId: number | null
  unidadAcademicaNombre: string | null
}

interface SupabaseProfileJoin {
  email: string | null
  created_at: string | null
  unidad_academica_id: number | null
  roles: {
    nombre_rol: string
    nivel_acceso: number | null
  } | null
  unidades_academicas: {
    nombre: string
  } | null
}

export interface UnidadAcademica {
  id: number
  nombre: string
  tipo: 'interno' | 'externo'
}

export async function getMiPerfil(): Promise<PerfilUsuario | null> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError) {
      console.error('[getMiPerfil] Error de autenticación Supabase:', authError.message)
      return null
    }

    if (!user) {
      console.warn('[getMiPerfil] No hay usuario autenticado en la sesión de Supabase.')
      return null
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('email, created_at, unidad_academica_id, roles!profiles_id_rol_fkey(nombre_rol, nivel_acceso), unidades_academicas!profiles_unidad_academica_id_fkey(nombre)')
      .eq('id', user.id)
      .maybeSingle()

    if (error) {
      console.error(`[getMiPerfil] Error SQL consultando perfil para user ${user.id}:`, error.message)
      return null
    }

    if (!data) {
      console.warn(`[getMiPerfil] No existe registro en profiles para user ${user.id}.`)
      return null
    }

    const p = data as unknown as SupabaseProfileJoin

    return {
      id: user.id,
      email: p.email,
      createdAt: p.created_at ? new Date(p.created_at).toLocaleDateString() : '—',
      rolNombre: p.roles?.nombre_rol || 'Usuario',
      nivelAcceso: p.roles?.nivel_acceso ?? 1,
      unidadAcademicaId: p.unidad_academica_id ?? null,
      unidadAcademicaNombre: p.unidades_academicas?.nombre ?? null,
    }
  } catch (err) {
    console.error('[getMiPerfil] Excepción no controlada:', err instanceof Error ? err.message : String(err))
    return null
  }
}

export async function getUnidadesAcademicas(): Promise<UnidadAcademica[]> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('unidades_academicas')
      .select('id, nombre, tipo')
      .order('nombre', { ascending: true })

    if (error) {
      console.error('[getUnidadesAcademicas] Error SQL:', error.message)
      return []
    }

    return (data || []) as UnidadAcademica[]
  } catch (err) {
    console.error('[getUnidadesAcademicas] Excepción no controlada:', err instanceof Error ? err.message : String(err))
    return []
  }
}

export async function actualizarMiUnidadAcademica(unidadAcademicaId: number): Promise<{ success: boolean; message: string }> {
  try {
    // ── Validación de entrada con Zod ────────────────────────────────────────
    const parsed = UnidadAcademicaIdSchema.safeParse(unidadAcademicaId)
    if (!parsed.success) {
      return { success: false, message: parsed.error.issues[0]?.message ?? 'ID inválido.' }
    }
    const safeId = parsed.data

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError) {
      console.error('[actualizarMiUnidadAcademica] Error de autenticación:', authError.message)
      return { success: false, message: 'Sesión expirada o no válida.' }
    }

    if (!user) {
      console.warn('[actualizarMiUnidadAcademica] No hay usuario autenticado.')
      return { success: false, message: 'Sesión expirada o no válida.' }
    }

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email ?? null,
        unidad_academica_id: safeId,
      }, { onConflict: 'id' })

    if (error) {
      console.error(`[actualizarMiUnidadAcademica] Error SQL actualizando UA para user ${user.id}:`, error.message)
      return { success: false, message: 'No se pudo guardar la Unidad Académica.' }
    }

    return { success: true, message: 'Unidad Académica actualizada.' }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[actualizarMiUnidadAcademica] Excepción no controlada:', msg)
    return { success: false, message: 'Error crítico al guardar la Unidad Académica.' }
  }
}