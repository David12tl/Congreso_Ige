'use client';

import React, { useEffect } from 'react';
import TextPressure from '@/components/ui/TextPressure'; 
import Footer from '@/components/ui/Footer';
import TabTime from '@/components/ui/tabtime';
import Navbar from '@/components/ui/navbar';
import SpeakersMagistralesSection from '@/components/ui/Speakers/SpeakersMagistralesSection';

export default function CongresoPage() {
  
  // Efecto para inyectar dinámicamente las tipografías variables y símbolos de Material Design 3
  useEffect(() => {
    const linkSora = document.createElement('link');
    linkSora.href = 'https://fonts.googleapis.com/css2?family=Sora:wght@100..800&display=swap';
    linkSora.rel = 'stylesheet';
    document.head.appendChild(linkSora);

    const linkIcons = document.createElement('link');
    linkIcons.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
    linkIcons.rel = 'stylesheet';
    document.head.appendChild(linkIcons);

    // Animación de entrada fluida mediante Intersection Observer
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

  // Manejador de scroll suave de Material Design
  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>, targetId: string) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Roles de color estrictos basados en la identidad oficial del manual de imagen
  const tokens = {
    bg: 'bg-[#FFFFFF]',                  // Blanco — fondo base limpio
    text: 'text-[#1E2A39]',              // Azul Marino — texto principal
    primary: '#1E2A39',                  // Azul Marino (Escudo base / Navbar / Footer)
    secondary: '#8B1E23',                // Rojo ELIGE (Acento primario / acción)
    tertiary: '#8B1E23',                 // Rojo ELIGE (Botones de acción)
    variant: '#7D7D7D',                  // Gris (texto secundario)
    emerald: '#7D7D7D',                  // Gris (texto secundario)
    surfaceContainer: 'bg-[#E6E6E6]',    // Gris Claro (secciones / tarjetas)
  };

  // Estilos inline de diseño avanzado
  const styles = {
    iconSettings: {
      fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"
    },
    glassCard: {
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(11, 37, 69, 0.08)'
    },
    heroGradient: {
      background: `radial-gradient(circle at 80% 20%, rgba(139, 30, 35, 0.08) 0%, rgba(30, 42, 57, 0.03) 40%, rgba(255, 255, 255, 0) 100%)`
    }
  };

  // Datos para la navegación
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const navLinks = [
    { href: "#", text: 'Inicio', isPrimary: true },
    { href: "#schedule", text: 'Programa' },
    { href: "#info", text: 'Información' },
  ];

  // Datos para la comunidad destino
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const communityTags = [
    { name: 'Estudiantes', style: 'bg-[#1E2A39]/5 text-[#1E2A39]' },
    { name: 'Docentes', style: 'bg-[#8B1E23]/10 text-[#8B1E23]' },
    { name: 'Investigadores', style: 'bg-[#7D7D7D]/10 text-[#7D7D7D]' },
    { name: 'Emprendedores', style: 'bg-[#8B1E23]/10 text-[#8B1E23]' },
  ];

  // Datos del programa para hacer el código más declarativo
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const scheduleDay1 = {
    dayTitle: 'Miércoles 18 de Noviembre',
    daySubtitle: 'Emprendimiento y Sinergias Tecnológicas',
    themeColor: tokens.primary,
    items: [
      { icon: 'mic', text: 'Conferencia Magistral: Gestión Estratégica', color: tokens.primary },
      { icon: 'diversity_3', text: 'Panel Foro: Ecosistemas de Innovación', color: tokens.secondary },
      { icon: 'public', text: 'Mesa Redonda: Alianzas del Centro del Estado', color: tokens.emerald },
      { icon: 'devices', text: 'Expo Emprendimiento & Proyectos Científicos', color: tokens.primary },
      { icon: 'lightbulb', text: 'Concurso Native Pitch: Proyectos de Impacto', color: tokens.tertiary }
    ]
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const scheduleDay2 = {
    dayTitle: 'Jueves 19 de Noviembre',
    daySubtitle: 'Desarrollo Sostenible y Competitividad',
    themeColor: tokens.tertiary,
    items: [
      { icon: 'analytics', text: 'Conferencia: Data Analytics en PyMEs', color: tokens.primary },
      { icon: 'psychology', text: 'Workshop: Inteligencia Artificial Aplicada', color: tokens.secondary },
      { icon: 'model_training', text: 'Estrategias de Escalabilidad de Capital', color: tokens.tertiary },
      { icon: 'workspace_premium', text: 'Evaluación e indexación científica (ISSN / ISBN)', color: tokens.emerald },
      { icon: 'emoji_events', text: 'Clausura, Galardón y Premiación 2026', color: tokens.tertiary }
    ]
  };

  // Datos para las tarjetas de información
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const infoCardsData = [
    {
      icon: 'location_on',
      iconColor: tokens.primary,
      title: 'Sede Central',
      description: <><strong>Auditorio Metropolitano</strong><br />Orizaba, Veracruz, México</>,
    },
    {
      icon: 'calendar_month',
      iconColor: tokens.secondary,
      title: 'Calendario',
      description: <><strong>18 y 19 de Noviembre</strong><br />Edición Ejecutiva 2026</>,
    },
    {
      icon: 'shield',
      iconColor: tokens.emerald,
      title: 'Ecosistema',
      description: <>Cámaras de Comercio e<br /><strong>Industrias de la Región</strong></>,
    },
  ];

  return (
    <div className={`${tokens.bg} ${tokens.text} font-['Montserrat'] overflow-x-hidden min-h-screen antialiased`}>
      
      {/* Navbar responsiva y consistente */}
      <Navbar />

      <main className="pt-20">

        {/* Hero Section — Incorporando TextPressure Dinámico */}
        <section style={styles.heroGradient} className="relative min-h-[600px] md:min-h-[820px] flex items-center overflow-hidden">
          <div className="max-w-7xl mx-auto px-16 grid grid-cols-1 md:grid-cols-12 gap-16 items-center relative z-10 max-md:px-6 max-md:py-16">
            
            <div className="md:col-span-8 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 mb-6">
                <span style={{ backgroundColor: tokens.secondary }} className="w-10 h-[3px] rounded-full"></span>
                <span style={{ color: tokens.secondary }} className="text-[13px] font-bold tracking-widest uppercase">
                  18-19 Noviembre 2026
                </span>
              </div>
              
              <h1 style={{ color: tokens.primary }} className="text-[48px] font-extrabold tracking-tight mb-2 leading-[1.1] max-md:text-[36px]">
                1er Congreso Internacional
              </h1>
              
              {/* Contenedor controlado para evitar desbordes del componente interactivo */}
              <div className="w-full max-w-2xl h-24 my-2 flex items-center justify-start select-none">
                <TextPressure 
                  text="ELIGE 2026"
                  fontFamily="Montserrat"
                  textColor={tokens.secondary}
                  minFontSize={36}
                  scale={false}
                />
                
              </div>

              <div className="flex flex-wrap gap-2.5 mb-8 mt-4">
                <span className="px-3.5 py-1.5 bg-[#1E2A39]/5 text-[#1E2A39] rounded-lg text-[12px] font-bold border border-[#1E2A39]/10">Emprendimiento</span>
                <span className="px-3.5 py-1.5 bg-[#8B1E23]/10 text-[#8B1E23] rounded-lg text-[12px] font-bold">Liderazgo</span>
                <span className="px-3.5 py-1.5 bg-[#8B1E23]/10 text-[#8B1E23] rounded-lg text-[12px] font-bold">Innovación</span>
                <span className="px-3.5 py-1.5 bg-[#7D7D7D]/10 text-[#7D7D7D] rounded-lg text-[12px] font-bold border border-[#7D7D7D]/20">Sostenibilidad</span>
              </div>
              
              <p className="text-base md:text-lg text-[#7D7D7D] mb-10 max-w-xl leading-relaxed font-normal">
                Un espacio internacional de transferencia tecnológica e inspiración, conectando el ecosistema de la región centro de Veracruz con el mundo.
              </p>
              
              <div className="flex flex-wrap gap-5">
                <button 
                  style={{ backgroundColor: tokens.tertiary }}
                  className="text-white text-[15px] font-bold px-10 py-4 rounded-xl shadow-lg shadow-orange-600/20 hover:brightness-110 active:scale-95 transition-all"
                >
                  Registrar Ahora
                </button>
                <button 
                  style={{ color: tokens.primary }}
                  onClick={(e) => handleSmoothScroll(e, 'schedule')} className="flex items-center gap-2 text-[15px] font-bold hover:text-[#8B1E23] transition-colors py-4"
                >
                  <span className="material-symbols-outlined text-2xl" style={styles.iconSettings}>play_circle</span>
                  Ver Programa
                </button>
              </div>
            </div>
            
            {/* Escudo Geométrico de Acento (Inspirado directamente en la estructura simétrica del logo) */}
            <div className="md:col-span-4 relative hidden md:block">
                <div className="relative w-full aspect-square rounded-3xl border border-[#1E2A39]/10 p-8 bg-white/40 backdrop-blur-sm shadow-xl">
                  <div style={{ borderColor: `${tokens.secondary}33` }} className="absolute inset-0 border rounded-3xl animate-pulse"></div>
                  <div className="w-full h-full rounded-2xl overflow-hidden flex flex-col items-center justify-center bg-gradient-to-br from-[#1E2A39] to-[#1E2A39] p-6 text-center border border-white/10 relative">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#8B1E23_1px,transparent_1px)] [background-size:16px_16px]"></div>
                    
                    {/* Iconografía de los tres pilares del logo */}
                    <span className="material-symbols-outlined text-5xl mb-4 text-[#8B1E23] animate-pulse" style={styles.iconSettings}>engineering</span>
                    <p className="text-[22px] font-extrabold tracking-tight text-white uppercase">Sinergia</p>
                    <p style={{ color: tokens.secondary }} className="text-[14px] font-bold tracking-wide uppercase mb-4">Empresarial</p>
                    
                    <div className="flex gap-2 mt-2">
                      <span className="w-2 h-2 rounded-full bg-[#8B1E23]"></span>
                      <span className="w-2 h-2 rounded-full bg-[#7D7D7D]"></span>
                      <span className="w-2 h-2 rounded-full bg-[#E6E6E6]"></span>
                    </div>
                  </div>
                </div>
            </div>
          </div>
        </section>

       {/* MAGISTRALES */}
        <section className="w-full bg-transparent pt-20 pb-12 border-t border-[#1E2A39]/5">
          <div className="max-w-7xl mx-auto px-16 max-md:px-6">
            <TabTime />
          </div>
          <div className="max-w-7xl mx-auto px-16 max-md:px-6 mt-6">
            <SpeakersMagistralesSection />
          </div>
        </section>

       {/* MAGISTRALES */}
       <section id="schedule" className="min-h-[450px] bg-[#1E2A39] text-white relative overflow-hidden flex flex-col justify-between p-4 md:p-6 border border-[#1E2A39]/10 rounded-3xl shadow-2xl">
      {/* Decoración de fondo (Glows institucionales) */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#8B1E23]/15 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[250px] h-[250px] bg-[#7D7D7D]/15 blur-[90px] rounded-full pointer-events-none" />

      {/* CONTENIDO PRINCIPAL SUPERIOR (Distribución Horizontal) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center z-10 w-full bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
        
        {/* 1. Sección ELIGE (Logo/Identidad Izquierda) */}
        <div className="lg:col-span-4 border-r border-white/10 pr-4 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[10px] bg-[#8B1E23] text-white font-extrabold px-2 py-0.5 rounded tracking-wider uppercase">
              1er Congreso Internacional
            </span>
            <span className="text-xs font-bold text-[#E6E6E6] tracking-widest">TecNM Zongolica</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-white mb-1">
            Gesti&oacute;n Empresarial <span className="text-[#8B1E23]">ELiGE</span>
          </h2>
          <p className="text-[10px] font-medium tracking-widest uppercase text-gray-300">
            Emprendimiento &bull; Liderazgo &bull; Innovaci&oacute;n
          </p>
        </div>

        {/* 2. Sección Central: Temazate Tank & Concurso de Pitch */}
        <div className="lg:col-span-5 border-r border-white/10 px-4 grid grid-cols-2 gap-4">
          {/* Temazate Tank */}
          <div className="flex flex-col justify-center border-r border-white/5 pr-2 text-center md:text-left">
            <h3 className="text-xl font-black tracking-tight text-white flex items-center gap-1">
              TEMAZATE <span className="text-[#8B1E23] font-extrabold">TANK</span>
            </h3>
            <p className="text-[10px] text-gray-400 font-mono mt-1">
              Innovar. Emprender. Transformar.
            </p>
          </div>
          
          {/* Impulso Emprendedor */}
          <div className="flex flex-col justify-center pl-2 text-center md:text-left">
            <h3 className="text-sm font-bold tracking-wider text-[#8B1E23] uppercase">
              Concurso de Pitch
            </h3>
            <h4 className="text-base font-black text-white tracking-tight">
              IMPULSO EMPRENDEDOR
            </h4>
            <p className="text-[9px] text-gray-400 mt-0.5">
              Presenta tu idea. Transforma tu futuro.
            </p>
          </div>
        </div>

        {/* 3. Sección Derecha: Proyecto Bosque Vivo */}
        <div className="lg:col-span-3 pl-4 flex flex-col justify-center">
          <div className="bg-black/20 rounded-xl p-3 border border-white/5 text-center md:text-left">
            <span className="text-[9px] font-bold text-[#E6E6E6] uppercase tracking-widest block mb-1">
              Nuestro Proyecto Destacado
            </span>
            <h4 className="text-md font-black text-white flex items-center gap-1">
              BOSQUE VIVO <span className="text-xs">🍃</span>
            </h4>
            <p className="text-[11px] text-gray-300 leading-tight mt-1">
              Restauraci&oacute;n ecol&oacute;gica con impacto social, reforestaci&oacute;n y econom&iacute;a sustentable.
            </p>
          </div>
        </div>

      </div>

      {/* BARRA INFORMATIVA INFERIOR (Footer del Banner Recreado) */}
      <div className="w-full bg-[#1E2A39]/80 border-t border-white/10 mt-6 pt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 text-center z-10">
        
        {/* Convocatoria */}
        <div className="flex flex-col justify-center items-center p-2 border-r border-white/10 last:border-0">
          <span className="material-symbols-outlined text-2xl text-[#8B1E23]" style={styles.iconSettings}>lightbulb</span>
          <h5 className="text-[11px] font-black uppercase tracking-wider text-white mt-1">¡Convocatoria Abierta!</h5>
          <p className="text-[9px] text-gray-400">Impulsa tu Emprendimiento 2026</p>
        </div>

        {/* Fecha y Hora */}
        <div className="flex flex-col justify-center items-center p-2 border-r border-white/10 last:border-0">
          <span className="material-symbols-outlined text-2xl text-[#E6E6E6]" style={styles.iconSettings}>calendar_month</span>
          <h5 className="text-[11px] font-black uppercase text-white mt-1">18 de Noviembre, 2026</h5>
          <p className="text-[9px] text-gray-400">Horario: 15:00 a 17:00 HRS</p>
        </div>

        {/* Lugar */}
        <div className="flex flex-col justify-center items-center p-2 border-r border-white/10 last:border-0">
          <span className="material-symbols-outlined text-2xl text-[#E6E6E6]" style={styles.iconSettings}>location_on</span>
          <h5 className="text-[11px] font-black uppercase text-white mt-1">Auditorio Metropolitano</h5>
          <p className="text-[9px] text-gray-400">Orizaba, Veracruz</p>
        </div>

        {/* Premios */}
        <div className="flex flex-col justify-center items-center p-2 border-r border-white/10 last:border-0">
          <span className="material-symbols-outlined text-2xl text-yellow-500" style={styles.iconSettings}>emoji_events</span>
          <h5 className="text-[11px] font-black uppercase text-white mt-1">Premios en Efectivo</h5>
          <p className="text-[9px] text-gray-300 font-semibold">1&deg; $15K MXN | 2&deg; $5K MXN</p>
        </div>

        {/* Selección Finalistas */}
        <div className="flex flex-col justify-center items-center p-2 last:border-0 col-span-2 md:col-span-1">
          <span className="material-symbols-outlined text-2xl text-red-400" style={styles.iconSettings}>crisis_alert</span>
          <h5 className="text-[11px] font-black uppercase text-white mt-1">Filtro de Finalistas</h5>
          <p className="text-[9px] text-gray-400">Cierre: 06 de Noviembre, 2026</p>
        </div>

      </div>
    </section>
        {/* CTA Section — Colores Coherentes */}
        <section className="py-24 bg-white">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div style={{ backgroundColor: '#1E2A39' }} className="animate-on-scroll p-12 rounded-3xl shadow-xl text-white relative overflow-hidden">
              <div style={{ backgroundColor: `${tokens.secondary}15` }} className="absolute -right-16 -top-16 w-48 h-48 rounded-full blur-2xl"></div>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Impulsa el desarrollo tecnológico</h2>
              <p className="text-[17px] text-[#E6E6E6] mb-10 max-w-2xl mx-auto leading-relaxed">
                Asegura tu lugar en el encuentro empresarial e institucional más robusto de 2026.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
                <button 
                  style={{ backgroundColor: tokens.tertiary }}
                  className=" text-white text-[15px] font-bold px-10 py-4 rounded-xl active:scale-95 transition-all shadow-md shadow-[#8B1E23]/30"
                  
                >
                  Registrarme Ahora
                </button>
                <button className="bg-white/10 border border-white/20 text-white text-[15px] font-bold px-10 py-4 rounded-xl hover:bg-white/20 transition-all">
                  Convocatorias
                </button>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}