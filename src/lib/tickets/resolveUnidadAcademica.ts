import type { SupabaseClient } from '@supabase/supabase-js'

const ZONGOLICA_EMAIL_DOMAIN = '@zongolica.tecnm.mx'
const ZONGOLICA_UNIDAD_ACADEMICA_ID = 8

export async function resolveUnidadAcademicaId(
  supabase: SupabaseClient,
  userId: string,
  email: string | null,
): Promise<number | null> {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('email, unidad_academica_id')
    .eq('id', userId)
    .maybeSingle()

  if (profileError) throw profileError

  if (!profile) return null

  if (profile?.unidad_academica_id != null) {
    return Number(profile.unidad_academica_id)
  }

  const profileEmail = (profile.email ?? email)?.trim().toLowerCase()
  if (!profileEmail?.endsWith(ZONGOLICA_EMAIL_DOMAIN)) {
    return null
  }

  const { data: updatedProfile, error: updateError } = await supabase
    .from('profiles')
    .update({ unidad_academica_id: ZONGOLICA_UNIDAD_ACADEMICA_ID })
    .eq('id', userId)
    .select('id')
    .maybeSingle()

  if (updateError) throw updateError
  if (!updatedProfile) return null

  return ZONGOLICA_UNIDAD_ACADEMICA_ID
}
