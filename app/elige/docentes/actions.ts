'use server'

import type { PostgrestError } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { CONGRESO_IGE_EVENT_ID } from '@/config/auditorioConfig'

// Definimos una interfaz para la estructura de datos que esperamos de la consulta.
interface DocenteSearchResult {
  buyer_id: string
  nombre: string
  email: string
  departamento: string
  tokens_canje: { token_code: string }[]
}

/**
 * Busca docentes registrados en el evento que aún no tienen un token de gafete.
 * Filtra por nombre o email y excluye a quienes ya tienen un token.
 * @param searchTerm El término de búsqueda para nombre o email.
 * @returns Una lista de docentes que coinciden con la búsqueda y no tienen token.
 */
export async function searchDocentes(searchTerm: string) {
  // Si no hay término de búsqueda, no devolvemos nada para evitar cargar toda la lista.
  if (!searchTerm || searchTerm.trim() === '') {
    return []
  }

  const supabase = await createClient()

  // Buscamos en la tabla 'tickets' donde el tipo sea 'docente'. Tipamos explícitamente la respuesta.
  // Hacemos un LEFT JOIN implícito con 'tokens_canje' para ver si ya tienen un token.
  const { data, error } = await (supabase
    .from('tickets')
    .select(
      `
      buyer_id,
      nombre,
      email,
      departamento,
      tokens_canje ( token_code )
    `,
    )
    .eq('type', 'docente')
    .or(`nombre.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)) as { data: DocenteSearchResult[] | null; error: PostgrestError | null }

  if (error) {
    console.error('Error buscando docentes:', error.message)
    return []
  }

  // De la lista de resultados, filtramos para quedarnos solo con aquellos
  // que NO tienen ningún token asociado (el array de tokens_canje está vacío).
  const docentesSinToken = (data ?? []).filter((docente) => docente.tokens_canje.length === 0)

  return docentesSinToken
}

/**
 * Genera un token de acceso para un docente específico y lo guarda en la DB.
 * @param docenteUserId El ID de usuario (buyer_id) del docente.
 * @returns Un objeto con el resultado de la operación y el token si fue exitoso.
 */
export async function generarTokenParaDocente(docenteUserId: string) {
  if (!docenteUserId) {
    return { success: false, message: 'ID de docente no proporcionado.' }
  }

  const supabase = await createClient()

  try {
    // 1. (MEJORA) Verificar si ya existe un token para este docente para evitar duplicados.
    const { data: existingToken, error: checkError } = await supabase
      .from('tokens_canje')
      .select('token_code')
      .eq('creado_por', docenteUserId)
      .maybeSingle()

    if (checkError) throw checkError
    if (existingToken) {
      return {
        success: false,
        message: 'Este docente ya tiene un token generado.',
        token: existingToken.token_code,
      }
    }

    // 2. Generar un nuevo código de token usando la función RPC de la base de datos.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: tokenCode, error: rpcError } = await (supabase as any).rpc('generar_codigo_tarjeta_play') as { data: string, error: PostgrestError | null }
    if (rpcError || !tokenCode) {
      throw rpcError || new Error('La función RPC no devolvió un código de token.')
    }

    // 3. Insertar el nuevo token en la tabla 'tokens_canje'.
    const { error: insertError } = await supabase.from('tokens_canje').insert([{
      token_code: tokenCode,
      event_id: CONGRESO_IGE_EVENT_ID,
      zone_id: null, // CORRECCIÓN: Añadimos zone_id como null, ya que es requerido por la tabla.
      creado_por: docenteUserId,
      status: 'disponible',
      total_abonado: 0,
      estado_pago: 'completado', // Es un gafete de organizador, no requiere pago.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }] as any) 

    if (insertError) {
      throw insertError
    }

    return { success: true, message: 'Token para gafete generado exitosamente.', token: tokenCode }
  } catch (error: unknown) {
    console.error('Error al generar gafete para docente:', (error as Error).message)
    return { success: false, message: `Error en el servidor: ${(error as Error).message}` }
  }
}