import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/src/lib/supabase/middleware";

/**
 * Mapeo de id_rol a rutas de dashboard.
 *   1 → Administrador → /dashboard/admin
 *   2 → Encargado    → /dashboard/encargado
 *   3 → Usuario      → /dashboard/usuario
 */

/**
 * Retorna la ruta del dashboard que le corresponde al usuario según su id_rol.
 */
function getDashboardPath(idRol: number): string {
  if (idRol === 1) return "/dashboard/admin";
  if (idRol === 2) return "/dashboard/encargado";
  return "/dashboard/usuario";
}

/**
 * Retorna el id_rol mínimo requerido para acceder a una ruta del dashboard.
 * Retorna null si la ruta no está dentro del dashboard protegido.
 */
function getRequiredRole(pathname: string): number | null {
  if (
    pathname === "/dashboard/admin" ||
    pathname.startsWith("/dashboard/admin/")
  ) {
    return 1; // Solo Admin (id_rol=1)
  }
  if (
    pathname === "/dashboard/encargado" ||
    pathname.startsWith("/dashboard/encargado/")
  ) {
    return 2; // Admin (1) o Encargado (2)
  }
  if (
    pathname === "/dashboard/usuario" ||
    pathname.startsWith("/dashboard/usuario/")
  ) {
    return 3; // Cualquier rol (1, 2 o 3)
  }
  return null;
}

/**
 * Middleware de Next.js: Guardaespaldas de URLs.
 * Intercepta cualquier intento de acceso a rutas protegidas y valida:
 * 1. Que el usuario esté autenticado (sesión activa en Supabase).
 * 2. Que el id_rol del usuario sea suficiente para la ruta solicitada.
 * 3. Redirige según las reglas estrictas de jerarquía.
 */
export async function middleware(request: NextRequest) {
  const { supabase, response } = await createClient(request);

  // Refrescar sesión automáticamente
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // --- Determinar si la ruta actual es parte del dashboard protegido ---
  const isDashboardRoute =
    pathname === "/dashboard" || pathname.startsWith("/dashboard/");

  // --- REGLA: Usuario no autenticado → redirigir a /login ---
  if (isDashboardRoute && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl, 307);
  }

  // --- Validación por id_rol (solo aplica si hay sesión) ---
  if (isDashboardRoute && user) {
    // Consultar id_rol real desde la base de datos
    let idRol = 3; // Default: Usuario

    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id_rol")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error(
          "[middleware] Error al consultar perfil en BD:",
          profileError.message,
        );
      }

      if (profileData) {
        idRol = profileData.id_rol;
      }

      if (!profileData && !profileError) {
        console.warn(
          `[middleware] Perfil no encontrado para user ${user.id}. Usando id_rol=3 por defecto.`,
        );
      }
    } catch (e) {
      // Fallback a user_metadata si hay error inesperado
      console.error("[middleware] Error inesperado al consultar perfil:", e);
      idRol =
        (user.user_metadata?.id_rol as number | undefined) ??
        (() => {
          const role = user.user_metadata?.role as string | undefined;
          switch (role) {
            case "admin":
              return 1;
            case "encargado":
              return 2;
            default:
              return 3;
          }
        })();
    }

    const requiredRole = getRequiredRole(pathname);

    if (requiredRole !== null) {
      // Si el id_rol del usuario es mayor (menos permisos) que el requerido, redirigir
      // id_rol: 1=admin(más permisos), 2=encargado, 3=usuario(menos permisos)
      // El acceso está permitido si id_rol <= requiredRole (número más bajo = más permisos)
      if (idRol > requiredRole) {
        // Redirigir al dashboard que le corresponde según su id_rol
        return NextResponse.redirect(
          new URL(getDashboardPath(idRol), request.url),
          307,
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
     * - API routes
     * - Archivos estáticos de Next.js (_next/static, _next/image)
     * - favicon.ico
     * - Archivos de imagen/estáticos (.svg, .png, .jpg, .jpeg, .gif, .webp)
     * - Páginas públicas explícitas (para evitar bucles de redirección)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|login|register|auth|faqs|terminos|privacidad|$|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};