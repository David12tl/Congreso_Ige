'use client';

import React from 'react';

export default function Footer() {
  const añoActual = new Date().getFullYear();

  return (
    <footer className="bg-surface-card border-t border-border-subtle w-full py-8 px-4 md:px-8 relative overflow-hidden font-sans">
      
      {/* Detalle LED decorativo en la parte superior del footer */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#03B3C3]/40 to-transparent" />

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
        
        {/* COLUMNA 1: LOGO Y DESCRIPCIÓN */}
        <div className="md:col-span-2">
          <h3 className="text-lg font-black tracking-widest uppercase mb-4" style={{ color: 'var(--text-principal)' }}>
            ELIGE <span className="text-[#03B3C3]">2030</span>
            <br className="hidden md:block" /><p>Ingenieria en Gestion Empresarial</p>
          </h3>
          <p className="text-xs leading-relaxed max-w-sm" style={{ color: 'var(--text-principal)', opacity: 0.6 }}>
            El epicentro de la ingeniería, la tecnología y el desarrollo estratégico. 
            Impulsando a la próxima generación de líderes globales desde Orizaba, Veracruz.
          </p>
          
          {/* Redes Sociales Simuladas */}
          <div className="flex gap-4 mt-6">
            <a href="#" className="w-8 h-8 rounded-md bg-superficie-card border border-borde-sutil flex items-center justify-center text-xs hover:border-[#03B3C3] transition-colors" style={{ color: 'var(--text-principal)' }}>
              FB
            </a>
            <a href="#" className="w-8 h-8 rounded-md bg-superficie-card border border-borde-sutil flex items-center justify-center text-xs hover:border-[#D856BF] transition-colors" style={{ color: 'var(--text-principal)' }}>
              IG
            </a>
            <a href="#" className="w-8 h-8 rounded-md bg-superficie-card border border-borde-sutil flex items-center justify-center text-xs hover:border-[#10B981] transition-colors" style={{ color: 'var(--text-principal)' }}>
              X
            </a>
            <a href="#" className="w-8 h-8 rounded-md bg-superficie-card border border-borde-sutil flex items-center justify-center text-xs hover:border-red-500 transition-colors" style={{ color: 'var(--text-principal)' }}>
              YT
            </a>
          </div>
        </div>

        {/* COLUMNA 2: NAVEGACIÓN */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--text-principal)' }}>
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

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--text-principal)' }}>
            Información
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <a href="/faqs" className="transition-colors hover:text-[#03B3C3]">Preguntas Frecuentes</a>
            </li>
            <li>
              <a href="/terminos" className="transition-colors hover:text-[#03B3C3]">Términos y Condiciones</a>
            </li>
            <li>
              <a href="/privacidad" className="transition-colors hover:text-[#03B3C3]">Aviso de Privacidad</a>
            </li>
            <li>
              <span className="block mt-2 font-mono text-[10px]" style={{ color: 'var(--text-principal)', opacity: 0.5 }}>📍 Auditorio Metropolitano, Orizaba</span>
            </li>
          </ul>
        </div>

      </div>

      {/* LÍNEA DE CRÉDITOS Y DERECHOS */}
      <div className="max-w-6xl mx-auto mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 relative z-10 text-[11px] font-mono" style={{ color: 'var(--text-principal)', opacity: 0.5, borderTop: '1px solid var(--border-componentes)' }}>
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