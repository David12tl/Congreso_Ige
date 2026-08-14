import { createClient } from "@/lib/supabase/server";

/**
 * Consulta el id_rol real del usuario desde la tabla profiles en la base de datos.
 * La tabla profiles solo contiene: id, id_rol, email, created_at.
 * Si no existe el perfil, retorna id_rol = 3 (usuario) por defecto.
 */
export async function getUserProfile(userId: string): Promise<{ id_rol: number }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id_rol")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error(
      `[getUserProfile] Error al consultar perfil para user ${userId}:`,
      error.message,
    );
    return { id_rol: 3 };
  }

  if (!data) {
    console.warn(
      `[getUserProfile] Perfil no encontrado para user ${userId}. Asignando id_rol=3 por defecto.`,
    );
    return { id_rol: 3 };
  }

  return { id_rol: data.id_rol };
}

/**
 * Actualiza los metadatos del usuario en Supabase Auth para que
 * el middleware y otros componentes que lean de user_metadata
 * tengan el valor correcto sin consultar la BD en cada request.
 */
export async function syncAuthMetadataWithProfile(userId: string) {
  const supabase = await createClient();
  const profile = await getUserProfile(userId);

  const { error } = await supabase.auth.updateUser({
    data: {
      id_rol: profile.id_rol,
    },
  });

  if (error) {
    console.error(
      `[syncAuthMetadataWithProfile] Error al actualizar metadata para user ${userId}:`,
      error.message,
    );
  }
}