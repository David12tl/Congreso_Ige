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
];

const tokens = {
  primary: '#97cafd',
  secondary: '#00B4D8',
  tertiary: '#D95D26',
  emerald: '#06c215',
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
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-20">
        {/* Logo y Título */}
        <Link href="/" className="flex items-center gap-3">
          <div className="relative w-12 h-12 flex items-center justify-center rounded-xl p-1.5">
            <Image
              src="/logo.png"
              alt="Logo Congreso"
              width={48}
              height={48}
              className="object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span style={{ color: tokens.primary }} className="text-lg font-extrabold tracking-tight leading-none dark:text-white">
              ELIGE <span style={{ color: tokens.secondary }}>2026</span>
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 dark:text-slate-400 mt-0.5">
              Gestión Empresarial
            </span>
          </div>
        </Link>

        {/* Menú de Navegación para Escritorio */}
        <div className="hidden md:flex gap-8 items-center">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.text}
                href={link.href}
                onClick={(e) => handleSmoothScroll(e, link.href)}
                className={`text-sm font-semibold transition-colors duration-200 hover:text-[#06c215] ${
                  isActive ? 'text-[#06c215]' : isScrolled ? 'text-[#97cafd]' : 'text-[#D95D26]'
                }`}
              >
                {link.text}
              </Link>
            );
          })}
        </div>

        {/* Botón de Registro y Menú Móvil */}
        <div className="flex items-center gap-4">
          <Link href="/login">
            <button
              style={{ backgroundColor: tokens.tertiary }}
              className="hidden sm:block text-white text-sm font-bold px-5 py-2.5 rounded-lg shadow-md hover:brightness-110 transition-transform active:scale-95"
            >
              Registrarse
            </button>
          </Link>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Abrir menú"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </nav>

      {/* Panel de Menú Móvil */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.text}
                  href={link.href}
                  onClick={(e) => handleSmoothScroll(e, link.href)}
                  className={`block px-3 py-2 rounded-md text-base font-medium hover:bg-slate-100 dark:hover:bg-slate-800 ${
                    isActive ? 'text-[#06c215]' : 'text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {link.text}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}