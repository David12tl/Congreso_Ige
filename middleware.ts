import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/src/lib/supabase/middleware";

/**
 * Determina la ruta del dashboard según el rol del usuario.
 * Se asegura de que las rutas coincidan al 100% con las carpetas físicas.
 */
function getDashboardPath(role?: string): string {
  switch (role) {
    case "admin":
      return "/dashboard/admin";
    case "encargado":
      return "/dashboard/encargado";
    case "user":
    case "usuario":
      return "/dashboard/usuario";
    default:
      return "/dashboard/usuario";
  }
}

/**
 * Rutas cuyo acceso está restringido por rol.
 * Cada entrada: [prefijo de ruta, rol requerido]
 */
const roleRestrictedPaths: [string, string][] = [
  ["/dashboard/admin", "admin"],
  ["/dashboard/encargado", "encargado"],
];

/**
 * Middleware de Next.js para manejar redirecciones y protección de rutas.
 */
export async function middleware(request: NextRequest) {
  // Crear el cliente de Supabase para el middleware
  const { supabase, response } = await createClient(request);

  // Refrescar la sesión automáticamente
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // --- Lógica de protección de rutas ---
  const protectedPaths = [
    "/dashboard",
    "/perfil",
  ];
  
  const isProtected = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  // Si es ruta protegida y no hay usuario autenticado → redirigir a login (en minúsculas)
  if (isProtected && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // --- Validación de acceso por rol ---
  if (user) {
    const userRole = user.user_metadata?.role as string | undefined;

    for (const [path, requiredRole] of roleRestrictedPaths) {
      if (
        pathname.startsWith(path) &&
        userRole !== requiredRole
      ) {
        // Redirigir al dashboard que le corresponde según su rol
        return NextResponse.redirect(
          new URL(getDashboardPath(userRole), request.url),
        );
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas excepto las estáticas y las páginas públicas 
     * explícitas para evitar bucles de redirección.
     */
    "/((?!api|_next/static|_next/image|favicon.ico|login|register|auth|$|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
