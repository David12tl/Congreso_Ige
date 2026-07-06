'use client';

import React, { useEffect } from 'react';
import Footer from '@/components/ui/Footer';
import Navbar from '@/components/ui/navbar';
import AliadosYPatrocinadores from '@/components/ui/AliadosYPatrocinadores';
import { InfiniteSliderBasic as InfiniteSlider } from '@/components/ui/infinite-slider';

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

  return (
    <div className="bg-slate-50 text-[#0f172a] font-['Sora'] overflow-x-hidden min-h-screen antialiased selection:bg-[#0B2545] selection:text-white">
      <Navbar />

      {/* ─── HERO SECTION / IDENTIDAD DEL CONGRESO ─── */}
      <section className="relative w-full border-b border-slate-200 bg-white pt-36 pb-20 px-6 md:px-16 z-10">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-block text-[11px] font-bold tracking-[0.25em] text-[#0B2545] uppercase border border-slate-200 px-4 py-1.5 rounded-full mb-6 bg-slate-50">
            1er Congreso Internacional — ELIGE 2026
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-[#0f172a] mb-6 leading-none">
            1er Congreso Internacional en <br className="hidden md:inline" />
            <span className="text-[#0B2545]">Gestión Empresarial 2026</span>
          </h1>
          
          <div className="max-w-2xl mx-auto bg-slate-100/80 border border-slate-200/60 rounded-2xl px-6 py-3 mb-4 inline-flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Temática Oficial:</span>
            <span className="text-xs font-extrabold text-[#D95D26] tracking-tight">
              Emprendimiento, Liderazgo e Innovación en la Gestión Empresarial
            </span>
          </div>
        </div>
      </section>

      {/* ─── OBJETIVO GENERAL ─── */}
      <section className="py-16 max-w-5xl mx-auto px-4 md:px-8 z-20 relative">
        <div className="animate-on-scroll bg-white rounded-[32px] p-8 md:p-12 border border-slate-200/80 shadow-sm relative overflow-hidden">
          {/* Decoración sutil de fondo */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex-shrink-0">
              <span className="material-symbols-outlined text-3xl block text-[#0B2545]" style={styles.iconSettings}>target</span>
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-lg bg-blue-50 text-[#0B2545] border border-blue-100">
                Propósito Institucional
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-[#0f172a] mt-3 mb-4 tracking-tight">
                Objetivo General del Congreso
              </h2>
              <p className="text-sm md:text-base text-slate-600 leading-relaxed font-normal">
                Impulsar el desarrollo de competencias empresariales, el emprendimiento y la innovación tecnológica mediante un espacio de intercambio de conocimientos, experiencias y oportunidades, que integre a estudiantes, profesionales, empresas e investigadores, fomentando la creación de proyectos sostenibles, la vinculación laboral y el crecimiento económico y social en la Zona Centro del Estado de Veracruz.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── MESAS DE TRABAJO ─── */}
      <section className="py-12 max-w-5xl mx-auto px-4 md:px-8 z-20 relative mb-20">
        <div className="text-center max-w-2xl mx-auto mb-12 animate-on-scroll">
          <span className="text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-lg bg-emerald-50 text-[#006B55] border border-emerald-100">
            Ejes Temáticos Científicos
          </span>
          <h2 className="text-2xl md:text-4xl font-black text-[#0f172a] mt-3 tracking-tight">
            Mesas de Trabajo
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-2 font-medium">
            Líneas de investigación y desarrollo para la presentación de ponencias y proyectos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* MESA 1: EMPRENDIMIENTO */}
          <div className="animate-on-scroll bg-white border border-slate-200 rounded-[28px] p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300 group hover:border-slate-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#D95D26] group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-2xl" style={styles.iconSettings}>lightbulb</span>
              </div>
              <div>
                <h3 className="text-xl font-black text-[#0f172a] tracking-tight">Emprendimiento</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Mesa de Innovación Organizacional</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4">
                <h4 className="text-xs font-extrabold text-[#0B2545] uppercase tracking-wider mb-1">Intraemprendimiento</h4>
                <p className="text-xs text-slate-600 leading-relaxed">Estudios e investigaciones relacionadas en innovación dentro de las organizaciones.</p>
              </div>

              <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4">
                <h4 className="text-xs font-extrabold text-[#0B2545] uppercase tracking-wider mb-2">Sectores de Emprendimiento</h4>
                <div className="flex flex-wrap gap-1.5">
                  {['Agrícolas', 'Sociales', 'Turísticos', 'Comunitarios', 'Tecnológicos'].map((tag, i) => (
                    <span key={i} className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-600">
                      🌱 {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* MESA 2: INNOVACIÓN TECNOLÓGICA */}
          <div className="animate-on-scroll bg-white border border-slate-200 rounded-[28px] p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300 group hover:border-slate-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-[#00B4D8] group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-2xl" style={styles.iconSettings}>developer_board</span>
              </div>
              <div>
                <h3 className="text-xl font-black text-[#0f172a] tracking-tight">Innovación Tecnológica</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Mesa de Ingeniería y Futuro</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4">
                <h4 className="text-xs font-extrabold text-[#0B2545] uppercase tracking-wider mb-1">IA en el Emprendimiento</h4>
                <p className="text-xs text-slate-600 leading-relaxed">Estudios, aplicaciones prácticas de vanguardia e investigaciones científicas relacionadas.</p>
              </div>

              <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4">
                <h4 className="text-xs font-extrabold text-[#0B2545] uppercase tracking-wider mb-1">Ciudades Inteligentes y Sustentabilidad</h4>
                <p className="text-xs text-slate-600 leading-relaxed">Modelos de desarrollo urbano óptimo, gestión inteligente de recursos y tecnologías verdes.</p>
              </div>

              <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4">
                <h4 className="text-xs font-extrabold text-[#0B2545] uppercase tracking-wider mb-1">Proyectos de Innovación Tecnológica</h4>
                <p className="text-xs text-slate-600 leading-relaxed">Desarrollo técnico y prototipos de alto impacto orientados a la solución de problemas.</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ─── CTA FINAL INSTITUCIONAL ─── */}
      <section className="py-20 bg-white border-t border-slate-200/60">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <AliadosYPatrocinadores />
          <InfiniteSlider />
        </div>
      </section>
        


      <Footer />
    </div>
  );
}