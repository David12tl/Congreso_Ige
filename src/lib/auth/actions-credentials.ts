'use server';

import { createClient } from '@/lib/supabase/server';
import { getZoneUuid } from '@/config/auditorioConfig';
import { generateCredentialPDF, CredentialData } from '@/lib/credentials/pdf-generator';
import { assignSeatToUser } from '@/lib/credentials/seat-assignment';
import { uploadCredentialPDF } from '@/lib/credentials/storage';
export interface GenerateCredentialResult {
  success: boolean;
  message: string;
  pdfUrl?: string;
  error?: string;
}

/**
 * Genera y guarda la credencial del alumno automáticamente después del registro.
 * Pasos:
 * 1. Asignar un asiento automáticamente
 * 2. Generar PDF de credencial
 * 3. Subir PDF a Supabase Storage
 * 4. Actualizar el ticket con la URL del PDF
 */
export async function generateAndSendCredential(
  ticketId: string,
  userId: string
): Promise<GenerateCredentialResult> {
  try {
    const supabase = await createClient();

    // ========== 1. OBTENER DATOS DEL TICKET ==========
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', ticketId)
      .eq('buyer_id', userId)
      .single();

    if (ticketError || !ticket) {
      console.error('Error obteniendo ticket:', ticketError);
      return {
        success: false,
        message: 'No se encontró el ticket',
        error: ticketError?.message,
      };
    }

    // ========== 2. ASIGNAR ASIENTO AUTOMÁTICAMENTE ==========
    let assignedSeat = null;

    if (!ticket.asiento_numero) {
      // El usuario aún no tiene asiento asignado
      assignedSeat = await assignSeatToUser();

      if (!assignedSeat) {
        return {
          success: false,
          message: 'No hay asientos disponibles en el auditorio',
          error: 'SEATS_UNAVAILABLE',
        };
      }

      // Actualizar el ticket con el asiento
      const { error: updateError } = await supabase
        .from('tickets')
        .update({
          asiento_zona: assignedSeat.asiento_zona,
          asiento_fila: assignedSeat.asiento_fila,
          asiento_numero: assignedSeat.asiento_numero,
          asiento_bloque: assignedSeat.asiento_bloque,
          zone_id: assignedSeat.zone_id,
        })
        .eq('id', ticketId);

      if (updateError) {
        console.error('Error actualizando asiento:', updateError);
        return {
          success: false,
          message: 'Error al asignar asiento',
          error: updateError.message,
        };
      }
    } else {
      // El usuario ya tiene asiento
      assignedSeat = {
        asiento_zona: ticket.asiento_zona,
        asiento_fila: ticket.asiento_fila,
        asiento_numero: ticket.asiento_numero,
        asiento_bloque: ticket.asiento_bloque || '',
        zone_id: ticket.zone_id || '',
      };
    }

    // ========== 3. PREPARAR DATOS DE CREDENCIAL ==========
    if (!assignedSeat) {
      return {
        success: false,
        message: 'Error: No se pudo asignar asiento válido',
        error: 'INVALID_SEAT',
      };
    }

    const credentialData: CredentialData = {
      nombre: ticket.nombre || 'Alumno(a)',
      matricula: ticket.matricula || 'S/N',
      carrera: ticket.carrera || 'No especificada',
      asiento_zona: assignedSeat.asiento_zona || 'LUNETA',
      asiento_fila: assignedSeat.asiento_fila || 'A',
      asiento_numero: assignedSeat.asiento_numero,
      qr_data: ticket.qr_data || ticketId,
      email: ticket.email,
    };

    // ========== 4. GENERAR PDF ==========
    let pdfBuffer: Buffer;
    try {
      pdfBuffer = await generateCredentialPDF(credentialData);
    } catch (error) {
      console.error('Error generando PDF:', error);
      return {
        success: false,
        message: 'Error al generar el PDF de credencial',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }

    // ========== 5. SUBIR PDF A SUPABASE STORAGE ==========
    const fileName = `${ticket.nombre?.replace(/\s+/g, '_')}_${ticketId}.pdf`;
    const uploadResult = await uploadCredentialPDF(pdfBuffer, fileName);

    if (!uploadResult.success) {
      console.error('Error subiendo PDF:', uploadResult.error);
      return {
        success: false,
        message: 'Error al guardar el PDF',
        error: uploadResult.error,
      };
    }

    // ========== 6. ACTUALIZAR TICKET CON URL DEL PDF ==========
    const { error: pdfUrlError } = await supabase
      .from('tickets')
      .update({
        pdf_path: uploadResult.path,
      })
      .eq('id', ticketId);

    if (pdfUrlError) {
      console.error('Error actualizando pdf_path:', pdfUrlError);
      // No es crítico, el archivo ya se guardó
    }

    // ========== ÉXITO ==========
    return {
      success: true,
      message: `✓ Credencial generada para ${ticket.email}`,
      pdfUrl: uploadResult.url,
    };
  } catch (error) {
    console.error('Error en generateAndSendCredential:', error);
    return {
      success: false,
      message: 'Error al generar la credencial',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
