'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { CONGRESO_IGE_EVENT_ID } from '@/config/auditorioConfig'
import type { SupabaseClient } from '@supabase/supabase-js'

// Usamos Zod para validar los datos de entrada y tener un tipado seguro.
const DocenteFormSchema = z.object({
  userId: z.string().uuid(),
  userEmail: z.string().email(),
  nombre: z.string().trim().min(3, 'El nombre es demasiado corto.'),
  telefono: z.string().trim().optional().nullable(),
  departamento: z.string().trim().min(1, 'El departamento es obligatorio.'),
})

// Extraemos el tipo inferido de Zod para usarlo en la función.
type DocenteFormData = z.infer<typeof DocenteFormSchema>

interface ActionResult {
  success: boolean
  message: string
  token?: string
}

/**
 * Proceso de registro para un docente.
 * 1. Crea un ticket con estatus 'organizador' para evitar el flujo de pago.
 * 2. Genera un código de token único usando una función de base de datos.
 * 3. Crea un registro en 'tokens_canje' asociado al docente.
 * 4. Devuelve el token generado para que el usuario pueda canjearlo.
 */
export async function crearRegistroDocente(
  formData: DocenteFormData,
): Promise<ActionResult> {
  // 1. Validar los datos de entrada con Zod.
  const validation = DocenteFormSchema.safeParse(formData)
  if (!validation.success) {
    return { success: false, message: validation.error.issues[0].message }
  }
  const safeData = validation.data

  const supabase = await createClient() as SupabaseClient

  // Usamos una función RPC para envolver la lógica en una transacción de base de datos.
  // Esto asegura que si algo falla, se revierten todos los cambios.
  const { data, error } = await supabase.rpc('registrar_docente_y_generar_token', {
    p_user_id: safeData.userId,
    p_email: safeData.userEmail,
    p_nombre: safeData.nombre,
    p_telefono: safeData.telefono,
    p_departamento: safeData.departamento,
    p_event_id: CONGRESO_IGE_EVENT_ID,
  })

  if (error) {
    console.error('[Docente Register] Error en RPC:', error.message)
    // Si el error es por una clave única duplicada (el usuario ya existe), damos un mensaje claro.
    if (error.code === '23505') {
      return { success: false, message: 'Este usuario ya se encuentra registrado en el sistema.' }
    }
    return { success: false, message: 'No se pudo completar el registro. Intenta de nuevo.' }
  }

  // La función RPC devuelve el token generado.
  return {
    success: true,
    message: '¡Registro de docente completado! Se ha generado tu token de acceso.',
    token: data,
  }
}