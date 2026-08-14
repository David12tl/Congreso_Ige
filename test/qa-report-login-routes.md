# Reporte de Pruebas QA - Sistema de Autenticación y Rutas

**Fecha:** 2026-10-07  
**Proyecto:** Congreso IGE 2026  
**Tipo de Prueba:** Pruebas de inicio de sesión y rutas del sistema  
**Estado:** Errores críticos encontrados

---

## Resumen Ejecutivo

Se realizaron pruebas exhaustivas del sistema de autenticación y rutas de la aplicación. Se encontraron **varios errores críticos** que impiden el funcionamiento correcto del flujo de autenticación y navegación post-login.

---

## Errores Críticos Encontrados

### 1. **ERROR CRÍTICO: Rutas de redirección incorrectas en `getDashboardPath`**

**Archivo:** `app/auth/actions.ts` (líneas 15-19)  
**Archivo:** `app/auth/callback/route.ts` (líneas 11-15)

**Problema:**
La función `getDashboardPath` retorna rutas relativas incorrectas en lugar de rutas absolutas:

```typescript
// INCORRECTO - app/auth/actions.ts
function getDashboardPath(idRol: number): string {
  if (idRol === 1) return '../../src/app/dashboard/admin';
  if (idRol === 2) return '../../src/app/dashboard/encargado';
  return '../../src/app/dashboard/usuario';
}

// INCORRECTO - app/auth/callback/route.ts
function getDashboardPath(idRol: number): string {
  if (idRol === 1) return "../../../src/app/dashboard/admin";
  if (idRol === 2) return "../../../src/app/dashboard/encargado";
  return "../../../src/app/dashboard/perfil";  // También ruta incorrecta para usuarios
}
```

**Impacto:**
- Los usuarios serán redirigidos a rutas inexistentes después de iniciar sesión
- Causará errores 404 en producción
- El flujo de autenticación se rompe completamente

**Solución Propuesta:**
```typescript
// CORRECTO
function getDashboardPath(idRol: number): string {
  if (idRol === 1) return '/dashboard/admin';
  if (idRol === 2) return '/dashboard/encargado';
  return '/dashboard/usuario';
}
```

**Prioridad:** 🔴 CRÍTICA - Bloquea completamente el flujo de autenticación

---

### 2. **ERROR CRÍTICO: Inconsistencia en ruta de redirección para usuarios**

**Archivo:** `app/auth/callback/route.ts` (línea 14)

**Problema:**
La ruta por defecto para usuarios (id_rol = 3) es inconsistente:
- En `app/auth/actions.ts`: retorna `'../../src/app/dashboard/usuario'`
- En `app/auth/callback/route.ts`: retorna `'../../../src/app/dashboard/perfil'`

**Impacto:**
- Los usuarios que inicien sesión con Google serán redirigidos a `/dashboard/perfil`
- Los usuarios que inicien sesión con credenciales serán redirigidos a `/dashboard/usuario`
- Comportamiento inconsistente según el método de autenticación

**Solución Propuesta:**
Ambas funciones deben retornar la misma ruta: `/dashboard/usuario`

**Prioridad:** 🔴 CRÍTICA - Comportamiento inconsistente

---

### 3. **ERROR: Case sensitivity en ruta de error del callback**

**Archivo:** `app/auth/callback/route.ts` (línea 49)

**Problema:**
```typescript
return NextResponse.redirect(`${origin}/Login?error=auth-callback-failed`);
```

La ruta usa `/Login` con mayúscula, pero la ruta real es `/login` (minúscula).

**Impacto:**
- En sistemas case-sensitive (Linux), causará error 404
- En sistemas case-insensitive (Windows), funcionará pero es una mala práctica

**Solución Propuesta:**
```typescript
return NextResponse.redirect(`${origin}/login?error=auth-callback-failed`);
```

**Prioridad:** 🟡 MEDIA - Funciona en Windows pero fallará en producción (Linux)

---

### 4. **ERROR: Middleware de autenticación no implementado**

**Archivo:** No existe `middleware.ts` en la raíz del proyecto

**Problema:**
No se encontró un archivo `middleware.ts` en la raíz del proyecto para proteger las rutas del dashboard. Aunque existe `src/lib/supabase/middleware.ts`, este es solo una función helper, no el middleware de Next.js.

**Impacto:**
- Las rutas del dashboard (`/dashboard/*`) no están protegidas
- Usuarios no autenticados pueden acceder directamente a rutas protegidas
- Falta validación de sesión en el servidor antes de renderizar las páginas

**Solución Propuesta:**
Crear `middleware.ts` en la raíz del proyecto:

```typescript
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Rutas públicas que no requieren autenticación
  const publicRoutes = ['/login', '/register', '/', '/about-ige', '/aboutme', 
                        '/Conferencias', '/faqs', '/info', '/privacidad', '/terminos'];
  
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname === route || request.nextUrl.pathname.startsWith(route + '/')
  );
  
  // Si no está autenticado y intenta acceder a ruta protegida
  if (!user && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Si está autenticado e intenta acceder a login/register, redirigir al dashboard
  if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard/usuario', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

**Prioridad:** 🔴 CRÍTICA - Falta protección de rutas

---

### 5. **ERROR: Redirección incorrecta en callback para rol admin/encargado**

**Archivo:** `app/auth/callback/route.ts` (líneas 11-14)

**Problema:**
Las rutas para admin y encargado también usan rutas relativas incorrectas:
```typescript
if (idRol === 1) return "../../../src/app/dashboard/admin";
if (id_rol === 2) return "../../../src/app/dashboard/encargado";
```

**Impacto:**
- Administradores y encargados no podrán acceder a sus dashboards
- Errores 404 después de autenticación

**Prioridad:** 🔴 CRÍTICA - Bloquea acceso a roles administrativos

---

## Pruebas Realizadas

### ✅ Pruebas Exitosas

1. **Estructura de archivos de autenticación**
   - ✅ `app/login/page.tsx` existe
   - ✅ `app/register/page.tsx` existe
   - ✅ `app/auth/actions.ts` existe con funciones de auth
   - ✅ `app/auth/callback/route.ts` existe
   - ✅ `src/components/auth/AuthForm.tsx` existe
   - ✅ `src/components/auth/RegisterForm.tsx` existe

2. **Componentes de UI**
   - ✅ Formulario de login con campos email y password
   - ✅ Botón de Google OAuth implementado
   - ✅ Validación de campos requeridos
   - ✅ Estados de carga (isLoading, googleLoading)
   - ✅ Manejo de errores con mensajes en español
   - ✅ Enlace a registro desde login

3. **Server Actions**
   - ✅ `signInWithPassword` implementado
   - ✅ `signInWithGoogle` implementado
   - ✅ `signUp` implementado con creación de ticket
   - ✅ `signOut` implementado
   - ✅ Mapeo de errores de Supabase a español

4. **Consulta de perfil**
   - ✅ `getUserProfile` consulta id_rol real desde BD
   - ✅ `syncAuthMetadataWithProfile` sincroniza metadata
   - ✅ Fallback a id_rol=3 si no existe perfil

### ❌ Pruebas Fallidas

1. ❌ Rutas de redirección post-login son incorrectas
2. ❌ Falta middleware de protección de rutas
3. ❌ Inconsistencia entre rutas de callback y actions
4. ❌ Case sensitivity en ruta de error

---

## Rutas del Sistema

### Rutas Públicas (sin autenticación)
- `/` - Página principal
- `/login` - Inicio de sesión
- `/register` - Registro de usuarios
- `/about-ige` - Acerca de IGE
- `/aboutme` - Acerca de mí
- `/Conferencias` - Conferencias
- `/faqs` - Preguntas frecuentes
- `/info` - Información
- `/privacidad` - Política de privacidad
- `/terminos` - Términos y condiciones

### Rutas Protegidas (requieren autenticación)
- `/dashboard/usuario` - Dashboard de usuario (id_rol=3)
- `/dashboard/encargado` - Dashboard de encargado (id_rol=2)
- `/dashboard/admin` - Dashboard de administrador (id_rol=1)
- `/dashboard/perfil` - Perfil de usuario
- `/dashboard/mapa` - Mapa de asientos
- `/dashboard/mis-asientos` - Mis asientos
- `/dashboard/generar-qr` - Generar QR
- `/dashboard/escanear-qr` - Escanear QR
- `/dashboard/tickets-gestion` - Gestión de tickets
- `/dashboard/tickets-vendidos` - Tickets vendidos
- `/dashboard/usuarios-list` - Lista de usuarios
- `/dashboard/encargados` - Gestión de encargados
- `/dashboard/reportes` - Reportes
- `/dashboard/monitoreo-mapa` - Monitoreo de mapa
- `/dashboard/generar-tokens` - Generar tokens
- `/dashboard/ingresar-token` - Ingresar token
- `/dashboard/listas-ua` - Listas UA
- `/dashboard/mi-ua` - Mi UA
- `/dashboard/usuarios-ua` - Usuarios UA

### Rutas de API
- `/api/tickets/scan` - API para escanear tickets

---

## Flujo de Autenticación Esperado

### Flujo con Credenciales (Email/Password)
1. Usuario accede a `/login`
2. Completa formulario con email y password
3. `AuthForm` llama a `signInWithPassword` (Server Action)
4. Server Action autentica con Supabase
5. Consulta `id_rol` real desde tabla `profiles`
6. Sincroniza `user_metadata` con `id_rol` real
7. Retorna ruta de redirección según `id_rol`
8. Cliente navega con `router.push()` a la ruta retornada
9. **PROBLEMA:** La ruta retornada es incorrecta (relativa en lugar de absoluta)

### Flujo con Google OAuth
1. Usuario accede a `/login`
2. Hace clic en botón "Google"
3. `AuthForm` llama a `signInWithGoogle` (Server Action)
4. Server Action genera URL de OAuth con Supabase
5. Usuario es redirigido a Google para autenticación
6. Google redirige a `/auth/callback` con código
7. `route.ts` intercambia código por sesión
8. Consulta `id_rol` real desde tabla `profiles`
9. Sincroniza `user_metadata` con `id_rol` real
10. Redirige a dashboard según `id_rol`
11. **PROBLEMA:** La ruta de redirección es incorrecta (relativa en lugar de absoluta)

---

## Recomendaciones

### Acciones Inmediatas (Bloqueantes)
1. ✅ Corregir `getDashboardPath` en `app/auth/actions.ts` para retornar rutas absolutas
2. ✅ Corregir `getDashboardPath` en `app/auth/callback/route.ts` para retornar rutas absolutas
3. ✅ Unificar ruta de redirección para usuarios en ambos archivos (`/dashboard/usuario`)
4. ✅ Corregir case sensitivity en ruta de error del callback (`/login` en lugar de `/Login`)
5. ✅ Implementar `middleware.ts` en la raíz del proyecto para proteger rutas del dashboard

### Acciones Adicionales (Mejoras)
1. Agregar pruebas unitarias para las funciones de autenticación
2. Implementar manejo de errores más robusto en el callback
3. Agregar logging de auditoría para intentos de acceso
4. Implementar rate limiting en endpoints de autenticación
5. Agregar validación de email en el frontend antes de enviar
6. Implementar recuperación de contraseña

---

## Próximos Pasos

1. Corregir todos los errores críticos identificados
2. Implementar pruebas de integración para el flujo completo de autenticación
3. Probar en ambiente de staging antes de desplegar a producción
4. Verificar que las rutas protegidas redirijan correctamente a `/login` cuando no hay sesión
5. Probar con los tres roles: admin, encargado, usuario

---

## Notas Adicionales

- El proyecto usa Next.js 16.2.7 con TypeScript
- Utiliza Supabase para autenticación y base de datos
- La estructura de rutas usa el App Router de Next.js
- No se encontró archivo `middleware.ts` en la raíz del proyecto
- El archivo `src/lib/supabase/middleware.ts` es solo un helper, no el middleware de Next.js

---

**Fin del Reporte**