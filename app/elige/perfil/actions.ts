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

export interface UnidadAcademica {
  id: number
  nombre: string
  tipo: 'interno' | 'externo'
}

export async function getMiPerfil(): Promise<PerfilUsuario | null> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.warn('[getMiPerfil] No hay usuario autenticado en Supabase.')
      return null
    }

    // Consulta simplificada para evitar fallos si la relación nombrada de FK varía
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        email,
        created_at,
        unidad_academica_id,
        roles (
          nombre_rol,
          nivel_acceso
        ),
        unidades_academicas (
          nombre
        )
      `)
      .eq('id', user.id)
      .maybeSingle()

    if (error) {
      console.error(`[getMiPerfil] Error SQL en profiles para user ${user.id}:`, error.message)
      return null
    }

    if (!data) {
      console.warn(`[getMiPerfil] No existe registro en profiles para user ${user.id}.`)
      return null
    }

    // Extraemos tipos con seguridad
    const roleData = Array.isArray(data.roles) ? data.roles[0] : data.roles
    const uaData = Array.isArray(data.unidades_academicas) ? data.unidades_academicas[0] : data.unidades_academicas

    return {
      id: user.id,
      email: data.email ?? user.email ?? null,
      createdAt: data.created_at ? new Date(data.created_at).toLocaleDateString() : '—',
      rolNombre: roleData?.nombre_rol || 'Usuario',
      nivelAcceso: roleData?.nivel_acceso ?? 1,
      unidadAcademicaId: data.unidad_academica_id ? Number(data.unidad_academica_id) : null,
      unidadAcademicaNombre: uaData?.nombre ?? null,
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

    if (!data) return []

    // 💡 SOLUCIÓN CLAVE: Convertir explícitamente el BigInt `id` a Number
    return data.map((ua) => ({
      id: Number(ua.id),
      nombre: String(ua.nombre),
      tipo: (ua.tipo as 'interno' | 'externo') || 'interno',
    }))
  } catch (err) {
    console.error('[getUnidadesAcademicas] Excepción no controlada:', err instanceof Error ? err.message : String(err))
    return []
  }
}

export async function actualizarMiUnidadAcademica(unidadAcademicaId: number): Promise<{ success: boolean; message: string }> {
  try {
    const parsed = UnidadAcademicaIdSchema.safeParse(unidadAcademicaId)
    if (!parsed.success) {
      return { success: false, message: parsed.error.issues[0]?.message ?? 'ID inválido.' }
    }
    const safeId = parsed.data

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, message: 'Sesión expirada o no válida.' }
    }

    // Usamos UPDATE directo en lugar de UPSERT para no perder otros valores como `id_rol`
    const { error } = await supabase
      .from('profiles')
      .update({
        unidad_academica_id: safeId,
      })
      .eq('id', user.id)

    if (error) {
      console.error(`[actualizarMiUnidadAcademica] Error SQL actualizando UA:`, error.message)
      return { success: false, message: 'No se pudo guardar la Unidad Académica.' }
    }

    return { success: true, message: 'Unidad Académica actualizada.' }
  } catch (err) {
    console.error('[actualizarMiUnidadAcademica] Excepción no controlada:', err instanceof Error ? err.message : String(err))
    return { success: false, message: 'Error crítico al guardar la Unidad Académica.' }
  }
}