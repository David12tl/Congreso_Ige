'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface Speaker {
  id: number;
  nombre: string;
  puesto: string;
  compania: string;
  conferencia: string;
  colorTheme: string; // Color personalizado para bordes y brillos
  glowClass: string;  // Color para el blur de fondo reactivo
  avatarUrl?: string;
}

/* ─── Subcomponente de tarjeta individual con hover state ─── */
function SpeakerCard({ speaker }: { speaker: Speaker }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      key={speaker.id}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-white dark:bg-slate-900 border rounded-xl p-6 transition-all duration-500 hover:shadow-2xl flex flex-col justify-between overflow-hidden opacity-100"
      style={{
        borderColor: isHovered ? `${speaker.colorTheme}88` : 'var(--border-componentes)',
        '--hover-border': speaker.colorTheme,
      } as React.CSSProperties}
    >
      {/* Resplandor interno dinámico al hacer hover */}
      <div className={`absolute -inset-px bg-gradient-to-br ${speaker.glowClass} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl z-0`} />
      
      <div className="relative z-10">
        {/* Badge Rectangular de Especialidad */}
        <span 
          className="inline-block text-[10px] font-bold tracking-wider uppercase backdrop-blur-sm border px-3 py-1 rounded-sm mb-6 transition-colors duration-300"
          style={{ borderColor: `${speaker.colorTheme}44`, color: speaker.colorTheme, backgroundColor: 'var(--bg-tarjetas)' }}
        >
        
        </span>

        {/* Contenedor del Avatar Rectangular de Cristal */}
        <div 
          className="w-full h-64 bg-black/40 backdrop-blur-md border rounded-lg flex flex-col items-center justify-center mb-6 relative transition-all duration-500 overflow-hidden group-hover:scale-[1.02]"
          style={{ borderColor: 'rgba(255,255,255,0.08)' }}
        >
          {/* Patrón de líneas estéticas de fondo */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100%_8px] pointer-events-none" />
          
          {speaker.avatarUrl ? (
            <Image
              src={speaker.avatarUrl}
              alt={speaker.nombre}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            /* Iniciales gigantes como fallback si no hay imagen */
            <span className="text-4xl font-black text-gray-500/50 group-hover:text-white transition-colors duration-500 tracking-widest">
              {speaker.nombre.split(' ').filter(Boolean).map(n => n[0]).join('').substring(0, 3).toUpperCase()}
            </span>
          )}
          
          {/* Detalles decorativos de interfaz */}
          <div className="absolute bottom-2 left-3 text-[8px] font-mono text-gray-600 group-hover:text-gray-400 transition-colors">
            SYS_ID // 00{speaker.id}
          </div>
          <div 
            className="absolute top-0 left-0 w-full h-1 transition-all duration-500"
            style={{ backgroundColor: speaker.colorTheme }}
          />
        </div>

        {/* Información del Speaker */}
        <h4 className="text-2xl font-bold mb-1 transition-colors duration-300" style={{ color: 'var(--text-principal)' }}>
          {speaker.nombre}
        </h4>
        <p className="text-xs mb-5 font-medium" style={{ color: 'var(--text-principal)', opacity: 0.65 }}>
          {speaker.puesto} at <span style={{ color: 'var(--text-principal)' }}>{speaker.compania}</span>
        </p>

        {/* Conferencia con barra lateral de color */}
        <p 
          className="text-sm leading-relaxed font-medium border-l-2 pl-3 py-1 transition-all duration-500"
          style={{ color: 'var(--text-principal)', opacity: 0.85, borderLeftColor: `${speaker.colorTheme}77` }}
        >
          {speaker.conferencia}
        </p>
      </div>

      {/* Pie de la tarjeta */}
      <div className="mt-8 pt-4 flex justify-between items-center relative z-10" style={{ borderTop: '1px solid var(--border-componentes)' }}>
        <span className="text-xs font-mono" style={{ color: 'var(--text-principal)', opacity: 0.5 }}>
          [ KEYNOTE_0{speaker.id} ]
        </span>
        <button 
          className="text-xs font-bold tracking-wider uppercase flex items-center gap-1 transition-all duration-300 group-hover:translate-x-1"
          style={{ color: speaker.colorTheme }}
        >
          Perfil →
        </button>
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
      colorTheme: "#f13b3b",
      glowClass: "from-[#D856BF]/20 to-transparent",
      avatarUrl: "/expocitor_1.png",
    },
    {
      id: 2,
      nombre: "Jahasiel E. Sevilla Muños.",
      puesto: "Gerente de Innovation & Digital Transformation ",
      compania: "Google Cloud consulting",
      conferencia: "Web3 y la Reconfiguración de la Seguridad Digital Colectiva",
      colorTheme: "#F59E0B", // Naranja / Ámbar eléctrico
      glowClass: "from-[#F59E0B]/15 to-transparent",
      avatarUrl: "/expocitor_2.png",
    },
    {
      id: 3,
      nombre: "MARCO ANTONIO ARROYO CARRANZA UBICACIÓN.",
      puesto: "Maestría en Psicoterapia Ericksoniana",
      compania: "Centro Ericksoniano de México",
      conferencia: "Computación Cuántica: Desafiando los Límites del Silicio",
      colorTheme: "#10B981", // Verde Esmeralda / Cian Cuántico
      glowClass: "from-[#10B981]/20 to-transparent",
      avatarUrl: "/expocitor_3.png",
    }
  ];

  return (
    <section className="w-full bg-transparent py-16 px-4 md:px-8 relative overflow-hidden" style={{ color: 'var(--text-principal)' }}>
      
      {/* Luces ambientales multicolor difuminadas en el fondo general */}
      <div className="absolute top-10 left-10 w-[350px] h-[350px] bg-[#D856BF]/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-[#10B981]/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* ENCABEZADO DE LA SECCIÓN */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-[0.3em] bg-gradient-to-r from-[#D856BF] via-[#F59E0B] to-[#10B981] bg-clip-text text-transparent mb-3">
            Main Stage Lineup
          </h2>
          <h3 className="text-4xl md:text-5xl font-black tracking-tight mb-4" style={{ color: 'var(--text-principal)' }}>
            Speakers Magistrales
          </h3>
          <h4 className="text-lg md:text-xl font-semibold mb-6 italic" style={{ color: 'var(--text-principal)', opacity: 0.65 }}>
            La revolución del talento
          </h4>
          <p className="text-sm md:text-base leading-relaxed border-t pt-6" style={{ color: 'var(--text-principal)', opacity: 0.65, borderColor: 'var(--border-componentes)' }}>
            Líderes globales, visionarios, innovadores, agentes de cambio y talentos emergentes 
            comparten su experiencia, su visión y su historia. Cada charla en el Main Stage no 
            solo informa: moviliza, impulsa, cuestiona y despierta nuevas posibilidades.
          </p>
        </div>

        {/* REJILLA DE TARJETAS RECTANGULARES CON BLUR PREMIUM */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {speakersDestacados.map((speaker) => (
            <SpeakerCard key={speaker.id} speaker={speaker} />
          ))}
        </div>

        {/* ─── SECCIÓN MESA REDONDA ─── */}
        <div className="mt-24 mb-8">
          {/* Encabezado */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] bg-gradient-to-r from-[#D856BF] via-[#F59E0B] to-[#10B981] bg-clip-text text-transparent mb-3">
              Round Table
            </h2>
            <h3 className="text-4xl md:text-5xl font-black tracking-tight mb-4" style={{ color: 'var(--text-principal)' }}>
              Mesa Redonda
            </h3>
            <p className="text-sm md:text-base leading-relaxed pt-6" style={{ color: 'var(--text-principal)', opacity: 0.65, borderTop: '1px solid var(--border-componentes)' }}>
              Un espacio de diálogo donde expertos de diferentes disciplinas debaten, comparten 
              perspectivas y construyen soluciones colaborativas sobre los temas más relevantes 
              de la industria.
            </p>
          </div>

          {/* Grid de participantes de mesa redonda */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Participante 1 */}
            <div className="group relative backdrop-blur-xl border rounded-xl p-6 transition-all duration-500 hover:shadow-2xl flex flex-col md:flex-row gap-6 overflow-hidden" style={{ backgroundColor: 'var(--bg-tarjetas)', borderColor: 'var(--border-componentes)' }}>
              <div className="absolute -inset-px bg-gradient-to-br from-[#03B3C3]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl z-0" />
              
              <div className="relative z-10 w-full md:w-48 h-48 flex-shrink-0">
                <div className="w-full h-full backdrop-blur-md border rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--bg-tarjetas)', borderColor: 'var(--border-componentes)' }}>
                  <Image
                    src="/mesa_redonda.png"
                    alt="Participante Mesa Redonda"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
              </div>

              <div className="relative z-10 flex flex-col justify-center flex-1">
                <span className="text-[10px] font-bold tracking-wider uppercase text-[#03B3C3] mb-2">
                  MODERADOR
                </span>
                <h4 className="text-xl font-bold mb-1" style={{ color: 'var(--text-principal)' }}>
                  Nombre del Moderador
                </h4>
                <p className="text-xs mb-3" style={{ color: 'var(--text-principal)', opacity: 0.65 }}>
                  Puesto · <span style={{ color: 'var(--text-principal)' }}>Compañía</span>
                </p>
                <p className="text-sm leading-relaxed border-l-2 border-[#03B3C3] pl-3" style={{ color: 'var(--text-principal)', opacity: 0.85 }}>
                  Tema de discusión principal para la mesa redonda.
                </p>
              </div>
            </div>

            {/* Participante 2 */}
            <div className="group relative backdrop-blur-xl border rounded-xl p-6 transition-all duration-500 hover:shadow-2xl flex flex-col md:flex-row gap-6 overflow-hidden" style={{ backgroundColor: 'var(--bg-tarjetas)', borderColor: 'var(--border-componentes)' }}>
              <div className="absolute -inset-px bg-gradient-to-br from-[#F59E0B]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl z-0" />
              
              <div className="relative z-10 w-full md:w-48 h-48 flex-shrink-0">
                <div className="w-full h-full backdrop-blur-md border rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--bg-tarjetas)', borderColor: 'var(--border-componentes)' }}>
                  <Image
                    src="/mesa_redonda_1.png"
                    alt="Participante Mesa Redonda"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
              </div>

              <div className="relative z-10 flex flex-col justify-center flex-1">
                <span className="text-[10px] font-bold tracking-wider uppercase text-[#F59E0B] mb-2">
                  PANELISTA
                </span>
                <h4 className="text-xl font-bold mb-1" style={{ color: 'var(--text-principal)' }}>
                  Nombre del Panelista
                </h4>
                <p className="text-xs mb-3" style={{ color: 'var(--text-principal)', opacity: 0.65 }}>
                  Puesto · <span style={{ color: 'var(--text-principal)' }}>Compañía</span>
                </p>
                <p className="text-sm leading-relaxed border-l-2 border-[#F59E0B] pl-3" style={{ color: 'var(--text-principal)', opacity: 0.85 }}>
                  Tema de discusión principal para la mesa redonda.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}