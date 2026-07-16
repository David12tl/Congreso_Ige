'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AuthForm from '../../src/components/auth/AuthForm';
import Footer from '@/components/ui/Footer';
import Image from 'next/image';

/**
 * Error message mapping for OAuth/callback errors
 * OWASP: Only predefined, safe messages are displayed to prevent injection
 */
const ERROR_MESSAGES: Record<string, string> = {
  'invalid-code': 'El código de autenticación expiró o es inválido. Por favor, intenta iniciar sesión nuevamente.',
  'auth-failed': 'La autenticación falló. Por favor, verifica tus credenciales e intenta de nuevo.',
  'session-expired': 'Tu sesión expiró. Por favor, inicia sesión nuevamente.',
  'config-error': 'Error de configuración. Por favor, contacta a soporte.',
};

/**
 * Validates that an error parameter is in the allowed whitelist
 * OWASP: Prevents open redirect by only accepting predefined errors
 */
function isValidErrorParam(error: string | null): boolean {
  if (!error) return true; // No error param is fine
  return error.toLowerCase().trim() in ERROR_MESSAGES;
}

/**
 * Login page component with OAuth error handling
 */
function LoginPageContent() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');

  // OWASP: Validate error param against whitelist
  const error = isValidErrorParam(errorParam) && errorParam 
    ? ERROR_MESSAGES[errorParam.toLowerCase().trim()] 
    : null;

  return (
    <main className="min-h-screen w-full bg-[#FCFCFD] flex flex-col justify-between relative overflow-hidden text-[#1E293B]">
      
      {/* Sutil patrón de fondo claro para dar textura (Inspirado en el Register) */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-50 pointer-events-none" />
      
      {/* Suaves destellos de color corporativo en el fondo */}
      <div className="absolute top-[-10%] right-[-10%] w-[45%] h-[45%] bg-[#800020]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[45%] h-[45%] bg-[#b91c1c]/3 blur-[120px] rounded-full pointer-events-none" />

      {/* Header Minimalista con Logo */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Logo de la Empresa"
            width={100}
            height={50}
          />
        </div>
        <a 
          href="./" 
          className="text-sm font-semibold text-[#4a5568] hover:text-[#800020] transition-colors"
        >
          Volver al Inicio
        </a>
      </header>

      {/* Contenedor central de la Tarjeta de Login */}
      <div className="relative z-10 w-full max-w-md mx-auto px-6 my-auto py-12 flex justify-center">
        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 w-full relative">
          
          {/* Decoración superior idéntica a la del Register */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[3px] bg-gradient-to-r from-[#800020] to-[#b91c1c] rounded-b-full"></div>
          
          {/* Error message banner - only shown for valid whitelisted errors */}
          {error && (
            <div className="mb-6 bg-[#fef3c7] border border-[#f59e0b] rounded-lg px-4 py-3 text-sm text-[#92400e] text-center font-medium">
              {error}
            </div>
          )}
          
          {/* Formulario de Login */}
          <AuthForm initialError={error} />
          
        </div>
      </div>

      {/* Footer Minimalista */}
      <Footer />

    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen w-full bg-[#FCFCFD] flex items-center justify-center text-[#1E293B]">
        Cargando...
      </main>
    }>
      <LoginPageContent />
    </Suspense>
  );
}