'use client';

import React from 'react';

interface Partner {
  id: number;
  nombre: string;
  categoria: 'institucional' | 'patrocinador_gold' | 'patrocinador_silver';
  logoPlaceholder: string;
  url?: string;
}

export default function AliadosYPatrocinadores() {
  const aliados: Partner[] = [
    { id: 1, nombre: "Gobierno del Estado", categoria: 'institucional', logoPlaceholder: "GOB VERACRUZ" },
    { id: 2, nombre: "Tecnológico Nacional de México", categoria: 'institucional', logoPlaceholder: "TecNM ORIZABA" },
    { id: 3, nombre: "Cámara de Comercio Regional", categoria: 'institucional', logoPlaceholder: "CANACO SERVYTUR" },
    { id: 4, nombre: "Universidad de Innovación", categoria: 'institucional', logoPlaceholder: "UNI_TECH" },
  ];

  const patrocinadoresGold: Partner[] = [
    { id: 5, nombre: "Apex Cloud Solutions", categoria: 'patrocinador_gold', logoPlaceholder: "APEX CLOUD" },
    { id: 6, nombre: "Quantum CyberSec", categoria: 'patrocinador_gold', logoPlaceholder: "⚡ QUANTUM" },
    { id: 7, nombre: "Krypton Global Dev", categoria: 'patrocinador_gold', logoPlaceholder: "KRYPTON_DEV" },
  ];

  return (
    /* Cambiado a bg-white y texto principal a gris oscuro para contraste perfecto */
    <section className="w-full bg-white text-gray-900 py-20 px-4 md:px-8 relative border-t border-gray-200">
      
      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* ENCABEZADO DE SECCIÓN SERIA */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[11px] font-mono tracking-[0.4em] text-gray-400 uppercase block mb-2">
            Respaldando el Ecosistema
          </span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-4">
            Alianzas Estratégicas
          </h2>
          <div className="w-12 h-[1px] bg-gray-300 mx-auto mb-4" />
          <p className="text-xs md:text-sm text-gray-500 leading-relaxed font-light">
            Gracias al compromiso mutuo con la innovación, la educación y el desarrollo tecnológico, 
            estas destacadas organizaciones hacen posible este magno encuentro de talento nacional.
          </p>
        </div>

        {/* CONTENEDOR DE ALIADOS INSTITUCIONALES */}
        <div className="mb-16">
          <h3 className="text-center text-xs font-semibold tracking-[0.2em] text-gray-400 uppercase mb-8">
            Aliados Institucionales
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {aliados.map((aliado) => (
              <div
                key={aliado.id}
                /* Fondo gris ultra claro para los bloques sobre el fondo blanco */
                className="h-24 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center p-4 transition-all duration-300 filter grayscale opacity-70 hover:grayscale-0 hover:opacity-100 hover:bg-gray-100 hover:border-gray-300 group cursor-pointer shadow-sm"
              >
                <span className="text-xs font-mono font-semibold tracking-wider text-gray-500 group-hover:text-gray-900 transition-colors text-center uppercase">
                  {aliado.logoPlaceholder}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CONTENEDOR DE PATROCINADORES PRINCIPALES (GOLD) */}
        <div>
          <h3 className="text-center text-xs font-semibold tracking-[0.2em] text-gray-400 uppercase mb-8">
            Sponsors Oficiales
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {patrocinadoresGold.map((spon) => (
              <div
                key={spon.id}
                /* Tarjetas blancas con una sombra suave para resaltar */
                className="h-28 bg-white border border-gray-200 rounded-xl flex flex-col items-center justify-center p-6 transition-all duration-300 filter grayscale opacity-80 hover:grayscale-0 hover:opacity-100 hover:border-gray-400 hover:shadow-md group cursor-pointer relative overflow-hidden"
              >
                {/* Línea decorativa que se ilumina en cian al pasar el cursor */}
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#03B3C3] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

                <span className="text-sm font-bold tracking-widest text-gray-700 group-hover:text-gray-900 transition-colors duration-300 text-center">
                  {spon.logoPlaceholder}
                </span>
                <span className="text-[9px] font-mono text-gray-400 mt-2 uppercase tracking-widest group-hover:text-[#03B3C3] transition-colors">
                  [ GOLD PARTNER ]
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}