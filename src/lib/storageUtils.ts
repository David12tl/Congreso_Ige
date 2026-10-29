/**
 * Normaliza y limpia una ruta de archivo dentro del bucket privado 'vouchers'.
 * Remueve prefijos de bucket ('vouchers/'), slashes iniciales, URLs completas de Supabase y query tokens.
 */
export function normalizarRutaStorage(raw: string | null | undefined): string {
  if (!raw || typeof raw !== 'string') return ''
  let ruta = raw.trim()

  // Remover query params si los tiene (?token=...)
  ruta = ruta.split('?')[0]

  // Extraer la ruta relativa si viene como URL completa de Supabase Storage
  if (ruta.includes('/storage/v1/object/public/vouchers/')) {
    ruta = ruta.split('/storage/v1/object/public/vouchers/').pop() || ruta
  } else if (ruta.includes('/storage/v1/object/sign/vouchers/')) {
    ruta = ruta.split('/storage/v1/object/sign/vouchers/').pop() || ruta
  } else if (ruta.includes('/storage/v1/object/vouchers/')) {
    ruta = ruta.split('/storage/v1/object/vouchers/').pop() || ruta
  } else if (ruta.includes('/vouchers/')) {
    ruta = ruta.split('/vouchers/').pop() || ruta
  }

  // Quitar prefijo 'vouchers/' si estuviera presente
  if (ruta.startsWith('vouchers/')) {
    ruta = ruta.slice('vouchers/'.length)
  }

  // Quitar slashes al inicio
  ruta = ruta.replace(/^\/+/, '')

  // Decodificar posibles caracteres codificados (%20, etc.)
  try {
    ruta = decodeURIComponent(ruta)
  } catch {
    // Si falla, usar tal como está
  }

  return ruta
}

