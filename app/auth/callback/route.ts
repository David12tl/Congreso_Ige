import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";

/**
 * Determina la ruta del dashboard según el rol del usuario.
 */
function getDashboardPath(role?: string): string {
  switch (role) {
    case "admin":
      return "/dashboard/admin";
    case "encargado":
      return "/dashboard/encargado";
    default:
      return "/dashboard/usuario";
  }
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();

    // Intercambia el código temporal por una sesión real y guarda las cookies
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Obtener el usuario ya autenticado para leer su rol desde metadata
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const metadata = user?.user_metadata ?? {};
      const role = metadata.role as string | undefined;
      const landInterest = metadata.land_interest as string | undefined;

      // Si es la primera vez que inicia sesión con Google (sin role o land_interest),
      // asignar valores por defecto antes de redirigir
      if (!role || !landInterest) {
        const updatedMetadata: Record<string, string> = {};

        if (!role) updatedMetadata.role = "user";
        if (!landInterest) updatedMetadata.land_interest = "Developer Land";

        const { error: updateError } = await supabase.auth.updateUser({
          data: updatedMetadata,
        });

        // Si la actualización falla, redirigir al login con error
        if (updateError) {
          console.error("Error al asignar metadatos por defecto:", updateError.message);
          return NextResponse.redirect(`${origin}/Login?error=metadata-update-failed`);
        }
      }

      // Redirigir al dashboard según el rol (usar el valor actualizado si se asignó)
      return NextResponse.redirect(`${origin}${getDashboardPath(role ?? "user")}`);
    }
  }

  // Si algo falla o no hay código, mándalo al login con un mensaje de error
  return NextResponse.redirect(`${origin}/Login?error=auth-callback-failed`);
}
