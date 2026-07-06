'use client';

import React, { useEffect } from 'react';
import Navbar from '@/components/ui/navbar';
import Footer from '@/components/ui/Footer';
// Importación de los componentes de ponentes y cronograma completo
import SpeakersMagistrales from '@/components/ui/Speakers/SpeakersMagistrales';
import ProgramaCompleto from '@/components/ui/Speakers/ProgramaCompleto';

export default function ConferenciaPage() {
  
  // Inyección de la fuente Sora para asegurar la consistencia en toda la aplicación
  useEffect(() => {
    const linkSora = document.createElement('link');
    linkSora.href = 'https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&display=swap';
    linkSora.rel = 'stylesheet';
    document.head.appendChild(linkSora);
  }, []);

  return (
    <main className="min-h-screen bg-white text-[#0f172a] font-['Sora',sans-serif] selection:bg-[#0B2545] selection:text-white">
      <Navbar />
      
      {/* HERO SECTION MINIMALISTA / INDUSTRIAL */}
      <section className="relative w-full border-b border-slate-200 bg-white pt-32 pb-20 px-6 md:px-16">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          
          <div className="max-w-3xl">
            {/* Tag de Contexto del Evento */}
            <div className="inline-block text-[11px] font-bold tracking-[0.3em] text-[#0B2545] uppercase border border-slate-200 px-3 py-1.5 rounded-md mb-6 bg-slate-50">
              PROGRAMA OFICIAL DE CONFERENCIAS
            </div>
            
            {/* Título Principal Editorial */}
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-[#0f172a] leading-none mb-6">
              Gestion  Empresarial <br />
              <span className="text-[#0B2545]">Liderazgo e Inovacion</span>
            </h1>
            
            <p className="text-base md:text-lg text-slate-600 max-w-xl font-light leading-relaxed">
              O ponto de encontro dos líderes e mentes mais brilhantes que estão a moldar o ecossistema corporativo, científico e social.
            </p>
          </div>

          {/* Dados Técnicos Laterais (Estilo Planta/Blueprint de Engenharia) */}
          <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50 min-w-[280px] font-mono text-[11px] text-slate-500 space-y-3 shadow-sm">
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="font-bold text-[#0f172a]">EVENTO:</span>
              <span>ELIGE 2026</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="font-bold text-[#0f172a]">DATA:</span>
              <span>18 E 19 DE NOVEMBRO</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="font-bold text-[#0f172a]">LOCALIZAÇÃO:</span>
              <span>AUDITÓRIO METROPOLITANO</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold text-[#0f172a]">STATUS:</span>
              <span className="text-emerald-600 font-bold animate-pulse">INSCRIPCIONES ABERTAS</span>
            </div>
          </div>

        </div>
      </section>

      {/* 1. SECCIÓN DE TARJETAS DE PONENTES Y EXPERTOS (Maneja el modal internamente) */}
      <SpeakersMagistrales />

      {/* 2. SECCIÓN DEL CRONOGRAMA INTERACTIVO / LÍNEA DE TIEMPO DE ACTIVIDADES */}
      <ProgramaCompleto />

      <Footer />  
    </main>
  );
}