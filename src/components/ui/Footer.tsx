'use client';

import React from 'react';
import Link from 'next/link';
import { HiAcademicCap, HiLocationMarker, HiMail, HiPhone } from 'react-icons/hi';

export default function Footer() {
  const añoActual = new Date().getFullYear();

  return (
    <footer className="relative w-full bg-[#1E2A39] text-[#E6E6E6] overflow-hidden">
      {/* Línea decorativa superior con Rojo ELIGE institucional */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-[#8B1E23]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* COLUMNA 1: LOGO Y DESCRIPCIÓN INSTITUCIONAL */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <HiAcademicCap className="w-8 h-8 text-[#8B1E23]" />
              <div>
                <h3 className="text-lg font-bold text-white uppercase tracking-wider">
                  Congreso <span className="text-[#8B1E23]">IGE</span>
                </h3>
                <p className="text-[10px] text-[#E6E6E6] uppercase tracking-[0.2em] font-mono">
                  1er Congreso Internacional
                </p>
              </div>
            </div>
            <p className="text-sm text-[#E6E6E6] leading-relaxed max-w-xs">
              Impulsando el desarrollo de competencias empresariales, el emprendimiento 
              y la innovación tecnológica en la Zona Centro del Estado de Veracruz.
            </p>
            
            {/* Redes Sociales */}
            <div className="flex gap-3 mt-6">
              <a 
                href="#" 
                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-[#E6E6E6] hover:bg-[#8B1E23]/20 hover:border-[#8B1E23]/40 hover:text-white transition-all duration-300"
                aria-label="Facebook"
              >
                FB
              </a>
              <a 
                href="#" 
                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-[#E6E6E6] hover:bg-[#8B1E23]/20 hover:border-[#8B1E23]/40 hover:text-white transition-all duration-300"
                aria-label="Instagram"
              >
                IG
              </a>
              <a 
                href="#" 
                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-[#E6E6E6] hover:bg-[#8B1E23]/20 hover:border-[#8B1E23]/40 hover:text-white transition-all duration-300"
                aria-label="Twitter / X"
              >
                X
              </a>
              <a 
                href="#" 
                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-[#E6E6E6] hover:bg-[#8B1E23]/20 hover:border-[#8B1E23]/40 hover:text-white transition-all duration-300"
                aria-label="YouTube"
              >
                YT
              </a>
            </div>
          </div>

          {/* COLUMNA 2: ENLACES RÁPIDOS */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-5 border-b border-white/10 pb-2">
              Enlaces Rápidos
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-sm text-[#E6E6E6] hover:text-[#8B1E23] transition-colors duration-200 flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-[#8B1E23]/60" />
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/about-ige" className="text-sm text-[#E6E6E6] hover:text-[#8B1E23] transition-colors duration-200 flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-[#8B1E23]/60" />
                  Sobre IGE
                </Link>
              </li>
              <li>
                <Link href="/aboutme" className="text-sm text-[#E6E6E6] hover:text-[#8B1E23] transition-colors duration-200 flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-[#8B1E23]/60" />
                  Nuestra Historia
                </Link>
              </li>
              <li>
                <Link href="/faqs" className="text-sm text-[#E6E6E6] hover:text-[#8B1E23] transition-colors duration-200 flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-[#8B1E23]/60" />
                  Preguntas Frecuentes
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMNA 3: LEGAL */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-5 border-b border-white/10 pb-2">
              Legal
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/terminos" className="text-sm text-[#E6E6E6] hover:text-[#8B1E23] transition-colors duration-200 flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-[#8B1E23]/60" />
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link href="/privacidad" className="text-sm text-[#E6E6E6] hover:text-[#8B1E23] transition-colors duration-200 flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-[#8B1E23]/60" />
                  Aviso de Privacidad
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMNA 4: CONTACTO */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-5 border-b border-white/10 pb-2">
              Contacto
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <HiLocationMarker className="w-5 h-5 text-[#8B1E23] shrink-0 mt-0.5" />
                <span className="text-sm text-[#E6E6E6]">
                  Instituto Tecnológico Superior de Zongolica<br />
                  Campus Zongolica, Veracruz
                </span>
              </li>
              <li className="flex items-center gap-3">
                <HiMail className="w-5 h-5 text-[#8B1E23] shrink-0" />
                <a href="mailto:contacto@congresoige.com" className="text-sm text-[#E6E6E6] hover:text-[#8B1E23] transition-colors">
                  contacto@congresoige.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <HiPhone className="w-5 h-5 text-[#8B1E23] shrink-0" />
                <span className="text-sm text-[#E6E6E6]">
                  +52 (278) 123 4567
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* LÍNEA DE CIERRE */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[#7D7D7D] font-mono">
            &copy; {añoActual} Congreso Internacional en Gestión Empresarial &mdash; ELIGE. Todos los derechos reservados.
          </p>
          <p className="text-[10px] text-[#7D7D7D] font-mono uppercase tracking-widest">
            ITSZ &middot; Tecnológico Nacional de México
          </p>
        </div>
      </div>
    </footer>
  );
}