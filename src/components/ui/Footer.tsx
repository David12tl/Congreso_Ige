'use client';

import React from 'react';

export default function Footer() {
  const añoActual = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#090a0f] text-gray-400 py-12 px-4 md:px-8 border-t border-white/[0.03] relative overflow-hidden font-sans">
      
      {/* Detalle LED decorativo en la parte superior del footer */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#03B3C3]/40 to-transparent" />

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
        
        {/* COLUMNA 1: LOGO Y DESCRIPCIÓN */}
        <div className="md:col-span-2">
          <h3 className="text-lg font-black tracking-widest text-white uppercase mb-4">
            CONGRESO <span className="text-[#03B3C3]">IGE</span>
          </h3>
          <p className="text-xs leading-relaxed max-w-sm text-gray-500">
            El epicentro de la ingeniería, la tecnología y el desarrollo estratégico. 
            Impulsando a la próxima generación de líderes globales desde Orizaba, Veracruz.
          </p>
          
          {/* Redes Sociales Simuladas */}
          <div className="flex gap-4 mt-6">
            <a href="#" className="w-8 h-8 rounded-md bg-white/[0.02] border border-white/5 flex items-center justify-center text-xs hover:border-[#03B3C3] hover:text-white transition-colors">
              FB
            </a>
            <a href="#" className="w-8 h-8 rounded-md bg-white/[0.02] border border-white/5 flex items-center justify-center text-xs hover:border-[#D856BF] hover:text-white transition-colors">
              IG
            </a>
            <a href="#" className="w-8 h-8 rounded-md bg-white/[0.02] border border-white/5 flex items-center justify-center text-xs hover:border-[#10B981] hover:text-white transition-colors">
              X
            </a>
            <a href="#" className="w-8 h-8 rounded-md bg-white/[0.02] border border-white/5 flex items-center justify-center text-xs hover:border-red-500 hover:text-white transition-colors">
              YT
            </a>
          </div>
        </div>

        {/* COLUMNA 2: NAVEGACIÓN */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
            Ecosistema
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <a href="#hero" className="hover:text-[#03B3C3] transition-colors">Inicio</a>
            </li>
            <li>
              <a href="#lands" className="hover:text-[#03B3C3] transition-colors">Lands Temáticas</a>
            </li>
            <li>
              <a href="#speakers" className="hover:text-[#03B3C3] transition-colors">Speakers Magistrales</a>
            </li>
            <li>
              <a href="#teatro" className="hover:text-[#03B3C3] transition-colors">Mapa del Teatro</a>
            </li>
          </ul>
        </div>

        {/* COLUMNA 3: SOPORTE / LEGAL */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
            Información
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <a href="#" className="hover:text-white transition-colors">Preguntas Frecuentes</a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition-colors">Términos y Condiciones</a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition-colors">Aviso de Privacidad</a>
            </li>
            <li>
              <span className="text-gray-600 block mt-2 font-mono text-[10px]">📍 Auditorio Metropolitano, Orizaba</span>
            </li>
          </ul>
        </div>

      </div>

      {/* LÍNEA DE CRÉDITOS Y DERECHOS */}
      <div className="max-w-6xl mx-auto mt-12 pt-6 border-t border-white/[0.02] flex flex-col sm:flex-row justify-between items-center gap-4 relative z-10 text-[11px] text-gray-600 font-mono">
        <div>
          © {añoActual} Congreso IGE. Todos los derechos reservados.
        </div>
        <div className="hover:text-[#03B3C3] transition-colors cursor-pointer">
          [ DESIGNED BY DAVID_DEV ]
        </div>
      </div>

    </footer>
  );
}