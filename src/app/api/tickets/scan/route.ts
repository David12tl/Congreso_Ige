import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import type { Database } from "@/types/database.types";

interface ScanRequestBody {
  qr_data: string;
  dia_a_pasar: 1 | 2;
}

interface ScanSuccessResponse {
  success: true;
  data: {
    nombre: string | null;
    matricula: string | null;
    carrera: string | null;
    asiento_zona: string | null;
    asiento_fila: string | null;
    asiento_numero: number | null;
    unidad_academica: string | null;
  };
}

interface ScanErrorResponse {
  success: false;
  error: string;
  code: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ScanRequestBody = await request.json();

    // Validar que el cuerpo tenga los campos necesarios
    if (!body.qr_data || !body.dia_a_pasar) {
      return NextResponse.json(
        {
          success: false,
          error: "Faltan campos requeridos: qr_data y dia_a_pasar",
          code: "MISSING_FIELDS",
        } as ScanErrorResponse,
        { status: 400 }
      );
    }

    // Validar que dia_a_pasar sea 1 o 2
    if (body.dia_a_pasar !== 1 && body.dia_a_pasar !== 2) {
      return NextResponse.json(
        {
          success: false,
          error: "dia_a_pasar debe ser 1 o 2",
          code: "INVALID_DAY",
        } as ScanErrorResponse,
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 1. BUSCAR el ticket que coincida con el qr_data
    const { data: ticket, error: searchError } = await supabase
      .from("tickets")
      .select("*")
      .eq("qr_data", body.qr_data.trim())
      .single();

    if (searchError || !ticket) {
      return NextResponse.json(
        {
          success: false,
          error: "Error: El código QR no corresponde a ningún boleto válido.",
          code: "TICKET_NOT_FOUND",
        } as ScanErrorResponse,
        { status: 404 }
      );
    }

    // 2. VALIDAR DUPLICADOS según el día
    if (body.dia_a_pasar === 1) {
      if (ticket.attended_day1 === true) {
        // Formatar la hora si existe, si no mostrar una hora genérica
        const horaIngreso = ticket.attended_day1_at
          ? new Date(ticket.attended_day1_at).toLocaleTimeString("es-MX", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "desconocida";

        return NextResponse.json(
          {
            success: false,
            error: `¡ALERTA! Este boleto ya ingresó el Día 1 a las ${horaIngreso}`,
            code: "DUPLICATE_DAY1",
          } as ScanErrorResponse,
          { status: 400 }
        );
      }
    } else if (body.dia_a_pasar === 2) {
      if (ticket.attended_day2 === true) {
        const horaIngreso = ticket.attended_day2_at
          ? new Date(ticket.attended_day2_at).toLocaleTimeString("es-MX", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "desconocida";

        return NextResponse.json(
          {
            success: false,
            error: `¡ALERTA! Este boleto ya ingresó el Día 2 a las ${horaIngreso}`,
            code: "DUPLICATE_DAY2",
          } as ScanErrorResponse,
          { status: 400 }
        );
      }
    }

    // 3. REGISTRAR el ingreso exitoso - UPDATE la tabla tickets
    const updateData: Database["public"]["Tables"]["tickets"]["Update"] = {};

    if (body.dia_a_pasar === 1) {
      updateData.attended_day1 = true;
      updateData.attended_day1_at = new Date().toISOString();
    } else {
      updateData.attended_day2 = true;
      updateData.attended_day2_at = new Date().toISOString();
    }

    const { error: updateError } = await supabase
      .from("tickets")
      .update(updateData)
      .eq("id", ticket.id);

    if (updateError) {
      console.error("Error actualizando ticket:", updateError);
      return NextResponse.json(
        {
          success: false,
          error: "Error al registrar el ingreso en la base de datos",
          code: "UPDATE_ERROR",
        } as ScanErrorResponse,
        { status: 500 }
      );
    }

    // 4. RESPUESTA EXITOSA - Devolver datos del alumno
    const response: ScanSuccessResponse = {
      success: true,
      data: {
        nombre: ticket.nombre,
        matricula: ticket.matricula,
        carrera: ticket.carrera,
        asiento_zona: ticket.asiento_zona,
        asiento_fila: ticket.asiento_fila,
        asiento_numero: ticket.asiento_numero,
        unidad_academica: null, // Podría obtenerlo del id si lo necesitas
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error en /api/tickets/scan:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        code: "INTERNAL_ERROR",
      } as ScanErrorResponse,
      { status: 500 }
    );
  }
}
