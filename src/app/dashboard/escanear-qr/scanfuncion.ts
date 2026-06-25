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

// 1. Declaramos la interfaz exacta de lo que devuelve la Server Action 'validarCodigoQR'
// para que TypeScript reconozca la propiedad 'datosTicket' y sus campos internos.
export interface ResultadoValidacionQR {
  success: boolean
  message: string
  datosTicket?: {
    nombre: string
    matricula: string | null
    type: string // En tu BD se llama 'type', lo mapeamos como string
    asiento_zona?: string | null
    asiento_bloque?: string | null
    asiento_fila?: string | null
    asiento_numero?: number | null
  } | null
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
    // 2. Casteamos la respuesta a nuestra interfaz explícita para eliminar el error 2339
    const respuesta = (await validarCodigoQR(decodedText)) as unknown as ResultadoValidacionQR

    // 3. Mapeamos de forma segura comprobando la existencia de 'datosTicket'
    if (respuesta.success && respuesta.datosTicket) {
      const ticket = respuesta.datosTicket

      // Construcción limpia de la etiqueta del asiento (Manejando tanto snake_case como valores nulos)
      const detalleAsiento = [
        ticket.asiento_zona,
        ticket.asiento_bloque,
        ticket.asiento_fila,
        ticket.asiento_numero
      ]
        .filter(Boolean)
        .join(' - ')

      return {
        success: true,
        message: respuesta.message,
        asistente: {
          nombre: ticket.nombre,
          matricula: ticket.matricula,
          asiento: detalleAsiento || 'GENERAL',
          tipo: ticket.type || 'alumno'
        }
      }
    }

    // Si la validación falló en el servidor
    return {
      success: false,
      message: respuesta.message || 'El boleto no pudo ser verificado.'
    }

  } catch (error) {
    console.error('Error crítico en el puente de escaneo:', error)
    return {
      success: false,
      message: 'Error de comunicación con el servidor. Inténtalo nuevamente.'
    }
  }
}