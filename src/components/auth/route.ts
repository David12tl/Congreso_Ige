import { NextResponse } from 'next/server';
import { createClient } from '@/src/lib/supabase/server';

/**
 * Determina la ruta del dashboard según el rol del usuario.
 */
function getDashboardPath(role?: string): string {
  switch (role) {
    case 'admin':
      return '/dashboard/admin';
    case 'encargado':
      return '/dashboard/encargado';
    default:
      return '/dashboard/usuario';
  }
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    // Intercambia el código temporal por una sesión real y guarda las cookies
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Obtener el usuario para leer su rol desde metadata
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const role = user?.user_metadata?.role as string | undefined;

      // Redirigir al dashboard según el rol del usuario
      return NextResponse.redirect(`${origin}${getDashboardPath(role)}`);
    }
  }

  // En caso de error, regresamos al login con un mensaje descriptivo
  return NextResponse.redirect(
    `${origin}/login?error=No pudimos validar tu sesión de Google. Inténtalo de nuevo.`
  );
}
