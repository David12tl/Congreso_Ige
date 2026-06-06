'use server';

import { createClient } from '@/src/lib/supabase/server';
import { redirect } from 'next/navigation';
import { generateAndSendCredential } from '@/src/app/auth/actions-credentials';

export type AuthResult = { error: string } | { success: true };

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
  const { getUserProfile, syncAuthMetadataWithProfile } = await import('@/src/db/perfiles');
  const profile = await getUserProfile(userId);

  // Sincronizar metadata de Auth con el valor real de la BD
  await syncAuthMetadataWithProfile(userId);

  redirect(getDashboardPath(profile.id_rol));
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
    console.error('Error creando ticket:', ticketError);
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
        console.warn('Advertencia: Credencial no generada:', credentialResult.error);
        // No bloqueamos el registro si la credencial falla
      }
    } catch (credentialError) {
      console.error('Error generando credencial:', credentialError);
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
 * Inicia el flujo de autenticación con Google.
 * Genera la URL de redirección segura a través del servidor de Supabase.
 */
export async function signInWithGoogle(): Promise<string> {
  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const redirectTo = `${siteUrl.replace(/\/$/, '')}/auth/callback`;

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