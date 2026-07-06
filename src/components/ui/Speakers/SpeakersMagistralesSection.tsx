'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface Speaker {
  id: number;
  nombre: string;
  puesto: string;
  compania: string;
  conferencia: string;
  colorTheme: string;
  glowClass: string;
  avatarUrl?: string;
}

const brandColors = {
  navy: '#0B2545',      
  turquoise: '#00B4D8', 
  orange: '#D95D26',    
  emerald: '#06c215',   
};

/* ─── SUBCOMPONENTE: TARJETA ESTILO MATERIAL DESIGN 3 (M3) ─── */
function SpeakerCard({ speaker }: { speaker: Speaker }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      // Tarjeta blanca/sólida que contrasta perfectamente sobre cualquier color de fondo externo
      className="group relative bg-white dark:bg-slate-900 border rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between overflow-hidden"
      style={{
        borderColor: isHovered ? `${speaker.colorTheme}66` : 'var(--border-componentes)',
        boxShadow: isHovered ? '0px 4px 20px 0px rgba(0, 0, 0, 0.06), 0px 1px 3px 1px rgba(0, 0, 0, 0.04)' : 'none',
        transform: isHovered ? 'translateY(-4px)' : 'none'
      }}
    >
      {/* Capa de estado interactiva (M3 State Layer) */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300 pointer-events-none z-0"
        style={{ backgroundColor: speaker.colorTheme }}
      />
      
      <div className="relative z-10">
        {/* Badge Tonal M3 */}
        <span 
          className="inline-block text-[11px] font-bold tracking-wider uppercase px-3 py-1 rounded-full mb-5 transition-all duration-300"
          style={{ 
            color: speaker.colorTheme, 
            backgroundColor: `${speaker.colorTheme}12` 
          }}
        >
          Conferencista
        </span>
        {/* Contenedor del Avatar */}
        <div className="w-full h-72 bg-slate-50 dark:bg-slate-800 rounded-2xl flex flex-col items-center justify-center mb-5 relative overflow-hidden">
          {speaker.avatarUrl ? (
            <Image
              src={speaker.avatarUrl}
              alt={speaker.nombre}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-102"
            />
          ) : (
            <span className="text-4xl font-bold tracking-wider opacity-20" style={{ color: speaker.colorTheme }}>
              {speaker.nombre.split(' ').filter(Boolean).map(n => n[0]).join('').substring(0, 3).toUpperCase()}
            </span>
          )}
          <div 
            className="absolute bottom-0 left-0 w-full h-1.5 transition-all duration-300"
            style={{ backgroundColor: speaker.colorTheme }}
          />
        </div>
        {/* Tipografía M3 */}
        <h4 className="text-2xl font-bold tracking-tight mb-1 text-slate-900 dark:text-white">
          {speaker.nombre}
        </h4>
        <p className="text-sm mb-4 text-slate-500 dark:text-slate-400 font-medium">
          {speaker.puesto} — <span className="font-semibold" style={{ color: speaker.colorTheme }}>{speaker.compania}</span>
        </p>
        <p 
          className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 border-l-4 pl-3 py-0.5 font-medium italic"
          style={{ borderLeftColor: speaker.colorTheme }}
        >
          &quot;{speaker.conferencia}&quot;
        </p>
      </div>
    </div>
  );
}

export default function SpeakersMagistrales() {
  const speakersDestacados: Speaker[] = [
    {
      id: 1,
      nombre: "Lic. Carlos Vidal Neri",
      puesto: "Director de TVEO Canal",
      compania: "TVEO Canal",
      conferencia: "EL EMPRENDIMIENTO COMO DETONANTE DEL DESARROLLO DE LAS CIUDADES",
      colorTheme: brandColors.orange, 
      glowClass: "from-[#D95D26]/10 to-transparent",
      avatarUrl: "/expocitor_1.png",
    },
    {
      id: 2,
      nombre: "Jahasiel E. Sevilla Muñoz",
      puesto: "Gerente de Innovation & Digital Transformation",
      compania: "Google Cloud Consulting",
      conferencia: "Web3 y la Reconfiguración de la Seguridad Digital Colectiva",
      colorTheme: brandColors.turquoise, 
      glowClass: "from-[#00B4D8]/10 to-transparent",
      avatarUrl: "/expocitor_2.png",
    },
    {
      id: 3,
      nombre: "Marco Antonio Arroyo Carranza",
      puesto: "Maestría en Psicoterapia Ericksoniana",
      compania: "Centro Ericksoniano de México",
      conferencia: "Computación Cuántica: Desafiando los Límites del Silicio",
      colorTheme: brandColors.emerald, 
      glowClass: "from-[#06c215]/10 to-transparent",
      avatarUrl: "/expocitor_3.png",
    }
  ];

  return (
    // ✨ Cambiado a bg-transparent para que herede de forma natural el fondo de la página
    <section className="w-full bg-transparent py-24 px-4 md:px-8 relative overflow-hidden">
      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* ENCABEZADO DE LA SECCIÓN */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-sm font-bold uppercase tracking-widest bg-gradient-to-r from-congreso-orange to-congreso-turquoise bg-clip-text text-transparent mb-4">
            Main Stage Lineup
          </h2>
          <h3 className="text-4xl md:text-5xl font-black tracking-tighter text-congreso-navy dark:text-congreso-navy mb-4">
            Speakers Magistrales
          </h3>
          <h4 className="text-lg md:text-xl text-slate-800 mb-6 italic">
            La revolución del talento y la innovación.
          </h4>
          
          {/* Párrafo descriptivo con contraste balanceado (Slate-700 / Slate-800) */}
          <p className="text-base text-slate-700 leading-relaxed max-w-2xl mx-auto font-medium">
            Líderes globales, visionarios e innovadores comparten su experiencia, visión e historia. 
            Cada charla en el Main Stage no solo informa: moviliza, impulsa y despierta nuevas posibilidades.
          </p>
          {/* Divisor decorativo */}
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-congreso-turquoise/50 to-transparent mx-auto mt-8" />
        </div>
        {/* REJILLA DE TARJETAS MAGISTRALES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {speakersDestacados.map((speaker) => (
            <SpeakerCard key={speaker.id} speaker={speaker} />
          ))}
        </div>
      </div>
    </section>
  );
}