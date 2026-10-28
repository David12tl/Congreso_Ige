'use server'

import { createClient } from '@/lib/supabase/server'

export async function subirVoucherAccion(formData: FormData) {
  const file = formData.get('file') as File
  const matricula = formData.get('matricula') as string
  const userId = formData.get('userId') as string

  if (!file || !matricula || !userId) {
    return { success: false, message: 'Faltan parámetros requeridos.' }
  }

  try {
    const supabase = await createClient()

    const arrayBuffer = await file.arrayBuffer()
    const bufferOriginal = Buffer.from(arrayBuffer)

    const bufferFinal: Buffer = bufferOriginal
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const contentType = file.type || `image/${fileExt}`
    const fileName = `${userId}-${Date.now()}.${fileExt}`
    const filePath = `${matricula}/${fileName}`

    // Subir a Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('vouchers')
      .upload(filePath, bufferFinal, {
        contentType,
        upsert: false
      })

    if (uploadError) throw uploadError

    // URL pública
    const { data: publicUrlData } = supabase.storage
      .from('vouchers')
      .getPublicUrl(filePath)

    // Guardar registro en la base de datos
    const { error: dbError } = await supabase
      .from('comprobantes_pago')
      .insert([
        {
          profile_id: userId,
          matricula: matricula,
          file_path: filePath,
          file_url: publicUrlData.publicUrl,
          estado: 'pendiente'
        }
      ])

    if (dbError) throw dbError

    return { success: true, message: 'Voucher subido correctamente.' }
  } catch (error: unknown) {
    console.error('[subirVoucherAccion] Error procesando voucher:', error instanceof Error ? error.message : String(error))
    const errorMsg = error instanceof Error ? error.message : 'Error al procesar el voucher.'
    return { success: false, message: errorMsg }
  }
}
