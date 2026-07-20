'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { signInWithPassword } from '../../../app/auth/actions';

type AuthFormProps = {
  initialError?: string | null;
};

/**
 * OAuth SignIn Button Component
 * 
 * Security considerations (OWASP):
 * - Uses createClient (browser client) for OAuth flow
 * - No sensitive data exposed in error messages
 * - Uses secure redirect URL from server-side validation
 */
function GoogleSignInButton({ 
  disabled, 
  loading, 
  onError 
}: { 
  disabled: boolean;
  loading: boolean;
  onError: (error: string) => void;
}) {
  const handleGoogleSignIn = async () => {
    try {
      // Usar el cliente de Supabase para el navegador
      // Este cliente maneja automáticamente las cookies de sesión
      const supabase = createClient();
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // La URL de redirección se construye usando window.location.origin
          // que es seguro en el cliente ya que el navegador garantiza su origen
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            prompt: 'select_account',
          },
        },
      });

      if (error) {
        // OWASP: Error genérico sin exponer detalles internos
        onError('No se pudo conectar con Google. Por favor, intenta de nuevo.');
      }
      // Si no hay error, Supabase redirige automáticamente a la URL configurada
    } catch {
      // OWASP: Capturar errores inesperados sin exponer detalles
      onError('Error de conexión. Verifica tu conexión a internet e intenta nuevamente.');
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={disabled || loading}
      className="w-full py-3 px-4 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl flex items-center justify-center gap-3 transition-all duration-200 hover:border-slate-300 disabled:opacity-50"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.08 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
      </svg>
      <span className="text-sm font-bold text-slate-700">
        {loading ? 'Conectando...' : 'Entrar con Google'}
      </span>
    </button>
  );
}

export default function AuthForm({ initialError = null }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(initialError);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const result = await signInWithPassword(email, password);

    setIsLoading(false);

    if ('error' in result) {
      setError(result.error);
      return;
    }

    if (result.redirectTo) {
      router.push(result.redirectTo);
    } else {
      router.push('/elige/usuario');
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Título de acceso */}
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Iniciar Sesión
          </h2>
          <p className="text-sm text-[#64748B] mt-2">
            Ingresa tus datos para acceder a la plataforma.
          </p>
        </div>

        {/* Mensaje de Error - OWASP: Mensajes genéricos, no exponen detalles internos */}
        {error && (
          <div className="bg-[#f8d7da] border border-[#f5c6cb] rounded-lg px-4 py-3 text-sm text-[#721c24] text-center font-medium">
            {error}
          </div>
        )}

        {/* Botón de Google OAuth - Usando cliente de navegador */}
        <GoogleSignInButton
          disabled={isLoading}
          loading={googleLoading}
          onError={setError}
        />

        {/* Divisor Visual */}
        <div className="relative flex items-center py-1">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            O con tu correo
          </span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        {/* Campo: Correo Electrónico */}
        <div className="space-y-1.5">
          <label htmlFor="login-email" className="text-xs font-bold text-slate-700 uppercase tracking-wider block px-1">
            Correo electrónico
          </label>
          <input
            id="login-email"
            type="email"
            placeholder="ejemplo@empresa.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            className="w-full px-4 py-3 bg-[#f8fafc] border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm outline-none transition-all focus:border-[#800020] focus:ring-2 focus:ring-[#800020]/10 disabled:opacity-50"
          />
        </div>

        {/* Campo: Contraseña con Ojo Toggleable */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center px-1">
            <label htmlFor="login-password" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Contraseña
            </label>
            <a href="/reset-password" className="text-xs font-bold text-[#800020] hover:underline">
              ¿Olvidaste tu contraseña?
            </a>
          </div>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="w-full px-4 py-3 bg-[#f8fafc] border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm outline-none transition-all focus:border-[#800020] focus:ring-2 focus:ring-[#800020]/10 disabled:opacity-50 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Botón de Acceso (Rojo Vibrante) */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 px-6 bg-[#b91c1c] hover:bg-[#9b1c1c] text-white font-bold text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-[#b91c1c]/20 transition-all duration-300 flex items-center justify-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Ingresando...
            </span>
          ) : (
            <>
              <span>Ingresar</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"></path>
              </svg>
            </>
          )}
        </button>

        {/* Enlace de Alternancia a Registro */}
        <p className="text-center text-sm text-slate-500 pt-2">
          ¿No tienes cuenta?{' '}
          <a
            href="/register"
            className="text-[#800020] hover:text-[#b91c1c] hover:underline transition-colors font-bold"
          >
            Regístrate aquí
          </a>
        </p>
      </form>
    </div>
  );
}