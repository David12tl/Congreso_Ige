import type { Database } from '@/lib/supabase/database.types'

export type ChatEnVivoMessage = Database['public']['Tables']['chat_en_vivo']['Row']

export function isChatEnVivoMessage(value: unknown): value is ChatEnVivoMessage {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'string' &&
    'user_id' in value &&
    typeof value.user_id === 'string' &&
    'nombre_usuario' in value &&
    typeof value.nombre_usuario === 'string' &&
    'matricula' in value &&
    (value.matricula === null || typeof value.matricula === 'string') &&
    'mensaje' in value &&
    typeof value.mensaje === 'string' &&
    'es_destacada' in value &&
    typeof value.es_destacada === 'boolean' &&
    'visible' in value &&
    typeof value.visible === 'boolean' &&
    'created_at' in value &&
    typeof value.created_at === 'string'
  )
}
