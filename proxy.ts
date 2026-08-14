import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Mapeo de id_rol a rutas de dashboard.
 *   1 → Administrador → /elige/admin
 *   2 → Encargado    → /elige/encargados
 *   3 → Usuario      → /elige/perfil
 */

/**
 * Retorna la ruta del dashboard que le corresponde al usuario según su id_rol.
 */
function getDashboardPath(idRol: number): string {
  if (idRol === 1) return "/elige/admin";
  if (idRol === 2) return "/elige/encargados";
  return "/elige/perfil"; // Para id_rol=3 o cualquier otro valor, redirige a dashboard de usuario
}

/**
 * Retorna el id_rol mínimo requerido para acceder a una ruta del dashboard.
 * Retorna null si la ruta no está dentro del dashboard protegido.
 */
function getRequiredRole(pathname: string): number | null {
  if (
    pathname === "/elige/admin" ||
    pathname.startsWith("/elige/admin/")
  ) {
    return 1; // Solo Admin (id_rol=1)
  }
  if (
    pathname === "/elige/encargados" ||
    pathname.startsWith("/elige/encargados/")
  ) {
    return 2; // Admin (1) o Encargado (2)
  }
  // Rutas compartidas entre Admin y Encargado (unificación de roles)
  if (
    pathname === "/elige/mi-ua" ||
    pathname.startsWith("/elige/mi-ua/") ||
    pathname === "/elige/usuarios-ua" ||
    pathname.startsWith("/elige/usuarios-ua/") ||
    pathname === "/elige/tickets-gestion" ||
    pathname.startsWith("/elige/tickets-gestion/") ||
    pathname === "/elige/generar-tokens" ||
    pathname.startsWith("/elige/generar-tokens/") ||
    pathname === "/elige/mapa" ||
    pathname.startsWith("/elige/mapa/")
  ) {
    return 2; // Admin (1) o Encargado (2) pueden acceder
  }
  if (
    pathname === "/elige/perfil" ||
    pathname.startsWith("/elige/perfil/")
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
  const { pathname } = request.nextUrl;

  // --- REGLA DE ESCAPE: Rutas de autenticación de Supabase ---
  // Estas rutas deben pasar SIEMPRE por el middleware para que Supabase
  // pueda establecer las cookies de sesión. Si las interceptamos antes,
  // el flujo OAuth se rompe y redirige a /login.
  if (pathname.startsWith("/auth")) {
    return NextResponse.next();
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // --- Rutas públicas que no requieren autenticación ---
  const publicRoutes = [
    "/",
    "/login",
    "/register",
    "/investigacion",
    "/reset-password",
    "/update-password",
    "/about-ige",
    "/aboutme",
    "/Conferencias",
    "/faqs",
    "/info",
    "/privacidad",
    "/terminos",
  ];

  const isPublicRoute = publicRoutes.some(
    (route) =>
      pathname === route || pathname.startsWith(route + "/")
  );

  // --- Determinar si la ruta actual es parte del dashboard protegido ---
  const isDashboardRoute =
    pathname === "/elige" || pathname.startsWith("/elige/");

  // --- REGLA: Usuario no autenticado → redirigir a /login ---
  if (!user && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url);
    if (isDashboardRoute) {
      loginUrl.searchParams.set("redirect", pathname);
    }
    return NextResponse.redirect(loginUrl, 307);
  }

  // --- REGLA: Usuario autenticado en login/register → redirigir al dashboard ---
  if (user && (pathname === "/login" || pathname === "/register")) {
    // Consultar id_rol para redirigir al dashboard correcto
    let idRol = 3; // Default: Usuario

    try {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id_rol")
        .eq("id", user.id)
        .maybeSingle();

      if (profileData) {
        idRol = profileData.id_rol;
      }
    } catch {
      // Fallback a user_metadata si hay error
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

    return NextResponse.redirect(
      new URL(getDashboardPath(idRol), request.url),
      307
    );
  }

  // --- Validación por id_rol (solo aplica si hay sesión y es ruta del dashboard) ---
  if (isDashboardRoute && user) {
    // Consultar id_rol real desde la base de datos
    let idRol = 3; // Default: Usuario

    try {
      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("id_rol")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error(
          "[middleware] Error al consultar perfil en BD:",
          error.message,
        );
      }

      if (profileData) {
        idRol = profileData.id_rol;
      }

      if (!profileData && !error) {
        console.warn(
          `[middleware] Perfil no encontrado para user ${user.id}. Usando id_rol=3 por defecto.`,
        );
      }
    } catch {
      // Fallback a user_metadata si hay error inesperado
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

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas excepto:
     * - API routes
     * - Archivos estáticos de Next.js (_next/static, _next/image)
     * - favicon.ico, archivos de imagen/estáticos
     * - Páginas públicas explícitas (para evitar bucles de redirección)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp)).*)",
  ],
};