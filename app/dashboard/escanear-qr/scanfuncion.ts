import { validarCodigoQR } from '../generar-qr/actions'

export interface ResultadoAsistente {
  nombre: string
  matricula: string | null
  asiento: string
  tipo: string
}

export interface ResultadoValidacion {
  success: boolean
  message: string
  asistente?: ResultadoAsistente
}

/**
 * Procesa el texto plano decodificado por la cámara, realiza validaciones sintácticas
 * y comunica el resultado devuelto por la Server Action hacia la interfaz de usuario.
 */
export async function procesarLecturaQR(decodedText: string): Promise<ResultadoValidacion> {
  if (!decodedText || !decodedText.startsWith('ELIGE2026|')) {
    return {
      success: false,
      message: 'Código QR inválido o ajeno a este congreso.'
    }
  }

  try {
    const respuesta = await validarCodigoQR(decodedText)

    return {
      success: respuesta.success,
      message: respuesta.message,
      asistente: respuesta.datosTicket
        ? {
            nombre: respuesta.datosTicket.nombre,
            matricula: respuesta.datosTicket.matricula,
            asiento: [respuesta.datosTicket.asientoZona, respuesta.datosTicket.asientoBloque, respuesta.datosTicket.asientoFila, respuesta.datosTicket.asientoNumero].filter(Boolean).join(' - '),
            tipo: respuesta.datosTicket.tipo
          }
        : undefined
    }
  } catch (error) {
    console.error('Error crítico en el puente de escaneo:', error)
    return {
      success: false,
      message: 'Error de comunicación con el servidor. Inténtalo nuevamente.'
    }
  }
}