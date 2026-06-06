import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";
import { getUserProfile, syncAuthMetadataWithProfile } from "@/src/db/perfiles";

/**
 * Mapea id_rol a la ruta del dashboard correspondiente.
 *   1 → Administrador → /dashboard/admin
 *   2 → Encargado    → /dashboard/encargado
 *   3 → Usuario      → /dashboard/usuario
 */
function getDashboardPath(idRol: number): string {
  if (idRol === 1) return "/dashboard/admin";
  if (idRol === 2) return "/dashboard/encargado";
  return "/dashboard/perfil"; 
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();

    // Intercambia el código temporal por una sesión real y guarda las cookies
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.user) {
      const user = data.user;

      // --- CONSULTAR id_rol REAL DESDE LA BASE DE DATOS ---
      // Esto es CRÍTICO: leemos el id_rol desde la tabla profiles,
      // NO desde user_metadata que puede estar desactualizada.
      const profile = await getUserProfile(user.id);

      // Sincronizar metadata de Auth con el valor real de la BD
      // para que futuras lecturas de user_metadata también estén correctas
      await syncAuthMetadataWithProfile(user.id);

      // Redirigir al dashboard según el id_rol REAL desde la BD
      // Usamos 307 para preservar el método HTTP y evitar bucles
      return NextResponse.redirect(
        `${origin}${getDashboardPath(profile.id_rol)}`,
        { status: 307 },
      );
    }
  }

  // Si algo falla o no hay código, mándalo al login con un mensaje de error
  return NextResponse.redirect(`${origin}/Login?error=auth-callback-failed`);
}