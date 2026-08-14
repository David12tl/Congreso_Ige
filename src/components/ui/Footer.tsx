'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { HiLocationMarker, HiMail, HiPhone } from 'react-icons/hi';

export default function Footer() {
  const añoActual = new Date().getFullYear();

  return (
    <footer className="relative w-full bg-[#1E293B] text-[#E2E8F0] overflow-hidden">
      {/* Sutil patrón de fondo decorativo para dar profundidad */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-5 pointer-events-none" />
      
      {/* Línea decorativa superior con degradado institucional ELIGE */}
      <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#800020] to-[#b91c1c]" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          
          {/* COLUMNA 1: LOGO Y DESCRIPCIÓN INSTITUCIONAL */}
          <div className="flex flex-col space-y-6">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md border border-white/5 inline-block">
                <Image 
                  src="/logo.png" 
                  alt="Logo ELIGE" 
                  width={45} 
                  height={35} 
                  className="object-contain"
                />
              </div>
              <span className="font-sans text-xl font-extrabold tracking-tight text-white">
                ELIGE <span className="text-[#b91c1c]">2026</span>
              </span>
            </div>
            <p className="text-sm text-[#94A3B8] leading-relaxed max-w-sm">
              Impulsando el desarrollo de competencias empresariales, el emprendimiento 
              y la innovación tecnológica en la Zona Centro del Estado de Veracruz.
            </p>
            
            {/* Redes Sociales con estilo de botón moderno */}
            <div className="flex gap-3 pt-2">
              {['FB', 'IG', 'X', 'YT'].map((red) => (
                <a 
                  key={red}
                  href="#" 
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-[#94A3B8] hover:bg-[#800020] hover:border-[#b91c1c]/50 hover:text-white hover:shadow-[0_0_15px_rgba(185,28,28,0.3)] transition-all duration-300 transform hover:-translate-y-1"
                  aria-label={red}
                >
                  {red}
                </a>
              ))}
            </div>
          </div>

          {/* COLUMNA 2: ENLACES RÁPIDOS */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-6 relative pb-3 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-12 after:h-[2px] after:bg-[#b91c1c]">
              Enlaces Rápidos
            </h4>
            <ul className="space-y-4">
              {[
                { label: 'Inicio', path: '/' },
                { label: 'Sobre IGE', path: '/about-ige' },
                { label: 'Nuestra Historia', path: '/aboutme' },
                { label: 'Preguntas Frecuentes', path: '/faqs' }
              ].map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.path} 
                    className="group text-sm text-[#94A3B8] hover:text-[#b91c1c] transition-all duration-200 flex items-center gap-2 transform hover:translate-x-1"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#b91c1c] scale-0 group-hover:scale-100 transition-transform duration-200" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMNA 3: LEGAL */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-6 relative pb-3 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-12 after:h-[2px] after:bg-[#b91c1c]">
              Legal
            </h4>
            <ul className="space-y-4">
              {[
                { label: 'Términos y Condiciones', path: '/terminos' },
                { label: 'Aviso de Privacidad', path: '/privacidad' }
              ].map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.path} 
                    className="group text-sm text-[#94A3B8] hover:text-[#b91c1c] transition-all duration-200 flex items-center gap-2 transform hover:translate-x-1"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#b91c1c] scale-0 group-hover:scale-100 transition-transform duration-200" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMNA 4: CONTACTO */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-6 relative pb-3 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-12 after:h-[2px] after:bg-[#b91c1c]">
              Contacto
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:border-[#b91c1c]/50 transition-colors">
                  <HiLocationMarker className="w-4 h-4 text-[#b91c1c]" />
                </div>
                <span className="text-sm text-[#94A3B8] leading-relaxed">
                  Instituto Tecnológico Superior de Zongolica<br />
                  <span className="text-xs text-[#64748B]">Campus Zongolica, Veracruz</span>
                </span>
              </li>
              <li className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:border-[#b91c1c]/50 transition-colors">
                  <HiMail className="w-4 h-4 text-[#b91c1c]" />
                </div>
                <a 
                  href="mailto:contacto@congresoige.com" 
                  className="text-sm text-[#94A3B8] hover:text-[#b91c1c] transition-colors"
                >
                  contacto@congresoige.com
                </a>
              </li>
              <li className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:border-[#b91c1c]/50 transition-colors">
                  <HiPhone className="w-4 h-4 text-[#b91c1c]" />
                </div>
                <span className="text-sm text-[#94A3B8]">
                  +52 (278) 123 4567
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* LÍNEA DE CIERRE */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[#64748B] font-medium text-center md:text-left">
            &copy; {añoActual} Congreso Internacional en Gestión Empresarial &mdash; ELIGE. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-2 text-[10px] text-[#64748B] font-bold uppercase tracking-wider bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
            <span>ITSZ</span>
            <span className="text-white/20">&middot;</span>
            <span>Tecnológico Nacional de México</span>
          </div>
        </div>
      </div>
    </footer>
  );
}