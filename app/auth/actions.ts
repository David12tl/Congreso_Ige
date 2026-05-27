'use server';

import { createClient } from '@/src/lib/supabase/server';
import { redirect } from 'next/navigation';

export type AuthResult = { error: string } | { success: true };

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

/**
 * Inicio de sesión con correo y contraseña.
 * Usa el cliente de servidor de Supabase para que las cookies de sesión
 * se guarden correctamente. Si hay error, devuelve un mensaje claro.
 * Si es exitoso, redirige al dashboard según el rol del usuario.
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
    const message = mapSupabaseError(error.message);
    return { error: message };
  }

  // Redirigir al dashboard según el rol del usuario
  const role = data.user?.user_metadata?.role as string | undefined;
  redirect(getDashboardPath(role));
}

/**
 * Registro de nuevo usuario con correo, contraseña, nombre completo y land de interés.
 * Usa user_metadata para guardar full_name y land_interest.
 * Si hay error, devuelve un mensaje claro.
 * Si es exitoso, redirige al dashboard según el rol del usuario.
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
      },
    },
  });

  if (error) {
    const message = mapSupabaseError(error.message);
    return { error: message };
  }

  // Redirigir al dashboard según el rol del usuario
  const role = signUpData.user?.user_metadata?.role as string | undefined;
  redirect(getDashboardPath(role));
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
 * Inicia el flujo de autenticación con Google.
 * Genera la URL de redirección segura a través del servidor de Supabase.
 */
export async function signInWithGoogle(): Promise<string> {
  const supabase = await createClient();
  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return data.url;
}

/**
 * Mapea mensajes de error de Supabase a español claro para el usuario.
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

  // Fallback: devolver el mensaje original en inglés si no está mapeado
  return message;
}