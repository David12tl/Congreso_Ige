/**
 * Normaliza y limpia la ruta de un archivo para su uso con Supabase Storage.
 * Elimina prefijos innecesarios, asegura el formato correcto y maneja
 * tanto rutas relativas como URLs completas.
 *
 * @param rawPath - La ruta original del archivo (puede ser file_path, ruta_archivo, file_url o cadena vacía)
 * @returns La ruta normalizada lista para usar con Supabase Storage, o cadena vacía si no es válida
 */
export function normalizarRutaStorage(rawPath: string): string {
  if (!rawPath) {
    return ''
  }

  // Convertir a string y limpiar
  let path = String(rawPath).trim()

  // Remover prefijos de URL completas si están presentes
  // Patrones comunes: https://..., http://..., supabase storage URLs
  const urlPrefixes = [
    'https://',
    'http://',
  ]

  for (const prefix of urlPrefixes) {
    if (path.startsWith(prefix)) {
      // Intentar extraer el camino después del bucket name
      // Formato típico de Supabase: https://ref.supabase.co/storage/v1/bucket/path/to/file
      const storageMatch = path.match(/\/storage\/v1\/[^/]+\/(.+)$/)
      if (storageMatch) {
        path = storageMatch[1]
        break
      }
      // Si no es un patrón de Supabase conocido, quitar el prefijo
      path = path.replace(prefix, '')
      break
    }
  }

  // Eliminar barras diagonales al principio y al final
  path = path.replace(/^\/+|\/+$/g, '')

  // Reemplazar múltiples barras diagonales consecutivas por una sola
  path = path.replace(/\/+/g, '/')

  // Si la ruta está vacía después de la limpieza, retornar vacía
  if (!path) {
    return ''
  }

  return path
}