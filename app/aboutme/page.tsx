'use client';

import React, { useEffect } from 'react';
import Footer from '@/components/ui/Footer';
import Image from 'next/image';
import Navbar from '@/components/ui/navbar';

export default function SobreNosotrosPage() {
  
  useEffect(() => {
    const linkSora = document.createElement('link');
    linkSora.href = 'https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap';
    linkSora.rel = 'stylesheet';
    document.head.appendChild(linkSora);

    const linkIcons = document.createElement('link');
    linkIcons.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
    linkIcons.rel = 'stylesheet';
    document.head.appendChild(linkIcons);

    // Animación de entrada por scroll
    const observerOptions = { threshold: 0.1 };
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

    return () => observer.disconnect();
  }, []);

  const styles = {
    iconSettings: {
      fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"
    }
  };

  return (
    <div className="bg-[#f4fbf6] text-[#161d1a] font-['Sora'] overflow-x-hidden min-h-screen antialiased selection:bg-[#006b55] selection:text-white">
      <Navbar />

      <main className="pt-20">
        
        {/* ─── HERO SECTION: ¿QUIÉNES SOMOS? ─── */}
        <section className="relative h-[650px] flex items-center justify-center overflow-hidden bg-[#f4fbf6]">
          <div className="relative z-10 max-w-5xl mx-auto text-center px-4 md:px-16">
            <span className="inline-block px-4 py-1.5 bg-[#006874]/10 text-[#006874] text-xs font-bold uppercase tracking-widest mb-6 border border-[#006874]/20 rounded">
              Ingeniería en Gestión Empresarial
            </span>
            <h1 className="text-4xl md:text-[60px] font-extrabold tracking-tighter text-[#161d1a] mb-6 leading-tight">
              ¿Quiénes somos?
            </h1>
            <p className="text-base md:text-lg text-[#3c4a44] max-w-3xl mx-auto leading-relaxed font-normal">
              La Academia de la Ingeniería en Gestión Empresarial del <span className="font-bold text-[#006b55]">Instituto Tecnológico Superior de Zongolica</span> se inicia en el año 2009 con una matrícula de 41 alumnos. Al ser una ingeniería nueva, se plantearon objetivos claros para desarrollar nuevos emprendedores y empresarios en la región, combatiendo el desempleo.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <button className="px-8 py-4 bg-[#00b894] text-[#002018] text-sm font-bold uppercase tracking-wider rounded-full shadow-lg hover:shadow-[#00b894]/20 transition-all hover:brightness-110 active:scale-95">
                Ver Ideario Institucional
              </button>
            </div>
          </div>
        </section>

        {/* ─── EVOLUCIÓN ACADÉMICA E INCUBADORA ─── */}
        <section className="py-24 bg-white border-y border-[#dde4df]">
          <div className="max-w-7xl mx-auto px-6 md:px-16 flex flex-col md:flex-row gap-16 items-center">
            
            <div className="w-full md:w-1/2 animate-on-scroll">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#161d1a] tracking-tight">
                Consolidación y <span className="text-[#00b894] underline decoration-[#00b894]/20">Presencia</span> Actual
              </h2>
              <div className="space-y-4 text-base text-[#3c4a44] leading-relaxed">
                <p>
                  La incubadora de empresas del Instituto pasó a formar parte de la ingeniería para trabajar de manera coordinada, involucrando activamente a docentes y alumnos en proyectos financieros de alto impacto.
                </p>
                <p className="font-medium text-[#161d1a]">
                  Actualmente, la academia está conformada por un sólido cuerpo académico de 38 docentes estratégicamente distribuidos en 6 unidades académicas y el campus central Zongolica.
                </p>
              </div>
            </div>

            <div className="w-full md:w-1/2 relative group animate-on-scroll">
              <div className="absolute -inset-4 bg-[#00b894]/10 rounded-xl group-hover:bg-[#00b894]/15 transition-colors duration-300"></div>
              {/* Contenedor estructural moderno simulando ecosistema de unidades */}
              <div >
                <div className="flex items-start justify-between">
                  <span className="material-symbols-outlined text-4xl text-[#006b55]" style={styles.iconSettings}>hub</span>
                  <span className="text-xs font-bold uppercase tracking-wider bg-white px-3 py-1 border border-[#bbcac3] text-[#006874] rounded-full">Red Institucional</span>
                </div>
                <div>
                  <Image
                    src="/IGE.png"
                    alt="Estructura académica de IGE"
                    width={500}
                    height={350}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ─── OBJETIVO GENERAL DE IGE ─── */}
        <section className="py-24 bg-[#e8f0eb]/40 border-b border-[#dde4df]">
          <div className="max-w-4xl mx-auto px-6 text-center animate-on-scroll">
            <div className="w-12 h-12 bg-[#00b894]/10 rounded-full flex items-center justify-center text-[#006b55] mx-auto mb-6">
              <span className="material-symbols-outlined text-2xl" style={styles.iconSettings}>track_changes</span>
            </div>
            <h2 className="text-3xl font-bold text-[#161d1a] tracking-tight mb-6">Objetivo General de IGE</h2>
            <p className="text-lg md:text-xl text-[#3c4a44] leading-relaxed font-normal">
              Formar integralmente profesionales que contribuyan a la gestión de empresas e innovación de procesos <span className="text-[#006b55] font-semibold">emprendinnovadores</span>; así como al diseño, implementación y desarrollo de sistemas estratégicos de negocios, optimizando recursos en un entorno global, con ética y responsabilidad social.
            </p>
          </div>
        </section>

        {/* ─── IDEARIO INSTITUCIONAL (MISIÓN Y VISIÓN) ─── */}
        <section className="py-24 bg-[#f4fbf6]">
          <div className="max-w-7xl mx-auto px-6 md:px-16 text-center mb-16 animate-on-scroll">
            <h2 className="text-3xl md:text-4xl font-bold text-[#161d1a] tracking-tight">Ideario Institucional IGE</h2>
            <p className="text-sm text-[#3c4a44] mt-2 font-medium uppercase tracking-wider">
              Nuestros Pilares Fundacionales
            </p>
          </div>

          <div className="max-w-7xl mx-auto px-6 md:px-16 grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* MISIÓN */}
            <div className="animate-on-scroll p-8 bg-white border border-[#bbcac3] rounded-xl hover:border-[#00b894] transition-all duration-300 group shadow-sm">
              <div className="w-12 h-12 bg-[#00b894]/10 rounded flex items-center justify-center text-[#006b55] mb-6 group-hover:bg-[#006b55] group-hover:text-white transition-all duration-300">
                <span className="material-symbols-outlined text-2xl" style={styles.iconSettings}>flag</span>
              </div>
              <h3 className="text-2xl font-bold text-[#161d1a] mb-4 tracking-tight">Misión</h3>
              <p className="text-sm md:text-base text-[#3c4a44] leading-relaxed">
                Formar profesionistas en gestión empresarial con un enfoque emprendinnovador, creativo y sustentable, que coadyuven de manera eficiente y eficaz hacia el desarrollo económico de la zona de influencia del ITSZ.
              </p>
            </div>

            {/* VISIÓN */}
            <div className="animate-on-scroll p-8 bg-white border border-[#bbcac3] rounded-xl hover:border-[#00b894] transition-all duration-300 group shadow-sm">
              <div className="w-12 h-12 bg-[#00b894]/10 rounded flex items-center justify-center text-[#006b55] mb-6 group-hover:bg-[#006b55] group-hover:text-white transition-all duration-300">
                <span className="material-symbols-outlined text-2xl" style={styles.iconSettings}>visibility</span>
              </div>
              <h3 className="text-2xl font-bold text-[#161d1a] mb-4 tracking-tight">Visión</h3>
              <p className="text-sm md:text-base text-[#3c4a44] leading-relaxed">
                Ser un programa educativo líder a nivel nacional por su excelencia profesional, mediante la mejora continua, impulsando el desarrollo sustentable emprendinnovador, que permita elevar la calidad de vida de la sociedad.
              </p>
            </div>

          </div>
        </section>

        {/* ─── ENLACES CORPORATIVOS / SECTORES ASOCIADOS ─── */}
        <section className="py-20 bg-[#eef5f0] border-t border-[#bbcac3]">
          <div className="max-w-7xl mx-auto px-6 md:px-16">
            <p className="text-center text-xs font-bold text-[#3c4a44] uppercase tracking-widest mb-10">
              Ecosistema Tecnológico de Innovación Regional
            </p>
            <div className="flex flex-wrap justify-center gap-12 md:gap-[100px] opacity-75 grayscale hover:grayscale-0 transition-all duration-500">
              <div className="text-xl font-extrabold text-[#6c7a74] tracking-tighter uppercase">Emprendimiento</div>
              <div className="text-xl font-extrabold text-[#6c7a74] tracking-tighter uppercase">Sustentabilidad</div>
              <div className="text-xl font-extrabold text-[#6c7a74] tracking-tighter uppercase">Finanzas</div>
              <div className="text-xl font-extrabold text-[#6c7a74] tracking-tighter uppercase">Innovación</div>
              <div className="text-xl font-extrabold text-[#6c7a74] tracking-tighter uppercase">Ética Social</div>
            </div>
          </div>
        </section>

        {/* ─── SECTION CTA FINAL ─── */}
        <section className="py-24 bg-[#006b55] text-white">
          <div className="max-w-7xl mx-auto px-6 md:px-16 text-center animate-on-scroll">
            <a href="../about-ige" target="_blank" rel="noopener noreferrer">
              <button className="px-10 py-4 bg-white text-[#006b55] text-xs font-bold uppercase tracking-wider rounded-full hover:bg-[#eef5f0] transition-colors active:scale-95 duration-100 shadow-md">
                Perfil de Egreso y Campo Laboral IGE
              </button>
            </a>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}