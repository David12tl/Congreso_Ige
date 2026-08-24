'use client';

import React, { useEffect } from 'react';
import Footer from '@/components/ui/Footer';
import Navbar from '@/components/ui/navbar';
import AliadosYPatrocinadores from '@/components/ui/AliadosYPatrocinadores';
import { InfiniteSliderBasic as InfiniteSlider } from '@/components/ui/infinite-slider';
import Image from 'next/image';

export default function ProgramaPage() {
  
  useEffect(() => {
    const linkSora = document.createElement('link');
    linkSora.href = 'https://fonts.googleapis.com/css2?family=Sora:wght@100..800&display=swap';
    linkSora.rel = 'stylesheet';
    document.head.appendChild(linkSora);

    const linkIcons = document.createElement('link');
    linkIcons.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
    linkIcons.rel = 'stylesheet';
    document.head.appendChild(linkIcons);

    const observerOptions = { threshold: 0.05 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100', 'translate-y-0');
          entry.target.classList.remove('translate-y-10', 'opacity-0');
        }
      });
    }, observerOptions);

    const elementsToAnimate = document.querySelectorAll('.animate-on-scroll');
    elementsToAnimate.forEach((el) => {
      el.classList.add('transition-all', 'duration-700', 'translate-y-10', 'opacity-0');
      observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const styles = {
    iconSettings: {
      fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"
    }
  };

  const tokens = {
    bg: 'bg-[#FFFFFF]',
    text: 'text-[#1E2A39]',
    primary: '#1E2A39',
    secondary: '#8B1E23',
    tertiary: '#8B1E23',
    surfaceContainer: 'bg-[#E6E6E6]',
    variant: '#7D7D7D',
  };

  return (
    <div className="bg-white text-[#1E2A39] font-['Montserrat'] overflow-x-hidden min-h-screen antialiased selection:bg-[#8B1E23] selection:text-white">
      <Navbar />

      {/* ─── HERO SECTION / IDENTIDAD DEL CONGRESO ─── */}
      <section className="relative w-full border-b border-slate-200 bg-white pt-36 pb-20 px-6 md:px-16 z-10">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-block text-[11px] font-bold tracking-[0.25em] text-[#1E2A39] uppercase border border-[#E6E6E6] px-4 py-1.5 rounded-full mb-6 bg-[#E6E6E6]">
           1er Congreso Internacional — ELIGE 2026
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-[#1E2A39] mb-6 leading-none">
            1er Congreso Internacional en <br className="hidden md:inline" />
            <span className="text-[#1E2A39]">Gestión Empresarial 2026</span>
          </h1>
          
          <div className="max-w-2xl mx-auto bg-[#E6E6E6] border border-[#E6E6E6] rounded-2xl px-6 py-3 mb-4 inline-flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7D7D7D]">Temática Oficial:</span>
            <span className="text-xs font-extrabold text-[#8B1E23] tracking-tight">
              Emprendimiento, Liderazgo e Innovación en la Gestión Empresarial
            </span>
          </div>
        </div>
      </section>

      {/* ─── OBJETIVO GENERAL ─── */}
      <section className="py-16 max-w-5xl mx-auto px-4 md:px-8 z-20 relative">
        <div className="animate-on-scroll bg-white rounded-[32px] p-8 md:p-12 border border-slate-200/80 shadow-sm relative overflow-hidden">
          {/* Decoración sutil de fondo */}
           <div className="absolute top-0 right-0 w-48 h-48 bg-[#8B1E23]/5 rounded-full blur-3xl pointer-events-none" />
           
           <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
             <div className="bg-[#E6E6E6] p-4 rounded-2xl border border-[#E6E6E6] flex-shrink-0">
               <span className="material-symbols-outlined text-3xl block text-[#1E2A39]" style={styles.iconSettings}>target</span>
             </div>
             <div>
               <span className="text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-lg bg-[#E6E6E6] text-[#1E2A39] border border-[#E6E6E6]">
                 Propósito Institucional
               </span>
               <h2 className="text-2xl md:text-3xl font-black text-[#1E2A39] mt-3 mb-4 tracking-tight">
                 Objetivo General del Congreso
               </h2>
               <p className="text-sm md:text-base text-[#7D7D7D] leading-relaxed font-normal">
                Impulsar el desarrollo de competencias empresariales, el emprendimiento y la innovación tecnológica mediante un espacio de intercambio de conocimientos, experiencias y oportunidades, que integre a estudiantes, profesionales, empresas e investigadores, fomentando la creación de proyectos sostenibles, la vinculación laboral y el crecimiento económico y social en la Zona Centro del Estado de Veracruz.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── MESAS DE TRABAJO ─── */}
      <section className="py-12 max-w-5xl mx-auto px-4 md:px-8 z-20 relative mb-12">
        <div className="text-center max-w-2xl mx-auto mb-12 animate-on-scroll">
          <span className="text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-lg bg-[#E6E6E6] text-[#7D7D7D] border border-[#E6E6E6]">
            Ejes Temáticos Científicos
          </span>
          <h2 className="text-2xl md:text-4xl font-black text-[#1E2A39] mt-3 tracking-tight">
            Mesas de Trabajo
          </h2>
          <p className="text-xs md:text-sm text-[#7D7D7D] mt-2 font-medium">
            Líneas de investigación y desarrollo para la presentación de ponencias y proyectos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* MESA 1: EMPRENDIMIENTO */}
          <div className="animate-on-scroll bg-white border border-slate-200 rounded-[28px] p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300 group hover:border-slate-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#8B1E23]/10 border border-[#8B1E23]/20 flex items-center justify-center text-[#8B1E23] group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-2xl" style={styles.iconSettings}>lightbulb</span>
              </div>
              <div>
                <h3 className="text-xl font-black text-[#1E2A39] tracking-tight">Emprendimiento</h3>
                <p className="text-[10px] text-[#7D7D7D] font-bold uppercase tracking-wider">Mesa de Innovación Organizacional</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-[#E6E6E6] border border-[#E6E6E6] rounded-2xl p-4">
                <h4 className="text-xs font-extrabold text-[#1E2A39] uppercase tracking-wider mb-1">Intraemprendimiento</h4>
                <p className="text-xs text-[#7D7D7D] leading-relaxed">Estudios e investigaciones relacionadas en innovación dentro de las organizaciones.</p>
              </div>

              <div className="bg-[#E6E6E6] border border-[#E6E6E6] rounded-2xl p-4">
                <h4 className="text-xs font-extrabold text-[#1E2A39] uppercase tracking-wider mb-2">Sectores de Emprendimiento</h4>
                <div className="flex flex-wrap gap-1.5">
                  {['Agrícolas', 'Sociales', 'Turísticos', 'Comunitarios', 'Tecnológicos'].map((tag, i) => (
                    <span key={i} className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-white border border-[#E6E6E6] text-[#7D7D7D]">
                      🌱 {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* MESA 2: INNOVACIÓN TECNOLÓGICA */}
          <div className="animate-on-scroll bg-white border border-[#E6E6E6] rounded-[28px] p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300 group hover:border-[#7D7D7D]">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#1E2A39]/10 border border-[#1E2A39]/20 flex items-center justify-center text-[#1E2A39] group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-2xl" style={styles.iconSettings}>developer_board</span>
              </div>
              <div>
                <h3 className="text-xl font-black text-[#1E2A39] tracking-tight">Innovación Tecnológica</h3>
                <p className="text-[10px] text-[#7D7D7D] font-bold uppercase tracking-wider">Mesa de Ingeniería y Futuro</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-[#E6E6E6] border border-[#E6E6E6] rounded-2xl p-4">
                <h4 className="text-xs font-extrabold text-[#1E2A39] uppercase tracking-wider mb-1">IA en el Emprendimiento</h4>
                <p className="text-xs text-[#7D7D7D] leading-relaxed">Estudios, aplicaciones prácticas de vanguardia e investigaciones científicas relacionadas.</p>
              </div>

              <div className="bg-[#E6E6E6] border border-[#E6E6E6] rounded-2xl p-4">
                <h4 className="text-xs font-extrabold text-[#1E2A39] uppercase tracking-wider mb-1">Ciudades Inteligentes y Sustentabilidad</h4>
                <p className="text-xs text-[#7D7D7D] leading-relaxed">Modelos de desarrollo urbano óptimo, gestión inteligente de recursos y tecnologías verdes.</p>
              </div>

              <div className="bg-[#E6E6E6] border border-[#E6E6E6] rounded-2xl p-4">
                <h4 className="text-xs font-extrabold text-[#1E2A39] uppercase tracking-wider mb-1">Proyectos de Innovación Tecnológica</h4>
                <p className="text-xs text-[#7D7D7D] leading-relaxed">Desarrollo técnico y prototipos de alto impacto orientados a la solución de problemas.</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ─── CORRECCIÓN SECCIÓN: SEDE OFICIAL (DISEÑO LIMPIO DE 50% / 50%) ─── */}
      <section className="w-full bg-[#E6E6E6]/40 border-t border-b border-slate-200/60 z-10 relative overflow-hidden">
        <div className="w-full max-w-[1440px] mx-auto animate-on-scroll">
          <div className="grid grid-cols-1 md:grid-cols-2 items-stretch">
            
            {/* Columna Texto con Padding Adecuado */}
            <div className="flex flex-col justify-center py-16 px-6 md:py-24 md:px-16 lg:px-24 bg-white md:bg-transparent">
              <div className="inline-flex items-center gap-2 mb-4">
                <span style={{ backgroundColor: tokens.secondary }} className="w-8 h-[3px] rounded-full"></span>
                <span style={{ color: tokens.secondary }} className="text-xs font-bold tracking-widest uppercase font-sans">
                  Sede Oficial
                </span>
              </div>
              
              <h2 style={{ color: tokens.primary }} className="text-3xl md:text-5xl font-black tracking-tight mb-2 leading-[1.15]">
                Auditorio Metropolitano
              </h2>
              
              <div className="flex flex-wrap gap-2.5 mb-6 mt-3">
                <span className="px-3.5 py-1.5 bg-[#1E2A39]/5 text-[#1E2A39] rounded-lg text-[11px] font-bold border border-[#1E2A39]/10">Lugar Más Grande de Veracruz</span>
                <span className="px-3.5 py-1.5 bg-[#8B1E23]/10 text-[#8B1E23] rounded-lg text-[11px] font-bold">Recinto Cultural</span>
                <span className="px-3.5 py-1.5 bg-[#7D7D7D]/10 text-[#7D7D7D] rounded-lg text-[11px] font-bold border border-[#7D7D7D]/20">Orizaba, Veracruz</span>
              </div>
              
              <p className="text-sm md:text-base text-gray-700 mb-8 max-w-lg leading-relaxed font-normal">
                Ubicado en Orizaba, Veracruz, el **Auditorio Metropolitano** se consolida como el complejo cultural y de convenciones más imponente del estado. Con instalaciones de vanguardia, acústica perfecta y accesibilidad total, garantiza una experiencia inmersiva para estudiantes, docentes e investigadores de todo el mundo.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <button 
                  style={{ backgroundColor: tokens.tertiary }}
                  className="text-white text-[14px] font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-red-900/20 hover:brightness-110 active:scale-95 transition-all"
                >
                  Registrarme Ahora
                </button>
                <a 
                  href="#schedule" 
                  style={{ color: tokens.primary }}
                  className="flex items-center gap-1.5 text-[14px] font-bold hover:text-[#8B1E23] transition-colors py-3"
                >
                  <span className="material-symbols-outlined text-xl" style={styles.iconSettings}>near_me</span>
                  Cómo Llegar
                </a>
              </div>
            </div>
            
            {/* Columna Imagen completa (Abarca todo el alto y ancho del div sin sobreponerse) */}
            <div className="relative w-full h-[350px] md:h-auto min-h-[450px] md:min-h-[600px] select-none z-10">
              <Image 
                src="/teatro.jpeg" 
                alt="Exterior del Auditorio Metropolitano Orizaba" 
                fill
                priority
                sizes="(max-w-768px) 100vw, 50vw"
                className="object-cover object-center pointer-events-none" 
              />
            </div>

          </div>
        </div>
      </section>

      {/* ─── PATROCINADORES E INSTITUCIONES ─── */}
      <section className="py-20 bg-white border-t border-slate-200/60 z-10 relative">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <AliadosYPatrocinadores />
          <div className="mt-12">
            <InfiniteSlider />
          </div>
        </div>
      </section>
        
      <Footer />
    </div>
  );
}