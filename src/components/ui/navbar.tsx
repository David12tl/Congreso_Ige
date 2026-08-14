'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const navLinks = [
  { href: '/', text: 'Inicio' },
  { href: '/Conferencias', text: 'Conferencias' },
  { href: '/info', text: 'Información' },
  { href: '/aboutme', text: 'Nosotros' },
  { href: '/investigacion', text: 'Investigación', external: true },
];

// Paleta de colores ajustada con el Blanco como fondo y detalles en Azul, Vino y Marrón-Dorado
const tokens = {
  navy: '#1E2A39',          // Azul Marino (Para textos principales y hover)
  red: '#8B1E23',           // Rojo Vino ELIGE (Para acentos y botones)
  gold: '#A3704C',          // Marrón-Dorado elegante (Para el año 2026 y detalles)
  grey: '#7D7D7D',          // Gris
  greyLight: '#E6E6E6',     // Gris Claro (Para bordes limpios)
  white: '#FFFFFF',         // Blanco (Fondo base)
};

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    if (targetId.startsWith('/#')) {
      e.preventDefault();
      const id = targetId.substring(2);
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsMenuOpen(false);
  };

  return (
    <header
      style={{ 
        // Fondo blanco sólido al inicio; fondo blanco con 80% de opacidad + desenfoque al hacer scroll
        backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 1)',
        borderColor: isScrolled ? `${tokens.greyLight}80` : 'transparent'
      }}
      className="fixed top-0 w-full z-50 transition-all duration-500 border-b backdrop-blur-md"
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-20">
        
        {/* Logo y Título */}
        <Link href="/" className="flex items-center gap-3 group">
          <div 
            style={{ borderColor: tokens.greyLight }}
            className="relative w-14 h-14 flex items-center justify-center rounded-xl p-1.5 bg-white border shadow-sm transition-transform duration-300 group-hover:scale-105"
          >
            <Image
              src="/logo.png"
              alt="Logo Congreso ELIGE"
              width={44}
              height={44}
              className="object-contain"
            />
          </div>
          <div className="flex flex-col font-sans">
            <span 
              style={{ color: tokens.navy }}
              className="text-xl font-black tracking-tight leading-none"
            >
              ELIGE <span style={{ color: tokens.gold }}>2026</span>
            </span>
            <span 
              style={{ color: tokens.red }}
              className="text-[9px] uppercase font-bold tracking-widest mt-1 opacity-90"
            >
              Gestión Empresarial
            </span>
          </div>
        </Link>

        {/* Menú de Navegación para Escritorio */}
        <div className="hidden md:flex gap-8 items-center h-full">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.text}
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
                onClick={(e) => {
                  if (!link.external) {
                    handleSmoothScroll(e, link.href);
                  }
                }}
                style={{ 
                  color: isActive ? tokens.red : tokens.navy 
                }}
                className="relative text-sm font-bold tracking-wide transition-colors duration-300 hover:text-[#8B1E23] py-2 group"
              >
                {link.text}
                {/* Línea decorativa inferior con el color Marrón-Dorado */}
                <span 
                  style={{ backgroundColor: tokens.gold }}
                  className={`absolute bottom-0 left-0 w-full h-[2.5px] rounded-full transition-transform duration-300 ${
                    isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-50'
                  }`}
                />
              </Link>
            );
          })}
        </div>

        {/* Botón de Registro e Iniciar Sesión */}
        <div className="flex items-center gap-4">
          <Link href="/register">
            <button
              style={{ 
                backgroundColor: tokens.red,
                boxShadow: `0 4px 12px ${tokens.red}20`
              }}
              className="hidden sm:block text-white text-sm font-bold px-6 py-2.5 rounded-lg transition-all duration-200 hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
            >
              Registrarse
            </button>
          </Link>
          <Link href="/login">
            <button
              style={{ 
                backgroundColor: tokens.red,
                boxShadow: `0 4px 12px ${tokens.red}20`
              }}
              className="hidden sm:block text-white text-sm font-bold px-6 py-2.5 rounded-lg transition-all duration-200 hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
            >
              Iniciar Sesión
            </button>
          </Link>
          
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{ 
              borderColor: tokens.greyLight,
              color: tokens.navy
            }}
            className="md:hidden p-2 rounded-lg hover:bg-black/5 border transition-colors duration-200"
            aria-label="Abrir menú"
          >
            <span className="material-symbols-outlined block">
              {isMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </nav>

      {/* Panel de Menú Móvil */}
      {isMenuOpen && (
        <div 
          style={{ 
            backgroundColor: tokens.white,
            borderColor: tokens.greyLight
          }}
          className="md:hidden border-t shadow-lg animate-in fade-in slide-in-from-top-4 duration-200"
        >
          <div className="px-4 pt-3 pb-6 space-y-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.text}
                  href={link.href}
                  target={link.external ? '_blank' : undefined}
                  rel={link.external ? 'noopener noreferrer' : undefined}
                  onClick={(e) => {
                    if (!link.external) {
                      handleSmoothScroll(e, link.href);
                    } else {
                      setIsMenuOpen(false);
                    }
                  }}
                  style={{ 
                    color: isActive ? tokens.red : tokens.navy,
                    backgroundColor: isActive ? `${tokens.gold}15` : 'transparent',
                    borderLeft: isActive ? `4px solid ${tokens.gold}` : 'none'
                  }}
                  className="block px-4 py-3 rounded-xl text-base font-bold transition-all"
                >
                  {link.text}
                </Link>
              );
            })}
            
            {/* Botones Móvil */}
            <div className="pt-4 border-t border-black/5 sm:hidden space-y-2">
              <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                <button
                  style={{ backgroundColor: tokens.red }}
                  className="w-full text-white text-sm font-bold py-3 rounded-xl shadow-md"
                >
                  Registrarse
                </button>
              </Link>
              <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                <button
                  style={{ backgroundColor: tokens.red }}
                  className="w-full text-white text-sm font-bold py-3 rounded-xl shadow-md"
                >
                  Iniciar Sesión
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}