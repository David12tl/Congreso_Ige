'use server'

import { createClient } from '@/lib/supabase/server'

export interface SubirVoucherResult {
  success: boolean
  message: string
  error?: string
}

export async function subirVoucherAccion(formData: FormData): Promise<SubirVoucherResult> {
  // 1. Inspección y extracción de argumentos
  const userId = formData.get('userId')?.toString()?.trim() || ''
  const matricula = formData.get('matricula')?.toString()?.trim() || ''

  // Compatibilidad tanto para el parámetro 'archivo' como para 'file'
  const rawFile = formData.get('archivo') ?? formData.get('file')
  const file = (rawFile instanceof File ? rawFile : null) as File

  console.log('[subirVoucherAccion] Inspección de parámetros:', {
    userId: userId || '(vacío)',
    matricula: matricula || '(vacío)',
    hasFile: !!file,
    fileName: file?.name || '(sin nombre)',
    fileSize: file?.size ?? 0,
    fileType: file?.type || '(sin tipo)'
  })

  // 2. Validación de nulos/undefined/vacíos con logs claros y mensajes descriptivos
  if (!userId) {
    const errorMsg = 'Error: Falta el identificador del usuario (userId).'
    console.error(`[subirVoucherAccion] ${errorMsg}`)
    return { success: false, message: errorMsg, error: errorMsg }
  }

  if (!matricula) {
    const errorMsg = 'Error: Falta la matrícula o identificador del usuario.'
    console.error(`[subirVoucherAccion] ${errorMsg}`)
    return { success: false, message: errorMsg, error: errorMsg }
  }

  if (!file || file.size === 0) {
    const errorMsg = 'No se ha seleccionado ningún archivo válido.'
    console.error(`[subirVoucherAccion] Error: ${errorMsg}`)
    return { success: false, message: errorMsg, error: errorMsg }
  }

  // Validación de seguridad en servidor para límite de tamaño (10 MB)
  if (file.size > 10 * 1024 * 1024) {
    const errorMsg = 'El archivo excede el tamaño máximo permitido de 10 MB.'
    console.error(`[subirVoucherAccion] Error: ${errorMsg}`)
    return { success: false, message: errorMsg, error: errorMsg }
  }

  try {
    const supabase = await createClient()

    // 3. Preparación y llamada a Supabase Storage
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const contentType = file.type || `image/${fileExt}`
    const filePath = `${matricula}/${userId}-${Date.now()}.${fileExt}`

    console.log(`[subirVoucherAccion] Subiendo a Supabase Storage: path="${filePath}", contentType="${contentType}"`)

    const { data, error } = await supabase.storage
      .from('vouchers')
      .upload(filePath, file, {
        contentType: contentType,
        upsert: true
      })

    if (error) {
      console.error('[subirVoucherAccion] Error en Supabase Storage upload:', error)
      return {
        success: false,
        message: `Error al subir archivo a Storage: ${error.message}`,
        error: error.message
      }
    }

    // 4. Obtención de URL pública
    const { data: publicUrlData } = supabase.storage
      .from('vouchers')
      .getPublicUrl(filePath)

    // 5. Guardar registro en la base de datos (comprobantes_pago)
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

    if (dbError) {
      console.error('[subirVoucherAccion] Error en tabla comprobantes_pago:', dbError)
      return {
        success: false,
        message: `Error al registrar comprobante en la base de datos: ${dbError.message}`,
        error: dbError.message
      }
    }

    console.log('[subirVoucherAccion] Comprobante subido y registrado exitosamente:', filePath)
    return {
      success: true,
      message: 'Comprobante de pago subido correctamente.'
    }
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Error al procesar el voucher.'
    console.error('[subirVoucherAccion] Excepción no controlada:', errorMsg)
    return { success: false, message: errorMsg, error: errorMsg }
  }
}
