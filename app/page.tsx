'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import TabTime from '@/components/ui/tabtime';
import SpeakerCardSection from '@/components/ui/SpeakersMagistralesSection';

export default function CongresoPage() {
  
  // Efecto para inicializar el Intersection Observer (reemplaza el script de animación original)
  useEffect(() => {
    // Inyectar fuentes de Google Fonts y Material Symbols dinámicamente si no están en el layout global
    const linkSora = document.createElement('link');
    linkSora.href = 'https://fonts.googleapis.com/css2?family=Sora:wght@100..800&display=swap';
    linkSora.rel = 'stylesheet';
    document.head.appendChild(linkSora);

    const linkIcons = document.createElement('link');
    linkIcons.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
    linkIcons.rel = 'stylesheet';
    document.head.appendChild(linkIcons);

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

    return () => {
      observer.disconnect();
    };
  }, []);

  // Manejador de scroll suave
  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>, targetId: string) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Clases personalizadas del estilo original transformadas a inline styles reutilizables
  const styles = {
    iconSettings: {
      fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"
    },
    glassCard: {
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(229, 229, 229, 1)'
    },
    heroGradient: {
      background: 'radial-gradient(circle at 70% 30%, rgba(0, 184, 148, 0.05) 0%, rgba(255, 255, 255, 0) 70%)'
    }
  };

  return (
    <div className="bg-[#f4fbf6] text-[#161d1a] font-['Sora'] overflow-x-hidden min-h-screen">
      
      {/* TopNavBar */}
      <header className="fixed top-0 w-full z-50 bg-[#f4fbf6]/80 backdrop-blur-md shadow-sm border-b border-[#dde4df]">
        <nav className="max-w-7xl mx-auto px-16 flex justify-between items-center h-20 max-md:px-4">
          <div className="text-[48px] font-extrabold tracking-tighter text-[#07264D] leading-tight max-md:text-[10px]">
            ELIGE
          </div>
          <Image 
            src="/logo.png"
            alt="Logo del Congreso"
            width={48}
            height={48}
            className="w-12 h-12"
          />
          <div className="hidden md:flex gap-12 items-center">
            <a 
              className="text-[#006b55] font-bold border-b-2 border-[#006b55] pb-1 text-[16px]" 
              href="#"
            >
              Inicio
            </a>
            <a 
              className="text-[#3c4a44] text-[16px] hover:text-[#006b55] transition-colors duration-200" 
              href="#schedule"
              onClick={(e) => handleSmoothScroll(e, 'schedule')}
            >
              Programa
            </a>
            <a 
              className="text-[#3c4a44] text-[16px] hover:text-[#006b55] transition-colors duration-200" 
              href="#info"
              onClick={(e) => handleSmoothScroll(e, 'info')}
            >
              Información
            </a>
          </div>
          <button className="bg-[#00b894] text-white text-[14px] font-semibold tracking-wide px-6 py-3 rounded-lg active:scale-95 duration-100 transition-transform">
            Registrarse
          </button>
        </nav>
      </header>

      <main className="pt-20">

        {/* Hero Section */}
        <section style={styles.heroGradient} className="relative min-h-[821px] flex items-center overflow-hidden">
          <div className="max-w-7xl mx-auto px-16 grid grid-cols-1 md:grid-cols-12 gap-20 items-center relative z-10 max-md:px-4 max-md:py-12">
            <div className="md:col-span-7">
              <div className="inline-flex items-center gap-1 mb-6">
                <span className="w-12 h-[2px] bg-[#006874]"></span>
                <span className="text-[14px] font-semibold tracking-widest text-[#006874] uppercase">
                  18-19 Noviembre 2026
                </span>
              </div>
              <h1 className="text-[48px] font-extrabold tracking-tight mb-6 text-[#161d1a] leading-tight max-md:text-[36px]">
                1er Congreso Internacional<br />
                <span className="text-[#00b894]">en Gestión Empresarial</span>
              </h1>
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="px-3 py-1 bg-[#006b55]/10 text-[#006b55] rounded-full text-[12px] font-semibold">Emprendimiento</span>
                <span className="px-3 py-1 bg-[#006874]/10 text-[#006874] rounded-full text-[12px] font-semibold">Liderazgo</span>
                <span className="px-3 py-1 bg-[#994700]/10 text-[#994700] rounded-full text-[12px] font-semibold">Innovación</span>
              </div>
              <p className="text-[18px] text-[#3c4a44] mb-12 max-w-xl leading-relaxed">
                Un espacio internacional de aprendizaje, inspiración y conexión para transformar ideas en soluciones que generen valor y desarrollo sostenible.
              </p>
              <div className="flex flex-wrap gap-6">
                <button className="bg-[#00b894] text-white text-[14px] font-semibold px-12 py-4 rounded-lg shadow-lg shadow-[#00b894]/20 hover:brightness-110 active:scale-95 transition-all">
                  Registrar Ahora
                </button>
                <button 
                  onClick={(e) => handleSmoothScroll(e, 'schedule')}
                  className="flex items-center gap-2 text-[14px] font-semibold text-[#161d1a] hover:text-[#006b55] transition-colors py-4"
                >
                  <span className="material-symbols-outlined" style={styles.iconSettings}>play_circle</span>
                  Ver Programa
                </button>
              </div>
            </div>
            
            <div className="md:col-span-5 relative hidden md:block">
              <div className="relative w-full aspect-square rounded-full border border-[#dde4df] p-12">
                <div className="absolute inset-0 border border-[#00b894]/20 rounded-full animate-pulse"></div>
                <div className="w-full h-full rounded-full overflow-hidden shadow-2xl flex items-center justify-center bg-[#00b894]/10">
                  <div className="text-center p-12">
                    <span className="text-7xl block mb-6">🚀</span>
                    <p className="text-[24px] font-bold text-[#006b55] leading-normal">EMPRENDE</p>
                    <p className="text-[24px] font-bold text-[#006874] leading-normal">LIDERA</p>
                    <p className="text-[24px] font-bold text-[#994700] leading-normal">INNOVA</p>
                    <p className="text-[24px] font-bold text-[#161d1a] leading-normal">TRANSFORMA</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Bento Grid */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-16 max-md:px-4">
            <TabTime />
          </div>
        </section>

        <section id="schedule" className="py-20 bg-[#f4fbf6]">
          <div className="max-w-7xl mx-auto px-16 max-md:px-4">
            <SpeakerCardSection />
          </div>
        </section> 
      

        {/* CTA Section */}
        <section className="py-20 relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
            <div style={styles.glassCard} className="p-12 rounded-xl shadow-2xl">
              <h2 className="text-[32px] font-bold text-[#161d1a] mb-6">¡Sé parte del cambio!</h2>
              <p className="text-[18px] text-[#3c4a44] mb-12 leading-relaxed">
                Únete al 1er Congreso Internacional en Gestión Empresarial. <br />
                <strong>18 y 19 de Noviembre de 2026</strong> en Orizaba, Veracruz.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <button className="bg-[#00b894] text-white text-[14px] font-semibold px-12 py-4 rounded-lg active:scale-95 transition-all shadow-lg shadow-[#00b894]/20">
                  Registrarme Ahora
                </button>
                <button className="bg-white border border-[#dde4df] text-[#161d1a] text-[14px] font-semibold px-12 py-4 rounded-lg hover:bg-[#eef5f0] transition-all">
                  Más Información
                </button>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-[#f4fbf6] border-t border-[#dde4df] w-full py-20">
        <div className="max-w-7xl mx-auto px-16 flex flex-col md:flex-row justify-between items-center gap-6 max-md:px-4">
          <div className="flex flex-col gap-1 items-center md:items-start">
            <div className="text-[48px] font-extrabold text-[#006b55] leading-none max-md:text-[36px]">Congreso 2026</div>
            <p className="text-[14px] font-semibold text-[#3c4a44] mt-2">© 2026 1er Congreso Internacional en Gestión Empresarial.</p>
          </div>
          <div className="flex flex-wrap gap-6 justify-center text-[14px] font-semibold">
            <a className="text-[#3c4a44] hover:text-[#994700] transition-colors duration-200 cursor-pointer">Política de Privacidad</a>
            <a className="text-[#3c4a44] hover:text-[#994700] transition-colors duration-200 cursor-pointer">Términos de Servicio</a>
            <a className="text-[#3c4a44] hover:text-[#994700] transition-colors duration-200 cursor-pointer">Contacto</a>
            <a className="text-[#3c4a44] hover:text-[#994700] transition-colors duration-200 cursor-pointer">Patrocinios</a>
          </div>
          <div className="flex gap-6">
            <span className="material-symbols-outlined text-[#3c4a44] hover:text-[#006b55] transition-all cursor-pointer" style={styles.iconSettings}>share</span>
            <span className="material-symbols-outlined text-[#3c4a44] hover:text-[#006b55] transition-all cursor-pointer" style={styles.iconSettings}>linked_camera</span>
            <span className="material-symbols-outlined text-[#3c4a44] hover:text-[#006b55] transition-all cursor-pointer" style={styles.iconSettings}>alternate_email</span>
          </div>
        </div>
      </footer>
    </div>
  );
}