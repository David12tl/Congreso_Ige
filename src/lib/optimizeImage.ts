/**
 * Recibe un Buffer de imagen y lo devuelve tal cual (passthrough), sin
 * compresión ni conversión a WebP. Las imágenes de comprobante/voucher se
 * aceptan en su formato original.
 *
 * Se mantiene la firma `Promise<Buffer>` para que `VoucherUploader.tsx` y
 * otras acciones sigan funcionando sin modificar sus llamadas.
 */
export async function optimizarAWebp(imageBuffer: Buffer): Promise<Buffer> {
  return imageBuffer
}