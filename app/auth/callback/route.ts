import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserProfile, syncAuthMetadataWithProfile } from '@/db/perfiles';
import { getSecureRedirectBase, getRequestOrigin } from '@/utils/supabase/get-redirect-url';

/**
 * ============================================================================
 * OAuth Callback Route Handler - OWASP Security Best Practices
 * ============================================================================
 * 
 * Security considerations:
 * - Validates the presence and format of the authorization code
 * - Uses secure redirect base from environment configuration OR request origin
 * - Never exposes internal error details to the client
 * - Prevents open redirect vulnerabilities
 * - Validates user profile before redirecting to protected routes
 */

/**
 * Allowed error query parameters (whitelist)
 * Prevents open redirect by only allowing predefined error messages
 */
const ALLOWED_ERROR_PARAMS = ['invalid-code', 'auth-failed', 'session-expired', 'config-error'] as const;

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
 * Sanitizes error parameter for safe redirect
 * OWASP: Never expose raw error values to prevent injection
 */
function sanitizeErrorParam(error: string | null): string {
  const sanitized = error?.toLowerCase().trim();
  if (sanitized && ALLOWED_ERROR_PARAMS.includes(sanitized as typeof ALLOWED_ERROR_PARAMS[number])) {
    return sanitized;
  }
  // Default safe error message
  return 'auth-failed';
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  
  // OWASP: Get secure origin from request (dynamic, for serverless environments)
  // This detects automatically if we're on localhost or your Vercel domain
  // The origin is validated against the whitelist to prevent Open Redirect
  const requestOrigin = getRequestOrigin(request);
  
  // Priority: env var > validated request origin
  // This ensures we use NEXT_PUBLIC_SITE_URL if configured, but falls back safely
  const secureOrigin = getSecureRedirectBase(requestOrigin) || requestOrigin || 'https://congreso-ige.vercel.app';

  // Validate that we have an authorization code
  // OWASP: This prevents processing empty or malformed requests
  if (!code || code.length === 0) {
    // No code provided - redirect to login with generic error
    return NextResponse.redirect(
      `${secureOrigin}/login?error=${sanitizeErrorParam('invalid-code')}`,
      { status: 307 }
    );
  }

  // Validate code format to prevent injection attacks
  // Authorization codes are typically alphanumeric with some special chars
  if (!/^[a-zA-Z0-9\-_]+$/.test(code)) {
    // Malformed code - possible attack attempt
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Security] Invalid authorization code format detected');
    }
    return NextResponse.redirect(
      `${secureOrigin}/login?error=${sanitizeErrorParam('invalid-code')}`,
      { status: 307 }
    );
  }

  const supabase = await createClient();

  // Exchange the temporary code for a session
  // This happens server-side so cookies are set securely with HttpOnly flags
  const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError || !data?.user) {
    // Code exchange failed - could be expired, invalid, or revoked
    // OWASP: Use generic error message, don't expose internal details
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Security] OAuth code exchange failed');
    }
    return NextResponse.redirect(
      `${secureOrigin}/login?error=${sanitizeErrorParam('invalid-code')}`,
      { status: 307 }
    );
  }

  const user = data.user;

  try {
    // --- CRITICAL: Get the REAL id_rol from the database ---
    // Never trust user_metadata for authorization decisions (OWASP auth security)
    const profile = await getUserProfile(user.id);
    
    // If profile doesn't exist or role is invalid, default to user dashboard
    const safeIdRol = profile?.id_rol ?? 3;

    // Synchronize auth metadata with the real database value
    // This ensures future reads of user_metadata will be correct
    await syncAuthMetadataWithProfile(user.id);

    // Redirect to the appropriate dashboard based on the verified role
    // Using 307 (Temporary Redirect) to prevent caching of auth responses
    return NextResponse.redirect(
      `${secureOrigin}${getDashboardPath(safeIdRol)}`,
      { status: 307 }
    );
  } catch {
    // Database error - fail securely by redirecting to user dashboard
    // OWASP: Don't expose database errors to client
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Security] Profile lookup failed during OAuth callback');
    }
    
    // Default safe redirect - user dashboard (lowest privilege)
    return NextResponse.redirect(
      `${secureOrigin}/dashboard/usuario`,
      { status: 307 }
    );
  }
}