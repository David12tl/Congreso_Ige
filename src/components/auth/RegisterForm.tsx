'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signUp, signInWithGoogle } from '../../../app/auth/actions';

export default function RegisterForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const result = await signUp({
      email,
      password,
      fullName,
      landInterest: '',
    });

    setIsLoading(false);

    if ('error' in result) {
      setError(result.error);
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      router.push('/elige/usuario');
    }, 1000);
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const url = await signInWithGoogle();
      if (url) window.location.href = url;
    } catch {
      setError('Error al conectar con Google. Revisa tu conexión.');
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-slate-100 rounded-2xl p-8 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#f8d7da] border border-[#800020]/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-[#800020]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-extrabold text-[#0F172A]">¡Registro exitoso!</h2>
          <p className="text-sm text-[#64748B]">Redirigiendo de forma segura al Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Títulos adaptados */}
        <div className="text-center lg:text-left">
          <h2 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Crear tu cuenta
          </h2>
          <p className="text-sm text-[#64748B] mt-2">
            Asegura tu lugar en el congreso empresarial de este año.
          </p>
        </div>

        {/* Mensaje de Error estilizado */}
        {error && (
          <div className="bg-[#f8d7da] border border-[#f5c6cb] rounded-lg px-4 py-3 text-sm text-[#721c24] text-center font-medium">
            {error}
          </div>
        )}

        {/* Botón de Google Oauth con diseño de la referencia */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full py-3 px-4 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl flex items-center justify-center gap-3 transition-all duration-200 hover:border-slate-300 disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
          </svg>
          <span className="text-sm font-bold text-slate-700">
            Registrarse con Google
          </span>
        </button>

        {/* Divisor Visual */}
        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            O continúa con tu correo
          </span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        {/* Input: Nombre Completo */}
        <div className="space-y-1.5">
          <label htmlFor="reg-name" className="text-xs font-bold text-slate-700 uppercase tracking-wider block px-1">
            Nombre completo
          </label>
          <input
            id="reg-name"
            type="text"
            placeholder="Ingresa tu nombre y apellidos"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            disabled={isLoading}
            className="w-full px-4 py-3 bg-[#f8fafc] border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm outline-none transition-all focus:border-[#800020] focus:ring-2 focus:ring-[#800020]/10 disabled:opacity-50"
          />
        </div>

        {/* Input: Correo Electrónico */}
        <div className="space-y-1.5">
          <label htmlFor="reg-email" className="text-xs font-bold text-slate-700 uppercase tracking-wider block px-1">
            Correo electrónico
          </label>
          <input
            id="reg-email"
            type="email"
            placeholder="ejemplo@empresa.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            className="w-full px-4 py-3 bg-[#f8fafc] border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm outline-none transition-all focus:border-[#800020] focus:ring-2 focus:ring-[#800020]/10 disabled:opacity-50"
          />
        </div>

        {/* Input: Contraseña con Visibilidad Toggleable */}
        <div className="space-y-1.5">
          <label htmlFor="reg-password" className="text-xs font-bold text-slate-700 uppercase tracking-wider block px-1">
            Contraseña
          </label>
          <div className="relative">
            <input
              id="reg-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              disabled={isLoading}
              className="w-full px-4 py-3 bg-[#f8fafc] border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm outline-none transition-all focus:border-[#800020] focus:ring-2 focus:ring-[#800020]/10 disabled:opacity-50 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              {showPassword ? (
                /* Icono de Ojo Abierto */
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              ) : (
                /* Icono de Ojo Cerrado */
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Términos y Condiciones */}
        <div className="flex items-start gap-3 py-1">
          <input 
            id="terms" 
            type="checkbox" 
            required
            className="mt-1 w-4 h-4 text-[#b91c1c] focus:ring-[#b91c1c]/20 border-slate-300 rounded"
          />
          <label htmlFor="terms" className="text-xs text-slate-500">
            Acepto los <a href="#" className="text-[#800020] font-bold hover:underline">Términos de Servicio</a> y la <a href="#" className="text-[#800020] font-bold hover:underline">Política de Privacidad</a> de ELIGE 2026.
          </label>
        </div>

        {/* Botón de Registro Adaptado al Rojo Vivo Corporativo */}
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
              Creando cuenta...
            </span>
          ) : (
            <>
              <span>Crear Cuenta</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"></path>
              </svg>
            </>
          )}
        </button>

        {/* Enlace de login corporativo */}
        <p className="text-center text-sm text-slate-500 pt-2">
          ¿Ya tienes cuenta?{' '}
          <a
            href="/login"
            className="text-[#800020] hover:text-[#b91c1c] hover:underline transition-colors font-bold"
          >
            Inicia sesión aquí
          </a>
        </p>
      </form>
    </div>
  );
}