'use client';

import React, { useState, useEffect } from 'react';
import Confetti from 'react-confetti';

const calculateTimeLeft = () => {
  const now = new Date();
  const year = now.getFullYear();
  
  // La fecha meta es el 18 de Noviembre
  const targetDate = new Date(year, 10, 18); // Mes 10 es Noviembre (0-indexed)

  // Si la fecha ya pasó este año, apuntar al próximo año
  if (now > targetDate) {
    targetDate.setFullYear(year + 1);
  }

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

const TimeBlock = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center justify-center bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl w-28 h-28 md:w-36 md:h-36 p-2 shadow-lg backdrop-blur-sm transition-all">
    <span className="text-5xl md:text-7xl font-black text-gray-800 dark:text-white tracking-tighter">
      {String(value).padStart(2, '0')}
    </span>
    <span className="text-xs md:text-sm font-mono text-gray-500 dark:text-white/60 uppercase tracking-widest mt-2">
      {label}
    </span>
  </div>
);

export default function TabTime() {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      if (newTimeLeft.isFinished && timerRef.current) {
        clearInterval(timerRef.current);
      }
    }, 1000);

    // Efecto para el confeti
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.document.body.scrollHeight, // Usar el alto total de la página
      });
    }
    
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  if (timeLeft.isFinished) {
    return (
      <>
        <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={500} />
        <div className="text-center p-4">
          <h3 className="text-4xl md:text-5xl font-black text-gray-800 dark:text-white tracking-tight animate-pulse">¡El evento ha comenzado!</h3>
        </div>
      </>
    );
  }
  return (
    <div className="w-full flex justify-center items-center p-4">
      <div className="flex items-center gap-4 md:gap-6">
        <TimeBlock value={timeLeft.dias} label="Días" />
        <span className="text-5xl md:text-6xl font-light text-gray-400 dark:text-white/30">:</span>
        <TimeBlock value={timeLeft.horas} label="Horas" />
        <span className="text-5xl md:text-6xl font-light text-gray-400 dark:text-white/30">:</span>
        <TimeBlock value={timeLeft.minutos} label="Minutos" />
        <span className="text-5xl md:text-6xl font-light text-gray-400 dark:text-white/30">:</span>
        <TimeBlock value={timeLeft.segundos} label="Segundos" />
      </div>
    </div>
  );
}