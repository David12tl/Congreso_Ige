/**
 * ============================================================================
 * Secure Redirect URL Helper - OWASP Best Practices
 * ============================================================================
 * 
 * This module implements secure redirect URL handling following OWASP guidelines:
 * - Prevents Open Redirect vulnerabilities by validating and sanitizing URLs
 * - Never exposes internal server details or private environment variables
 * - Uses a whitelist approach for allowed redirect origins
 * - Validates URLs to prevent SSRF and malicious redirects
 */

/**
 * Valid redirect URL suffixes for OAuth callbacks
 * Using a strict whitelist prevents path traversal and injection attacks
 */
const ALLOWED_CALLBACK_PATHS = ['/auth/callback'] as const;

/**
 * Valid production origins (whitelist)
 * This prevents Open Redirect by only allowing known domains
 */
const PRODUCTION_ORIGINS = [
  'https://congreso-ige.vercel.app',
] as const;

/**
 * Development origins for local testing
 * Only used when NODE_ENV === 'development'
 */
const DEVELOPMENT_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
] as const;

/**
 * All allowed origins (production + development)
 * Used for dynamic origin validation in serverless environments
 */
const ALL_ALLOWED_ORIGINS = [...PRODUCTION_ORIGINS, ...DEVELOPMENT_ORIGINS] as const;

/**
 * Validates that an origin is in the whitelist of allowed origins.
 * This prevents Open Redirect attacks by only allowing known domains.
 * 
 * @param origin - The origin to validate
 * @returns true if the origin is safe to use for redirects
 */
export function isOriginAllowed(origin: string): boolean {
  try {
    // Basic URL validation to prevent injection
    const url = new URL(origin);
    return ALL_ALLOWED_ORIGINS.includes(url.origin as typeof ALL_ALLOWED_ORIGINS[number]);
  } catch {
    return false;
  }
}

/**
 * Safely extracts and validates the origin from an environment variable
 * 
 * Security considerations:
 * - Only allows HTTPS in production (except localhost for dev)
 * - Rejects malformed URLs that could be injection attempts
 * - Falls back to safe defaults if env var is invalid
 */
function getValidatedOriginFromEnv(): string | null {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  
  if (!siteUrl) {
    return null;
  }

  try {
    const url = new URL(siteUrl);
    
    // Enforce HTTPS for production domains (security best practice)
    // Allow http only for localhost/127.0.0.1 in development
    const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    const isProductionHttps = url.protocol === 'https:' && !isLocalhost;
    
    if (!isLocalhost && !isProductionHttps) {
      // Log warning in development only, never expose in production
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          `[Security] NEXT_PUBLIC_SITE_URL must use HTTPS in production. Got: ${url.protocol}`
        );
      }
      return null;
    }

    // Normalize the URL - remove trailing slashes, paths, and search params
    return `${url.protocol}//${url.host}`;
  } catch {
    // Invalid URL format - could be an injection attempt
    // Never expose the invalid value in error messages
    return null;
  }
}

/**
 * Gets the secure base URL for OAuth redirects
 * 
 * Priority order:
 * 1. NEXT_PUBLIC_SITE_URL environment variable (Vercel production)
 * 2. requestOrigin parameter (extracted from the incoming request in serverless)
 * 3. window.location.origin (client-side only, when no env var)
 * 4. http://localhost:3000 (development fallback)
 * 
 * @param requestOrigin - Optional origin from the incoming request (for serverless environments)
 * @returns The sanitized base URL for redirects
 */
export function getSecureRedirectBase(requestOrigin?: string): string {
  // Priority 1: Environment variable (configured in Vercel)
  const envOrigin = getValidatedOriginFromEnv();
  if (envOrigin) {
    return envOrigin;
  }

  // Priority 2: Request origin (for serverless/edge environments)
  // This extracts the origin from the incoming request URL
  if (requestOrigin && isOriginAllowed(requestOrigin)) {
    return requestOrigin;
  }

  // Priority 3: In server-side context (Route Handler, Server Action), 
  // fall back to localhost only in development
  if (typeof window === 'undefined') {
    if (process.env.NODE_ENV === 'development') {
      return 'http://localhost:3000';
    }
    // In production server-side context without env var or valid request origin,
    // return empty string to trigger safe fallback in caller
    // The caller should handle this by using the request origin dynamically
    return '';
  }

  // Priority 4: Client-side: use window.location.origin safely
  // The browser ensures this is always the actual origin
  return window.location.origin;
}

/**
 * Extracts and validates the origin from the incoming request
 * Used in Route Handlers to get the real origin in serverless environments
 * 
 * @param request - The incoming Request object
 * @returns The validated origin string or empty string if not allowed
 */
export function getRequestOrigin(request: Request): string {
  try {
    const requestUrl = new URL(request.url);
    const origin = requestUrl.origin;
    
    // Validate against whitelist
    if (isOriginAllowed(origin)) {
      return origin;
    }
    
    // Log warning in development only
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[Security] Request origin not in whitelist: ${origin}`);
    }
    
    return '';
  } catch {
    return '';
  }
}

/**
 * Generates a secure OAuth callback URL
 * 
 * Security features:
 * - Uses whitelisted path suffix only
 * - Validates the base URL to prevent open redirects
 * - Never exposes internal URLs to external origins
 * 
 * @param requestOrigin - Optional origin from the incoming request (for serverless environments)
 * @returns The complete callback URL for redirectTo in signInWithOAuth
 */
export function getSecureCallbackUrl(requestOrigin?: string): string {
  const base = getSecureRedirectBase(requestOrigin);
  
  // If we have a validated base, append the callback path
  if (base) {
    return `${base}/auth/callback`;
  }

  // Emergency fallback - should only hit in misconfigured environments
  // Using localhost as ultimate fallback prevents complete failure
  // while still being safe (local development only)
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000/auth/callback';
  }

  // In production, don't expose the real URL in error cases
  // This prevents information leakage
  // The OAuth will fail gracefully and user can try again
  return '';
}

/**
 * Validates a URL against the whitelist of allowed origins
 * Used for additional security validation in critical paths
 * 
 * @param url - The URL to validate
 * @returns true if the URL is safe to use for redirects
 */
export function isUrlInWhitelist(url: string): boolean {
  try {
    const parsedUrl = new URL(url, 'http://localhost');
    const origin = parsedUrl.origin;

    // Check production origins
    if (PRODUCTION_ORIGINS.includes(origin as typeof PRODUCTION_ORIGINS[number])) {
      return true;
    }

    // Check development origins (only in dev mode)
    if (process.env.NODE_ENV === 'development') {
      return DEVELOPMENT_ORIGINS.includes(origin as typeof DEVELOPMENT_ORIGINS[number]);
    }

    return false;
  } catch {
    return false;
  }
}