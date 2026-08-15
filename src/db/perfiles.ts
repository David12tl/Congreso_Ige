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
export async function ensureUserAccess(userId: string): Promise<{ id_rol: number }> {
  const supabase = await createClient();

  // 1. Intentar obtener el perfil existente desde la BD
  const { data: profile, error: fetchError } = await supabase
    .from("profiles")
    .select("id_rol")
    .eq("id", userId)
    .maybeSingle();

  // 2. CANDADO ABIERTO: el usuario YA está en la BD → respetar id_rol real
  if (profile) {
    return { id_rol: profile.id_rol };
  }

  // 3. No hay error de lectura pero tampoco perfil → CREAR con candado cerrado (rol 3)
  if (!fetchError) {
    const { data: inserted, error: insertError } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        id_rol: DEFAULT_ROLE_ID,
      })
      .select("id_rol")
      .maybeSingle();

    if (insertError || !inserted) {
      // Fail-secure: si no se pudo crear el perfil, cerrar el candado en memoria
      console.warn(
        `[ensureUserAccess] No se pudo crear el perfil para user ${userId} (insertError: ${insertError?.message ?? 'unknown'}). Aplicando CANDADO cerrado: id_rol=${DEFAULT_ROLE_ID}.`,
      );
      return { id_rol: DEFAULT_ROLE_ID };
    }

    console.info(
      `[ensureUserAccess] CANDADO aplicado: perfil creado para user ${userId} con id_rol=${DEFAULT_ROLE_ID}.`,
    );
    return { id_rol: inserted.id_rol };
  }

  // 4. Fetch error inesperado → fail-secure (candado cerrado)
  console.error(
    `[ensureUserAccess] Error consultando perfil para user ${userId}: ${fetchError.message}. Aplicando CANDADO cerrado: id_rol=${DEFAULT_ROLE_ID}.`,
  );
  return { id_rol: DEFAULT_ROLE_ID };
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