import sharp from 'sharp'

/**
 * Recibe un Buffer de imagen y devuelve un Buffer en formato WebP comprimido.
 */
export async function optimizarAWebp(imageBuffer: Buffer): Promise<Buffer> {
  return await sharp(imageBuffer)
    .resize({ width: 1200, withoutEnlargement: true }) // Redimensiona max a 1200px de ancho si es muy grande
    .webp({ quality: 80 })                             // Comprime a WebP con calidad 80%
    .toBuffer()
}