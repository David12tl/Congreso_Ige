'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithPassword, signInWithGoogle } from '@/app/auth/actions';

export default function AuthForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

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

    // Success: the server action already called redirect() según el rol,
    // but as a fallback we use router.push
    router.push('/dashboard/usuario');
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      const url = await signInWithGoogle();
      if (url) window.location.href = url;
    } catch (err) {
      setError('Error al conectar con Google. Revisa tu conexión.');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-8 shadow-2xl space-y-6 transition-all duration-300"
      >
        {/* Título */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Iniciar Sesión
          </h2>
          <p className="text-sm text-white/50 mt-1">
            Accede a tu cuenta del congreso
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-950/40 border border-red-500/40 rounded-lg px-4 py-3 text-sm text-red-400 text-center animate-pulse">
            {error}
          </div>
        )}

        {/* Campo Email */}
        <div className="space-y-1.5">
          <label
            htmlFor="login-email"
            className="text-xs font-semibold text-white/60 uppercase tracking-widest"
          >
            Correo electrónico
          </label>
          <input
            id="login-email"
            type="email"
            placeholder="tucorreo@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg text-white placeholder-white/30 text-sm outline-none transition-all duration-300 focus:border-[#03B3C3] focus:shadow-[0_0_12px_rgba(3,179,195,0.25)] focus:ring-1 focus:ring-[#03B3C3]/30 disabled:opacity-50"
          />
        </div>

        {/* Campo Contraseña */}
        <div className="space-y-1.5">
          <label
            htmlFor="login-password"
            className="text-xs font-semibold text-white/60 uppercase tracking-widest"
          >
            Contraseña
          </label>
          <input
            id="login-password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg text-white placeholder-white/30 text-sm outline-none transition-all duration-300 focus:border-[#03B3C3] focus:shadow-[0_0_12px_rgba(3,179,195,0.25)] focus:ring-1 focus:ring-[#03B3C3]/30 disabled:opacity-50"
          />
        </div>

        {/* Botón de envío */}
        <button
          type="submit"
          disabled={isLoading}
          className="relative w-full py-3 px-6 bg-black/40 border border-[#03B3C3]/50 rounded-lg text-[#03B3C3] font-bold text-sm uppercase tracking-wider transition-all duration-300 hover:bg-[#03B3C3]/10 hover:border-[#03B3C3] hover:shadow-[0_0_20px_rgba(3,179,195,0.4)] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:bg-black/40 disabled:hover:text-[#03B3C3]"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Ingresando...
            </span>
          ) : (
            'Ingresar'
          )}
        </button>

        {/* Divisor visual */}
        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-white/5"></div>
          <span className="flex-shrink mx-4 text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">
            O continúa con
          </span>
          <div className="flex-grow border-t border-white/5"></div>
        </div>

        {/* Botón de Google OAuth */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading || isLoading}
          className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 group hover:border-[#03B3C3]/50 hover:shadow-[0_0_15px_rgba(3,179,195,0.3)] disabled:opacity-50"
        >
          <svg className="w-5 h-5 text-white/70 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span className="text-xs font-bold text-white/70 uppercase tracking-widest group-hover:text-white transition-colors">
            {googleLoading ? 'Conectando...' : 'Google'}
          </span>
        </button>

        {/* Enlace a registro */}
        <p className="text-center text-sm text-white/40">
          ¿No tienes cuenta?{' '}
          <a
            href="/register"
            className="text-[#D856BF] hover:text-[#D856BF]/80 hover:underline transition-colors font-medium"
          >
            Regístrate aquí
          </a>
        </p>
      </form>
    </div>
  );
}