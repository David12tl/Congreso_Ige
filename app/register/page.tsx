'use client';

import React from 'react';
import RegisterForm from '../../src/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <main className="min-h-screen w-full bg-[#050505] flex flex-col items-center justify-center relative overflow-hidden p-6 text-white">
      
      {/* 1. Fondo de Retícula Neón con Movimiento Continuo (Infinite Grid Travel) */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-25 pointer-events-none" 
        style={{
          animation: 'moveGrid 20s linear infinite'
        }}
      />
      
      {/* 2. Resplandores Ambientales (Neon Blobs) */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#10B981]/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#D856BF]/10 blur-[120px] rounded-full pointer-events-none" />

      {/* 3. Elementos Geométricos con Movimiento Flotante Independiente */}
      {/* Círculo Neón Verde - Movimiento Arriba/Abajo + Pulso */}
      <div 
        className="absolute top-16 right-16 w-20 h-20 bg-[#050505] border-4 border-[#10B981] shadow-[0_0_20px_rgba(16,185,129,0.4)] hidden md:block rounded-full z-0"
        style={{
          animation: 'floatY 6s ease-in-out infinite, pulseGlow 2s infinite alternate'
        }}
      >
        <div className="absolute inset-0 rounded-full bg-[#10B981]/10" />
      </div>

      {/* Cuadrado Neón Naranja - Movimiento Diagonal + Rotación Suave */}
      <div 
        className="absolute bottom-20 left-16 w-24 h-24 bg-[#050505] border-4 border-[#F59E0B] shadow-[4px_4px_0px_0px_#F59E0B] hidden md:block z-0"
        style={{
          animation: 'floatDiagonal 8s ease-in-out infinite'
        }}
      >
        <div className="absolute inset-0 bg-[#F59E0B]/5" />
      </div>

      {/* 4. Caja contenedora del formulario */}
      <div className="relative z-10 w-full max-w-sm transition-transform duration-300 hover:scale-[1.01] drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]">
        <RegisterForm />
      </div>

      {/* 5. Botón de retorno estilo Dark-Neon */}
      <a 
        href="./" 
        className="absolute bottom-6 left-6 px-4 py-2 bg-black/80 backdrop-blur-md border-2 border-[#03B3C3] shadow-[3px_3px_0px_0px_#03B3C3] text-xs font-bold font-mono text-[#03B3C3] uppercase rounded hover:bg-[#03B3C3] hover:text-black transition-all"
      >
        ← Volver al Congreso
      </a>

      {/* Inyección de Keyframes de Animación */}
      <style jsx global>{`
        /* Movimiento infinito de la cuadrícula de fondo */
        @keyframes moveGrid {
          0% {
            background-position: 0px 0px;
          }
          100% {
            background-position: 4rem 4rem; /* Debe coincidir con el tamaño bg-size */
          }
        }

        /* Flotación vertical (Círculo) */
        @keyframes floatY {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        /* Pulso extra de brillo para el neón verde */
        @keyframes pulseGlow {
          0% {
            box-shadow: 0 0 15px rgba(16,185,129,0.3);
          }
          100% {
            box-shadow: 0 0 30px rgba(16,185,129,0.6);
          }
        }

        /* Flotación diagonal balanceada con rotación (Cuadrado) */
        @keyframes floatDiagonal {
          0%, 100% {
            transform: translate(0px, 0px) rotate(12deg);
          }
          50% {
            transform: translate(15px, -15px) rotate(18deg);
          }
        }
      `}</style>
    </main>
  );
}