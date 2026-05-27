'use client';

import React from 'react';
import AuthForm from '../../src/components/auth/AuthForm';

export default function LoginPage() {
  return (
    <main className="min-h-screen w-full bg-[#050505] flex flex-col items-center justify-center relative overflow-hidden p-6 text-white">
      
      {/* 1. Fondo de Retícula Neón con Movimiento Continuo (Tailwind Native Animation) */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-25 pointer-events-none animate-[moveGrid_20s_linear_infinite]" 
      />
      
      {/* 2. Resplandores Ambientales (Neon Blobs) */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#03B3C3]/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#D856BF]/15 blur-[120px] rounded-full pointer-events-none" />

      {/* 3. Elementos Geométricos con Movimiento Flotante Nativo */}
      {/* Cuadrado Cian - Movimiento Diagonal + Rotación */}
      <div 
        className="absolute top-16 left-16 w-24 h-24 bg-[#050505] border-4 border-[#03B3C3] shadow-[4px_4px_0px_0px_#03B3C3] hidden md:block rounded-md z-0 animate-[floatDiagonalLogin_7s_ease-in-out_infinite]"
      >
        <div className="absolute inset-0 bg-[#03B3C3]/5" />
      </div>

      {/* Cápsula/Óvalo Púrpura - Flotación Vertical */}
      <div 
        className="absolute bottom-20 right-16 w-32 h-32 bg-[#050505] border-4 border-[#D856BF] shadow-[0_0_25px_rgba(216,86,191,0.35)] hidden md:block rounded-xl z-0 animate-[floatYLogin_9s_ease-in-out_infinite]"
      >
        <div className="absolute inset-0 bg-[#D856BF]/5 rounded-xl" />
      </div>

      {/* 4. Contenedor central con el formulario */}
      <div className="relative z-10 w-full max-w-sm transition-transform duration-300 hover:scale-[1.01] drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]">
        <AuthForm />
      </div>

      {/* 5. Botón de retorno estilo Dark-Neon */}
      <a 
        href="./" 
        className="absolute bottom-6 left-6 px-4 py-2 bg-black/80 backdrop-blur-md border-2 border-[#03B3C3] shadow-[3px_3px_0px_0px_#03B3C3] text-xs font-bold font-mono text-[#03B3C3] uppercase rounded hover:bg-[#03B3C3] hover:text-black transition-all"
      >
        ← Volver al Congreso
      </a>

      {/* Inyección directa de Keyframes inmunes a los filtros de Next.js */}
      <style>{`
        @keyframes moveGrid {
          0% { background-position: 0px 0px; }
          100% { background-position: 4rem 4rem; }
        }
        @keyframes floatDiagonalLogin {
          0%, 100% { transform: translate(0px, 0px) rotate(-6deg); }
          50% { transform: translate(-10px, 15px) rotate(-12deg); }
        }
        @keyframes floatYLogin {
          0%, 100% { transform: translateY(0px) rotate(12deg); }
          50% { transform: translateY(-25px) rotate(8deg); }
        }
      `}</style>
    </main>
  );
}