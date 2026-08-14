'use client';

import React, { useState } from 'react';
import { resetPassword } from '../auth/actions';
import Footer from '@/components/ui/Footer';
import Image from 'next/image';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const result = await resetPassword(email);
    setIsLoading(false);

    if ('error' in result) {
      setError(result.error);
      return;
    }

    setSent(true);
  };

  if (sent) {
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
          <div className="bg-white p-8 md:p-10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 w-full relative text-center">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[3px] bg-gradient-to-r from-[#800020] to-[#b91c1c] rounded-b-full" />

            <div className="w-16 h-16 mx-auto rounded-full bg-[#f8d7da] border border-[#800020]/20 flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-[#800020]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>

            <h2 className="text-2xl font-extrabold text-[#0F172A] tracking-tight mb-3">
              Revisa tu correo
            </h2>
            <p className="text-sm text-[#64748B] leading-relaxed mb-2">
              Hemos enviado un enlace de recuperación a <strong className="text-[#0F172A]">{email}</strong>.
            </p>
            <p className="text-xs text-[#94a3b8]">
              Si no encuentras el correo, revisa tu bandeja de spam o correo no deseado.
            </p>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <a
                href="/login"
                className="text-sm font-bold text-[#800020] hover:text-[#b91c1c] hover:underline transition-colors"
              >
                Volver a Iniciar Sesión
              </a>
            </div>
          </div>
        </div>

        <Footer />
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
              <h2 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
                Recuperar Contraseña
              </h2>
              <p className="text-sm text-[#64748B] mt-2">
                Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
              </p>
            </div>

            {error && (
              <div className="bg-[#f8d7da] border border-[#f5c6cb] rounded-lg px-4 py-3 text-sm text-[#721c24] text-center font-medium">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="reset-email" className="text-xs font-bold text-slate-700 uppercase tracking-wider block px-1">
                Correo electrónico
              </label>
              <input
                id="reset-email"
                type="email"
                placeholder="ejemplo@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
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
                  Enviando...
                </span>
              ) : (
                <>
                  <span>Enviar Enlace</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </>
              )}
            </button>

            <p className="text-center text-sm text-slate-500 pt-2">
              <a
                href="/login"
                className="text-[#800020] hover:text-[#b91c1c] hover:underline transition-colors font-bold"
              >
                Volver a Iniciar Sesión
              </a>
            </p>
          </form>
        </div>
      </div>

      <Footer />
    </main>
  );
}