import { createClient } from "@/lib/supabase/server";
import { auditorioConfig, getZoneUuid } from "@/config/auditorioConfig";

export interface AssignedSeat {
  asiento_zona: string;
  asiento_fila: string;
  asiento_numero: number;
  asiento_bloque: string;
  zone_id: string;
}

/**
 * Asigna automáticamente un asiento disponible al alumno.
 * Estrategia: Busca el primer asiento libre en orden de preferencia
 * (Preferente → Luneta → Palcos → General)
 */
export async function assignSeatToUser(): Promise<AssignedSeat | null> {
  const supabase = await createClient();

  // Recorrer las zonas en orden de preferencia
  for (const zone of auditorioConfig) {
    // Buscar los asientos ya ocupados en esta zona
    const { data: usedSeats } = await supabase
      .from("tickets")
      .select(
        "asiento_zona, asiento_fila, asiento_numero"
      )
      .eq("asiento_zona", zone.code)
      .not("asiento_numero", "is", null);

    const usedSet = new Set(
      (usedSeats || []).map(
        (s) => `${s.asiento_fila}|${s.asiento_numero}`
      )
    );

    // Buscar el próximo asiento libre en esta zona
    for (const bloque of zone.bloques) {
      for (const row of bloque.filas) {
        for (let num = 1; num <= row.asientos; num++) {
          const seatKey = `${row.fila}|${num}`;

          if (!usedSet.has(seatKey)) {
            // Asiento disponible encontrado
            return {
              asiento_zona: zone.code,
              asiento_fila: row.fila,
              asiento_numero: num,
              asiento_bloque: bloque.id,
              zone_id: zone.zoneId,
            };
          }
        }
      }
    }
  }

  // Si no hay asientos disponibles
  console.warn("No hay asientos disponibles en el auditorio");
  return null;
}

/**
 * Asigna un asiento específico al usuario (útil para cambios manuales)
 */
export async function assignSpecificSeat(
  _userId: string,
  seatData: AssignedSeat
): Promise<void> {
  const supabase = await createClient();

  // Verificar que el asiento no esté ocupado
  const { data: existingTicket } = await supabase
    .from("tickets")
    .select("id")
    .eq("asiento_zona", seatData.asiento_zona)
    .eq("asiento_fila", seatData.asiento_fila)
    .eq("asiento_numero", seatData.asiento_numero)
    .not("asiento_numero", "is", null)
    .maybeSingle();

  if (existingTicket) {
    throw new Error("Este asiento ya está ocupado");
  }

  // Actualizar el ticket del usuario con el asiento
  const { error } = await supabase
    .from("tickets")
    .update({
      asiento_zona: seatData.asiento_zona,
      asiento_fila: seatData.asiento_fila,
      asiento_numero: seatData.asiento_numero,
      asiento_bloque: seatData.asiento_bloque,
      zone_id: getZoneUuid(seatData.zone_id) || getZoneUuid(seatData.asiento_zona) || seatData.zone_id,
    })
    .eq("buyer_id", _userId)
    .is("asiento_numero", null);

  if (error) {
    throw new Error(`Error asignando asiento: ${error.message}`);
  }
}
