'use client';

import React from 'react';

interface Speaker {
  id: number;
  nombre: string;
  puesto: string;
  compania: string;
  conferencia: string;
  tag: string;
  colorTheme: string; // Color personalizado para bordes y brillos
  glowClass: string;  // Color para el blur de fondo reactivo
  avatarUrl?: string;
}

export default function SpeakersMagistrales() {
  const speakersDestacados: Speaker[] = [
    {
      id: 1,
      nombre: "Dra. Elena Rostova",
      puesto: "Director of AI & Robotics",
      compania: "NeuralCore Global",
      conferencia: "Sistemas Autónomos y el Futuro de la Consciencia Artificial",
      tag: "Inteligencia Artificial",
      colorTheme: "#D856BF", // Púrpura Neón
      glowClass: "from-[#D856BF]/20 to-transparent",
    },
    {
      id: 2,
      nombre: "Marcus Vance",
      puesto: "Core Blockchain Architect",
      compania: "Decentral Labs",
      conferencia: "Web3 y la Reconfiguración de la Seguridad Digital Colectiva",
      tag: "Cybersecurity",
      colorTheme: "#F59E0B", // Naranja / Ámbar eléctrico
      glowClass: "from-[#F59E0B]/15 to-transparent",
    },
    {
      id: 3,
      nombre: "Ing. Carlos Mendoza",
      puesto: "Quantum Computing Lead",
      compania: "NextGen Computing",
      conferencia: "Computación Cuántica: Desafiando los Límites del Silicio",
      tag: "Quantum Tech",
      colorTheme: "#10B981", // Verde Esmeralda / Cian Cuántico
      glowClass: "from-[#10B981]/20 to-transparent",
    }
  ];

  return (
    /* Cambiado bg-[#0d0e12] a bg-transparent para que el Hyperspeed de fondo se filtre en el blur */
    <section className="w-full bg-transparent text-white py-16 px-4 md:px-8 relative overflow-hidden">
      
      {/* Luces ambientales multicolor difuminadas en el fondo general */}
      <div className="absolute top-10 left-10 w-[350px] h-[350px] bg-[#D856BF]/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-[#10B981]/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* ENCABEZADO DE LA SECCIÓN */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-[0.3em] bg-gradient-to-r from-[#D856BF] via-[#F59E0B] to-[#10B981] bg-clip-text text-transparent mb-3">
            Main Stage Lineup
          </h2>
          <h3 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-white">
            Speakers Magistrales
          </h3>
          <h4 className="text-lg md:text-xl font-semibold text-gray-400 mb-6 italic">
            La revolución del talento
          </h4>
          <p className="text-sm md:text-base text-gray-400 leading-relaxed border-t border-gray-800/80 pt-6">
            Líderes globales, visionarios, innovadores, agentes de cambio y talentos emergentes 
            comparten su experiencia, su visión y su historia. Cada charla en el Main Stage no 
            solo informa: moviliza, impulsa, cuestiona y despierta nuevas posibilidades.
          </p>
        </div>

        {/* REJILLA DE TARJETAS RECTANGULARES CON BLUR PREMIUM */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {speakersDestacados.map((speaker) => (
            <div
              key={speaker.id}
              /* Optimizado el fondo con cristal esmerilado translúcido mediante bg-black/25 y backdrop-blur-xl */
              className="group relative bg-black/25 backdrop-blur-xl border border-white/10 rounded-xl p-6 transition-all duration-500 hover:shadow-2xl flex flex-col justify-between overflow-hidden"
              style={{
                '--hover-border': speaker.colorTheme,
              } as React.CSSProperties}
            >
              {/* Resplandor interno dinámico al hacer hover */}
              <div className={`absolute -inset-px bg-gradient-to-br ${speaker.glowClass} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl z-0`} />
              
              <div className="relative z-10">
                {/* Badge Rectangular de Especialidad */}
                <span 
                  className="inline-block text-[10px] font-bold tracking-wider uppercase bg-black/50 backdrop-blur-sm border px-3 py-1 rounded-sm mb-6 transition-colors duration-300"
                  style={{ borderColor: `${speaker.colorTheme}44`, color: speaker.colorTheme }}
                >
                  {speaker.tag}
                </span>

                {/* Contenedor del Avatar Rectangular de Cristal */}
                <div 
                  className="w-full h-44 bg-black/40 backdrop-blur-md border rounded-lg flex flex-col items-center justify-center mb-6 relative transition-all duration-500 overflow-hidden group-hover:scale-[1.02]"
                  style={{ borderColor: 'rgba(255,255,255,0.08)' }}
                >
                  {/* Patrón de líneas estéticas de fondo */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100%_8px] pointer-events-none" />
                  
                  {/* Iniciales gigantes */}
                  <span className="text-4xl font-black text-gray-500/50 group-hover:text-white transition-colors duration-500 tracking-widest">
                    {speaker.nombre.split(' ').filter(Boolean).map(n => n[0]).join('').substring(0, 3).toUpperCase()}
                  </span>
                  
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
                <h4 className="text-2xl font-bold text-white mb-1 transition-colors duration-300">
                  {speaker.nombre}
                </h4>
                <p className="text-xs text-gray-400 mb-5 font-medium">
                  {speaker.puesto} at <span className="text-gray-200">{speaker.compania}</span>
                </p>

                {/* Conferencia con barra lateral de color */}
                <p 
                  className="text-sm text-gray-300 leading-relaxed font-medium border-l-2 pl-3 py-1 transition-all duration-500"
                  style={{ borderLeftColor: `${speaker.colorTheme}77` }}
                >
                  {speaker.conferencia}
                </p>
              </div>

              {/* Pie de la tarjeta */}
              <div className="mt-8 pt-4 border-t border-white/5 flex justify-between items-center relative z-10">
                <span className="text-xs text-gray-500 font-mono">
                  [ KEYNOTE_0{speaker.id} ]
                </span>
                <button 
                  className="text-xs font-bold tracking-wider uppercase flex items-center gap-1 transition-all duration-300 group-hover:translate-x-1"
                  style={{ color: speaker.colorTheme }}
                >
                  Perfil →
                </button>
              </div>

              {/* Manejo del cambio de borde dinámico */}
              <style jsx>{`
                div:hover {
                  border-color: ${speaker.colorTheme}88 !important;
                }
              `}</style>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}