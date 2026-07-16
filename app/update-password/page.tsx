'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { updatePassword } from '../auth/actions';
import { createClient } from '@/lib/supabase/client';
import Footer from '@/components/ui/Footer';
import Image from 'next/image';

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login?error=auth-failed');
        return;
      }
      setCheckingSession(false);
    };
    checkSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setIsLoading(true);

    const result = await updatePassword(password);
    setIsLoading(false);

    if ('error' in result) {
      setError(result.error);
      return;
    }

    // Redirigir al dashboard
    router.push(result.redirectTo || '/dashboard/perfil');
  };

  if (checkingSession) {
    return (
      <main className="min-h-screen w-full bg-[#FCFCFD] flex items-center justify-center text-[#1E293B]">
        <div className="flex items-center gap-3">
          <svg className="animate-spin h-5 w-5 text-[#800020]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm font-medium">Verificando sesión...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full bg-[#FCFCFD] flex flex-col justify-between relative overflow-hidden text-[#1E293B]">
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-50 pointer-events-none" />
      <div className="absolute top-[-10%] right-[-10%] w-[45%] h-[45%] bg-[#800020]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[45%] h-[45%] bg-[#b91c1c]/3 blur-[120px] rounded-full pointer-events-none" />

      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="Logo" width={100} height={50} />
        </div>
        <a href="./" className="text-sm font-semibold text-[#4a5568] hover:text-[#800020] transition-colors">
          Volver al Inicio
        </a>
      </header>

      <div className="relative z-10 w-full max-w-md mx-auto px-6 my-auto py-12 flex justify-center">
        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 w-full relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[3px] bg-gradient-to-r from-[#800020] to-[#b91c1c] rounded-b-full" />

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#f8d7da] border border-[#800020]/20 flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-[#800020]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
                Actualizar Contraseña
              </h2>
              <p className="text-sm text-[#64748B] mt-2">
                Ingresa tu nueva contraseña para restablecer el acceso a tu cuenta.
              </p>
            </div>

            {error && (
              <div className="bg-[#f8d7da] border border-[#f5c6cb] rounded-lg px-4 py-3 text-sm text-[#721c24] text-center font-medium">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="new-password" className="text-xs font-bold text-slate-700 uppercase tracking-wider block px-1">
                Nueva contraseña
              </label>
              <div className="relative">
                <input
                  id="new-password"
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

            <div className="space-y-1.5">
              <label htmlFor="confirm-password" className="text-xs font-bold text-slate-700 uppercase tracking-wider block px-1">
                Confirmar contraseña
              </label>
              <input
                id="confirm-password"
                type="password"
                placeholder="Repite tu nueva contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                disabled={isLoading}
                className="w-full px-4 py-3 bg-[#f8fafc] border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm outline-none transition-all focus:border-[#800020] focus:ring-2 focus:ring-[#800020]/10 disabled:opacity-50"
              />
            </div>

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
                  Actualizando...
                </span>
              ) : (
                <>
                  <span>Actualizar Contraseña</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </main>
  );
}