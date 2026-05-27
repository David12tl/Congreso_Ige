import { createClient } from "@/src/lib/supabase/server";

export interface UserProfile {
  id_rol: number;
  nombre_rol: string;
  nivel_acceso: number;
}

/**
 * Consulta el perfil real del usuario desde la base de datos (tabla profiles + roles).
 * Si no existe el perfil, retorna nivel 1 (usuario) por defecto.
 * Esto EVITA usar user_metadata desactualizada para decisiones de ruteo.
 */
export async function getUserProfile(userId: string): Promise<UserProfile> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id_rol, roles ( id_rol, nombre_rol, nivel_acceso )")
    .eq("id", userId)
    .single();

  if (error || !data) {
    // Perfil no existe aún → asignar nivel 1 (usuario) por defecto
    console.warn(
      `[getUserProfile] Perfil no encontrado para user ${userId}. Error:`,
      error?.message ?? "sin datos",
    );
    return { id_rol: 1, nombre_rol: "user", nivel_acceso: 1 };
  }

  const rolesData = Array.isArray(data.roles) ? data.roles[0] : data.roles;

  return {
    id_rol: data.id_rol,
    nombre_rol: (rolesData as { nombre_rol: string })?.nombre_rol ?? "user",
    nivel_acceso: (rolesData as { nivel_acceso: number })?.nivel_acceso ?? 1,
  };
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
      role: profile.nombre_rol,
      nivel_acceso: profile.nivel_acceso,
    },
  });

  if (error) {
    console.error(
      `[syncAuthMetadataWithProfile] Error al actualizar metadata para user ${userId}:`,
      error.message,
    );
  }
}