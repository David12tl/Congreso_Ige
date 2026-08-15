import { createClient } from "@/lib/supabase/server";

/**
 * Nivel de acceso por defecto asignado a TODOS los usuarios que se registran
 * pero que no disponen aún de un registro en la tabla `profiles`.
 *
 * Regla del negocio (CANDADO DE ACCESO POR DEFECTO):
 *   id_rol = 1 → Administrador   (máximos permisos)
 *   id_rol = 2 → Encargado        (permisos intermedios)
 *   id_rol = 3 → Usuario          (permisos mínimos)  ← CANDADO POR DEFECTO
 *
 * Cualquier usuario autenticado que NO exista en la tabla `profiles` es
 * automáticamente tratado como id_rol = 3 (Usuario). Este es el "candado"
 * que garantiza que nunca se conceda acceso privilegiado a quien no esté
 * explícitamente registrado en la base de datos.
 */
export const DEFAULT_ROLE_ID = 3;

/**
 * Consulta el id_rol real del usuario desde la tabla `profiles` en la base de
 * datos. La tabla profiles contiene: id, id_rol, email, created_at.
 *
 * Si no existe el perfil (el usuario NO está en la BD) retorna id_rol = 3
 * (usuario) por defecto, aplicando el CANDADO DE ACCESO POR DEFECTO.
 *
 * Esta función es *solo lectura*: no crea ni modifica registros. Para la
 * creación implícita del perfil usar {@link ensureUserAccess}.
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
    return { id_rol: DEFAULT_ROLE_ID };
  }

  if (!data) {
    console.warn(
      `[getUserProfile] Perfil no encontrado para user ${userId}. Aplicando CANDADO: id_rol=${DEFAULT_ROLE_ID} por defecto.`,
    );
    return { id_rol: DEFAULT_ROLE_ID };
  }

  return { id_rol: data.id_rol };
}

/**
 * CANDADO: Gate de acceso por defecto.
 *
 * Garantiza que TODO usuario autenticado (registro vía email o login vía
 * OAuth) cuente con un registro en la tabla `profiles`. El "candado" funciona
 * así:
 *
 *   1. Se consulta el perfil del usuario en la base de datos.
 *   2. CANDADO ABIERTO — Si el usuario YA está en la BD → se respeta el
 *      `id_rol` real que un administrador pudo haber asignado
 *      (1=Admin, 2=Encargado, 3=Usuario).
 *   3. CANDADO CERRADO — Si el usuario NO está en la BD → se CREA un perfil
 *      con `id_rol = DEFAULT_ROLE_ID` (3, Usuario). El candado lo cierra al
 *      nivel de acceso más restrictivo.
 *   4. En caso de error → fail-secure: se aplica el candado cerrado
 *      (id_rol = 3) siguiendo el principio de mínimo privilegio.
 *
 * Este es el único punto de creación de perfiles y la única fuente de
 * verdad para determinar el nivel de acceso. Así, ningún usuario que no
 * esté explícitamente en la base de datos puede obtener privilegios
 * elevados a través de `user_metadata` desactualizado.
 *
 * @param userId - ID del usuario autenticado en Supabase Auth (uuid)
 * @returns El `id_rol` verificado desde la base de datos (3 si no existe)
 */
export async function ensureUserAccess(
  userId: string,
  email?: string,
): Promise<{ id_rol: number }> {
  const supabase = await createClient();

  // 1. Consultar perfil existente.
  const { data: existingProfile, error: fetchError } = await supabase
    .from("profiles")
    .select("id_rol")
    .eq("id", userId)
    .maybeSingle();

  if (fetchError) {
    console.error(
      `[ensureUserAccess] Error consultando perfil para user ${userId}: ${fetchError.message}. Aplicando CANDADO cerrado: id_rol=${DEFAULT_ROLE_ID}.`,
    );
    return { id_rol: DEFAULT_ROLE_ID };
  }

  // 2. CANDADO ABIERTO: Si el perfil existe y tiene un rol válido (1, 2, 3), se respeta.
  if (existingProfile && [1, 2, 3].includes(existingProfile.id_rol)) {
    return { id_rol: existingProfile.id_rol };
  }

  // 3. CANDADO CERRADO: Si no existe perfil, o existe pero con id_rol nulo/inválido,
  // se fuerza un `upsert` para (re)establecer el rol por defecto (3).
  const { data: upsertedProfile, error: upsertError } = await supabase
    .from("profiles")
    .upsert({
      id: userId,
      email, // Opcional, se guardará si se provee
      id_rol: DEFAULT_ROLE_ID,
    })
    .select("id_rol")
    .single();

  if (upsertError || !upsertedProfile) {
    console.error(
      `[ensureUserAccess] Error en upsert para user ${userId}: ${upsertError?.message ?? "unknown"}. Aplicando CANDADO: id_rol=${DEFAULT_ROLE_ID}.`,
    );
    return { id_rol: DEFAULT_ROLE_ID }; // Fail-secure
  }

  console.info(
    `[ensureUserAccess] CANDADO CERRADO: Perfil (re)establecido para user ${userId} con id_rol=${upsertedProfile.id_rol}.`,
  );

  return { id_rol: upsertedProfile.id_rol };
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
      // Limpieza explícita: elimina el campo 'role' para evitar conflictos.
      role: null,
    },
  });

  if (error) {
    console.error(
      `[syncAuthMetadataWithProfile] Error al actualizar metadata para user ${userId}:`,
      error.message,
    );
  }
}