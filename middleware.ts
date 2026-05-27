import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/src/lib/supabase/middleware";

/**
 * Jerarquía de niveles de acceso numéricos.
 * Coinciden con la tabla de roles de la base de datos.
 */
const NIVEL_ADMIN = 3;
const NIVEL_ENCARGADO = 2;
const NIVEL_USUARIO = 1;

/**
 * Define el nivel mínimo requerido para acceder a una ruta del dashboard.
 * Retorna null si la ruta no está dentro del dashboard protegido.
 */
function getRequiredLevel(pathname: string): number | null {
  if (
    pathname === "/dashboard/admin" ||
    pathname.startsWith("/dashboard/admin/")
  ) {
    return NIVEL_ADMIN;
  }
  if (
    pathname === "/dashboard/encargado" ||
    pathname.startsWith("/dashboard/encargado/")
  ) {
    return NIVEL_ENCARGADO;
  }
  if (
    pathname === "/dashboard/usuario" ||
    pathname.startsWith("/dashboard/usuario/")
  ) {
    return NIVEL_USUARIO;
  }
  return null;
}

/**
 * Retorna la ruta del dashboard que le corresponde al usuario
 * según su nivel de acceso numérico.
 */
function getDashboardByLevel(nivel: number): string {
  if (nivel >= NIVEL_ADMIN) return "/dashboard/admin";
  if (nivel === NIVEL_ENCARGADO) return "/dashboard/encargado";
  return "/dashboard/usuario";
}

/**
 * Rutas públicas que NO requieren autenticación ni pasan por el middleware.
 */
const publicRoutes = [
  "/login",
  "/register",
  "/auth",
  "/faqs",
  "/terminos",
  "/privacidad",
];

/**
 * Middleware de Next.js: Guardaespaldas de URLs.
 * Intercepta cualquier intento de acceso a rutas protegidas y valida:
 * 1. Que el usuario esté autenticado (sesión activa en Supabase).
 * 2. Que el nivel de acceso del usuario sea suficiente para la ruta solicitada.
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

  // --- REGLA 4: Usuario no autenticado → redirigir a /login ---
  if (isDashboardRoute && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl, 307);
  }

  // --- Validación por nivel de acceso (solo aplica si hay sesión) ---
  if (isDashboardRoute && user) {
    // --- CONSULTAR NIVEL DE ACCESO REAL DESDE LA BASE DE DATOS ---
    // Esto cubre el caso donde un admin cambió el rol en la BD
    // y la sesión aún tiene metadata desactualizada (incluso si no se
    // ha llamado a syncAuthMetadataWithProfile todavía).
    let nivelAcceso = NIVEL_USUARIO;

    try {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id_rol, roles ( id_rol, nombre_rol, nivel_acceso )")
        .eq("id", user.id)
        .single();

      if (profileData) {
        const rolesData = Array.isArray(profileData.roles)
          ? profileData.roles[0]
          : profileData.roles;
        nivelAcceso =
          (rolesData as { nivel_acceso?: number })?.nivel_acceso ??
          NIVEL_USUARIO;
      }
    } catch (e) {
      // Fallback a user_metadata si la consulta falla
      console.error("[middleware] Error al consultar perfil:", e);
      nivelAcceso =
        (user.user_metadata?.nivel_acceso as number | undefined) ??
        (() => {
          const role = user.user_metadata?.role as string | undefined;
          switch (role) {
            case "admin":
              return NIVEL_ADMIN;
            case "encargado":
              return NIVEL_ENCARGADO;
            default:
              return NIVEL_USUARIO;
          }
        })();
    }

    const requiredLevel = getRequiredLevel(pathname);

    if (requiredLevel !== null) {
      if (nivelAcceso < requiredLevel) {
        // REGLA 1 y 2: Redirigir al dashboard que le corresponde
        return NextResponse.redirect(
          new URL(getDashboardByLevel(nivelAcceso), request.url),
          307,
        );
      }

      // REGLA 3: Nivel 3 (Admin) puede pasar a cualquier ruta del dashboard
      // (la condición nivelAcceso >= requiredLevel ya lo permite)
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