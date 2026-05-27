import { type NextRequest } from "next/server";
import { createClient } from "@/src/lib/supabase/middleware";

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

/**
 * Rutas cuyo acceso está restringido por rol.
 * Cada entrada: [prefijo de ruta, rol requerido]
 */
const roleRestrictedPaths: [string, string][] = [
  ["/dashboard/admin", "admin"],
  ["/dashboard/encargado", "encargado"],
];

export async function proxy(request: NextRequest) {
  // Crear el cliente de Supabase para el proxy
  const { supabase, response } = await createClient(request);

  // Refrescar la sesión automáticamente (si el token expiró)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // --- Lógica de protección de rutas ---
  const protectedPaths = [
    "/dashboard",
    "/dashboard/admin",
    "/dashboard/encargado",
    "/dashboard/usuario",
    "/perfil",
    "/encargado",
  ];
  const isProtected = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path),
  );

  const authPaths = ["/login", "/register"];
  const isAuthPage = authPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path),
  );

  // Si es ruta protegida y no hay usuario autenticado → redirigir a login
  if (isProtected && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return Response.redirect(loginUrl);
  }

  // Si ya está autenticado y trata de ir a login/register → redirigir a su dashboard
  if (isAuthPage && user) {
    const role = user.user_metadata?.role as string | undefined;
    return Response.redirect(new URL(getDashboardPath(role), request.url));
  }

  // --- Validación de acceso por rol ---
  if (user) {
    const userRole = user.user_metadata?.role as string | undefined;

    for (const [path, requiredRole] of roleRestrictedPaths) {
      if (
        request.nextUrl.pathname.startsWith(path) &&
        userRole !== requiredRole
      ) {
        // Redirigir al dashboard que le corresponde según su rol
        return Response.redirect(
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
     * Coincide con todas las rutas excepto:
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico
     * - archivos públicos (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
