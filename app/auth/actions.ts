'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { generateAndSendCredential } from '@/lib/auth/actions-credentials';
import { getSecureCallbackUrl } from '@/utils/supabase/get-redirect-url';

export type AuthResult = { error: string } | { success: true; redirectTo?: string };

/**
 * Mapea id_rol a la ruta del dashboard correspondiente.
 *   1 → Administrador → /dashboard/admin
 *   2 → Encargado    → /dashboard/encargado
 *   3 → Usuario      → /dashboard/usuario
 */
function getDashboardPath(idRol: number): string {
  if (idRol === 1) return '/dashboard/admin';
  if (idRol === 2) return '/dashboard/encargado';
  return '/dashboard/usuario';
}

/**
 * Inicio de sesión con correo y contraseña.
 * Usa el cliente de servidor de Supabase para que las cookies de sesión
 * se guarden correctamente. Si hay error, devuelve un mensaje claro.
 * Si es exitoso:
 *  1. Consulta el id_rol REAL desde la base de datos (tabla profiles)
 *  2. Sincroniza los metadatos de Auth con el valor real
 *  3. Redirige al dashboard según el id_rol REAL
 */
export async function signInWithPassword(
  email: string,
  password: string,
): Promise<AuthResult> {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Mapear mensajes de error comunes de Supabase a español
    // OWASP: No exponer detalles internos del error
    const message = mapSupabaseError(error.message);
    return { error: message };
  }

  const userId = data.user?.id;
  if (!userId) {
    return { error: 'Error al obtener el usuario autenticado.' };
  }

  // --- CRÍTICO: Consultar id_rol REAL desde la base de datos ---
  // No confiar en user_metadata porque puede estar desactualizada
  // cuando un administrador cambia el rol en la BD.
  const { getUserProfile, syncAuthMetadataWithProfile } = await import('@/db/perfiles');
  const profile = await getUserProfile(userId);

  // Sincronizar metadata de Auth con el valor real de la BD
  await syncAuthMetadataWithProfile(userId);

  // NOTA: No usar redirect() aquí porque lanza una excepción (NEXT_REDIRECT)
  // que causa Error 500 cuando la Server Action es invocada manualmente
  // desde el cliente. En su lugar, devolvemos la ruta para que el cliente
  // haga la navegación con router.push().
  return { success: true, redirectTo: getDashboardPath(profile.id_rol) };
}

/**
 * Registro de nuevo usuario con correo, contraseña, nombre completo y land de interés.
 * TAMBIÉN:
 * 1. Crea un ticket para el usuario
 * 2. Asigna un asiento automáticamente
 * 3. Genera y envía la credencial en PDF
 */
export async function signUp(data: {
  email: string;
  password: string;
  fullName: string;
  landInterest: string;
}): Promise<AuthResult> {
  const supabase = await createClient();

  const { data: signUpData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        full_name: data.fullName,
        land_interest: data.landInterest,
        role: 'user',
        id_rol: 3, // Nivel 3 (Usuario) por defecto en el registro
      },
    },
  });

  if (error) {
    const message = mapSupabaseError(error.message);
    return { error: message };
  }

  const userId = signUpData.user?.id;
  if (!userId) {
    return { error: 'Error al obtener el ID del usuario.' };
  }

  // ========== CREAR TICKET EN LA BASE DE DATOS ==========
  // Generar un UUID para el QR
  const { v4: uuidv4 } = await import('uuid');
  const qrData = uuidv4();

  const { data: ticketData, error: ticketError } = await supabase
    .from('tickets')
    .insert({
      id: uuidv4(),
      buyer_id: userId,
      email: data.email,
      nombre: data.fullName,
      type: 'student', // Tipo por defecto
      qr_data: qrData,
      purchased_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (ticketError || !ticketData) {
    // OWASP: En producción, no exponer errores internos en consola
    // Solo loggear en desarrollo para debugging
    if (process.env.NODE_ENV === 'development') {
      console.error('Error creando ticket:', ticketError?.message);
    }
    // No retornar error, el usuario se registró correctamente
    // Pero sin ticket, no tendrá credencial
  }

  // ========== GENERAR Y ENVIAR CREDENCIAL ==========
  if (ticketData?.id) {
    try {
      const credentialResult = await generateAndSendCredential(
        ticketData.id,
        userId
      );

      if (!credentialResult.success) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Advertencia: Credencial no generada');
        }
        // No bloqueamos el registro si la credencial falla
      }
    } catch {
      // OWASP: Silenciar errores internos en producción
      // Loggear solo en desarrollo
      if (process.env.NODE_ENV === 'development') {
        console.warn('Error generando credencial');
      }
      // Continuamos con el registro
    }
  }

  // Redirigir al dashboard según el id_rol del usuario
  const idRol = signUpData.user?.user_metadata?.id_rol as number | undefined;
  redirect(getDashboardPath(idRol ?? 3));
}

/**
 * Cierre de sesión.
 * Borra las cookies de sesión y redirige al inicio.
 */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}

/**
 * Inicia el flujo de autenticación con Google OAuth.
 * 
 * Security considerations (OWASP):
 * - Uses secure callback URL from helper to prevent Open Redirect
 * - Never constructs URLs with user input
 * - Validates redirect URL against whitelist
 * - Generic error messages to prevent information disclosure
 */
export async function signInWithGoogle(): Promise<string> {
  const supabase = await createClient();
  
  // OWASP: Usar URL de redirección segura validada contra whitelist
  const redirectTo = getSecureCallbackUrl();
  
  // Validar que tenemos una URL válida antes de continuar
  if (!redirectTo) {
    // OWASP: Error genérico sin exponer detalles internos
    throw new Error('No se pudo iniciar el proceso de autenticación. Intente más tarde.');
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      queryParams: {
        prompt: 'select_account',
      },
    },
  });

  if (error) {
    // OWASP: Mensaje de error genérico sin exponer detalles del servidor
    // No propagar mensajes de error internos al cliente
    throw new Error('Error de conexión con el proveedor de autenticación. Intente nuevamente.');
  }

  return data.url;
}

/**
 * Mapea mensajes de error de Supabase a español claro para el usuario.
 * OWASP: Solo devolver mensajes amigables, nunca exponer stack traces o detalles internos.
 */
function mapSupabaseError(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes('invalid login credentials')) {
    return 'Correo o contraseña incorrectos.';
  }
  if (lower.includes('email not confirmed')) {
    return 'El correo no ha sido confirmado. Revisa tu bandeja de entrada.';
  }
  if (lower.includes('user already registered')) {
    return 'Este correo electrónico ya está registrado.';
  }
  if (lower.includes('password should be at least')) {
    return 'La contraseña debe tener al menos 6 caracteres.';
  }
  if (lower.includes('rate limit')) {
    return 'Demasiados intentos. Espera un momento e inténtalo de nuevo.';
  }
  if (lower.includes('email address is invalid')) {
    return 'El formato del correo electrónico no es válido.';
  }

  // OWASP: Fallback genérico sin exponer el mensaje original
  // Esto evita filtrar detalles internos del sistema
  return 'Ocurrió un error inesperado. Por favor, intenta de nuevo.';
}