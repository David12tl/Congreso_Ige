'use server'

import { createClient } from '@/lib/supabase/server'
import { optimizarAWebp } from '@/lib/optimizeImage'

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

    let bufferFinal: Buffer = bufferOriginal
    let fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    let contentType = file.type

    // Si es una imagen (JPG/PNG/WEBP), la optimizamos a WebP
    if (contentType.startsWith('image/')) {
      bufferFinal = await optimizarAWebp(bufferOriginal)
      fileExt = 'webp'
      contentType = 'image/webp'
    }

    const fileName = `${Date.now()}.${fileExt}`
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

    return { success: true, message: 'Voucher optimizado a WebP y subido correctamente.' }
  } catch (error: unknown) {
    console.error('[subirVoucherAccion] Error procesando voucher:', error instanceof Error ? error.message : String(error))
    const errorMsg = error instanceof Error ? error.message : 'Error al procesar el voucher.'
    return { success: false, message: errorMsg }
  }
}
