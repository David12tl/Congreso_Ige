'use client';

import React, { useState, useEffect, startTransition } from 'react';
import Confetti from 'react-confetti';

const calculateTimeLeft = () => {
  const now = new Date();
  
  // La fecha meta es el 18 de Noviembre de 2026
  const targetDate = new Date(2026, 10, 18); // Mes 10 es Noviembre (0-indexed)

  const difference = +targetDate - +now;

  let timeLeft = {
    dias: 0,
    horas: 0,
    minutos: 0,
    segundos: 0,
  };
  let isFinished = true;

  if (difference > 0) {
    timeLeft = {
      dias: Math.floor(difference / (1000 * 60 * 60 * 24)),
      horas: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutos: Math.floor((difference / 1000 / 60) % 60),
      segundos: Math.floor((difference / 1000) % 60),
    };
    isFinished = false;
  }

  return { ...timeLeft, isFinished };
};

// Subcomponente de bloque de tiempo adaptado a la Paleta Institucional (M3 Glass Container)
const TimeBlock = ({ value, label, accentColor }: { value: number; label: string; accentColor: string }) => (
  <div 
    style={{ 
      background: 'rgba(255, 255, 255, 0.7)', 
      backdropFilter: 'blur(12px)',
      borderColor: `${accentColor}25`
    }}
    className="flex flex-col items-center justify-center border rounded-2xl w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 p-2 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group"
  >
    <span 
      style={{ color: '#1E2A39' }} 
      className="text-4xl sm:text-5xl md:text-5xl font-extrabold tracking-tighter transition-transform duration-300 group-hover:scale-105"
    >
      {String(value).padStart(2, '0')}
    </span>
    <span 
      style={{ color: accentColor }} 
      className="text-[10px] md:text-[11px] font-bold tracking-widest uppercase mt-1.5"
    >
      {label}
    </span>
  </div>
);

export default function TabTime() {
  const [timeLeft, setTimeLeft] = useState({ dias: 0, horas: 0, minutos: 0, segundos: 0, isFinished: false });
  const [isMounted, setIsMounted] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    startTransition(() => {
      setIsMounted(true);
    });

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.document.body.scrollHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      clearInterval(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const brandColors = {
    primary: '#1E2A39',   // Azul Marino (Estructura base)
    secondary: '#8B1E23', // Rojo ELIGE (Acento primario)
    tertiary: '#8B1E23',  // Rojo ELIGE (Acción)
    emerald: '#7D7D7D',   // Gris (Texto secundario)
  };

  if (!isMounted) {
    return null;
  }

  if (timeLeft.isFinished) {
    return (
      <>
        <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={500} />
        <div className="text-center p-6 bg-[#1E2A39]/5 rounded-2xl border border-[#1E2A39]/10 max-w-xl mx-auto backdrop-blur-xs">
          <h3 
            style={{ color: brandColors.primary }} 
            className="text-2xl md:text-3xl font-extrabold tracking-tight animate-pulse"
          >
            ¡El encuentro ha comenzado!
          </h3>
          <p style={{ color: brandColors.secondary }} className="text-xs uppercase font-bold tracking-widest mt-2">
            Bienvenidos al 1er Congreso Internacional
          </p>
        </div>
      </>
    );
  }

  return (
    <div className="w-full flex flex-col justify-center items-center p-4" suppressHydrationWarning>
        <span className="text-[11px] font-extrabold tracking-widest uppercase text-[#7D7D7D] mb-4 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8B1E23] animate-ping"></span>
          Cuenta regresiva para el magno evento
        </span>

        <div className="flex items-center gap-2 sm:gap-4 md:gap-5">
          <TimeBlock value={timeLeft.dias} label="Días" accentColor={brandColors.tertiary} />
          <span className="text-3xl md:text-4xl font-light text-[#1E2A39]/30 select-none animate-pulse">:</span>
          
          <TimeBlock value={timeLeft.horas} label="Horas" accentColor={brandColors.secondary} />
          <span className="text-3xl md:text-4xl font-light text-[#1E2A39]/30 select-none animate-pulse">:</span>
          
          <TimeBlock value={timeLeft.minutos} label="Minutos" accentColor={brandColors.emerald} />
          <span className="text-3xl md:text-4xl font-light text-[#1E2A39]/30 select-none animate-pulse">:</span>
          
          <TimeBlock value={timeLeft.segundos} label="Segundos" accentColor={brandColors.primary} />
        </div>
    </div>
  );
}