import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/middleware";

/**
 * Mapeo de id_rol a rutas de dashboard.
 *   1 → Administrador → /dashboard/admin
 *   2 → Encargado    → /dashboard/encargados
 *   3 → Usuario      → /dashboard/perfil
 */

/**
 * Retorna la ruta del dashboard que le corresponde al usuario según su id_rol.
 */
function getDashboardPath(idRol: number): string {
  if (idRol === 1) return "/dashboard/admin";
  if (idRol === 2) return "/dashboard/encargados";
  return "/dashboard/perfil"; // Para id_rol=3 o cualquier otro valor, redirige a dashboard de usuario
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
    pathname === "/dashboard/encargados" ||
    pathname.startsWith("/dashboard/encargados/")
  ) {
    return 2; // Admin (1) o Encargado (2)
  }
  // Rutas compartidas entre Admin y Encargado (unificación de roles)
  if (
    pathname === "/dashboard/mi-ua" ||
    pathname.startsWith("/dashboard/mi-ua/") ||
    pathname === "/dashboard/usuarios-ua" ||
    pathname.startsWith("/dashboard/usuarios-ua/") ||
    pathname === "/dashboard/tickets-gestion" ||
    pathname.startsWith("/dashboard/tickets-gestion/") ||
    pathname === "/dashboard/generar-tokens" ||
    pathname.startsWith("/dashboard/generar-tokens/") ||
    pathname === "/dashboard/mapa" ||
    pathname.startsWith("/dashboard/mapa/")
  ) {
    return 2; // Admin (1) o Encargado (2) pueden acceder
  }
  if (
    pathname === "/dashboard/perfil" ||
    pathname.startsWith("/dashboard/perfil/")
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
export async function proxy(request: NextRequest) {
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
     * - favicon.ico, archivos de imagen/estáticos
     * - Páginas públicas explícitas (para evitar bucles de redirección)
     * - La raíz / y /aboutme, /about-ige son públicas
     * - /auth/callback debe pasar sin ser interceptado
     */
    "/((?!api|_next/static|_next/image|favicon.ico|login|register|auth|faqs|terminos|privacidad|aboutme|about-ige|$|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};