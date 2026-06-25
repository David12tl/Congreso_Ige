'use client';

import React, { useEffect, useState } from 'react';
import TextPressure from '@/components/ui/TextPressure'; 
import Footer from '@/components/ui/Footer';
import TabTime from '@/components/ui/tabtime';
import Navbar from '@/components/ui/navbar';
import SpeakersMagistralesSection from '@/components/ui/SpeakersMagistralesSection';

export default function ProgramaPage() {
  const [activeTab, setActiveTab] = useState<'day1' | 'day2'>('day1');
  
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
  }, [activeTab]); // Se vuelve a ejecutar al cambiar de pestaña para asegurar transiciones limpias

  // Roles de color estrictos basados en la heráldica del Logo y especificación M3
  const tokens = {
    bg: 'bg-[#F4F7FA]',                  // Surface Bright (Gris azulado ultra claro)
    text: 'text-[#0A192F]',              // On Surface (Azul Marino de alta densidad)
    primary: '#0B2545',                  // Azul Marino Corporativo (Escudo base)
    secondary: '#00B4D8',                // Azul Turquesa / Cian (Flecha de crecimiento)
    tertiary: '#D95D26',                 // Naranja Quemado (Sinergia humana / Acción)
    variant: '#13B0C6',                  // Variante turquesa complementaria del engrane
    emerald: '#006B55',                  // Verde Esmeralda (Montañas de la región / Sostenibilidad)
    surfaceContainer: 'bg-[#EAF0F6]',    // M3 Surface Container
  };

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
      background: `radial-gradient(circle at 80% 20%, rgba(0, 180, 216, 0.08) 0%, rgba(217, 93, 38, 0.03) 40%, rgba(244, 247, 250, 0) 100%)`
    }
  };

  // Cronograma Expandido y Detallado
  const scheduleDay1 = {
    dayTitle: 'Miércoles 18 de Noviembre',
    daySubtitle: 'Emprendimiento y Sinergias Tecnológicas',
    themeColor: tokens.primary,
    items: [
      { time: '08:00 - 09:00', icon: 'how_to_reg', text: 'Registro de Participantes y Entrega de Kits', type: 'Logística', speaker: 'Comité Organizador', location: 'Lobby Principal' },
      { time: '09:00 - 09:45', icon: 'campaign', text: 'Ceremonia de Inauguración Protocolaria', type: 'Protocolo', speaker: 'Autoridades TecNM e Invitados Especiales', location: 'Auditorio Metropolitano' },
      { time: '09:45 - 11:00', icon: 'mic', text: 'Conferencia Magistral: Gestión Estratégica en la Era de la IA', type: 'Magistral', speaker: 'Speaker Internacional Invitado', location: 'Main Stage' },
      { time: '11:00 - 12:30', icon: 'diversity_3', text: 'Panel Foro: Ecosistemas de Innovación y Transferencia Tecnológica', type: 'Panel', speaker: 'Líderes de la Región Centro', location: 'Sala Beta' },
      { time: '12:30 - 14:00', icon: 'public', text: 'Mesa Redonda: Alianzas del Centro del Estado de Veracruz', type: 'Debate', speaker: 'Representantes del Sector Industrial', location: 'Sala Alfa' },
      { time: '14:00 - 15:00', icon: 'restaurant', text: 'Receso / Almuerzo Libre', type: 'Break', speaker: '', location: 'Área Común' },
      { time: '15:00 - 17:00', icon: 'devices', text: 'Expo Emprendimiento & Proyectos Científicos Colectivos', type: 'Exposición', speaker: 'Investigadores y Alumnos', location: 'Anexo de Innovación' },
      { time: '15:00 - 17:00', icon: 'lightbulb', text: 'Concurso Temazate Tank: Native Pitch - Proyectos de Impacto', type: 'Concurso', speaker: 'Emprendedores Pre-seleccionados', location: 'Auditorio Central' }
    ]
  };

  const scheduleDay2 = {
    dayTitle: 'Jueves 19 de Noviembre',
    daySubtitle: 'Desarrollo Sostenible y Competitividad',
    themeColor: tokens.tertiary,
    items: [
      { time: '08:30 - 09:30', icon: 'analytics', text: 'Conferencia Tecnológica: Data Analytics y Business Intelligence en PyMEs', type: 'Conferencia', speaker: 'Especialista de la Industria', location: 'Auditorio Metropolitano' },
      { time: '09:30 - 11:00', icon: 'psychology', text: 'Workshop Práctico: Inteligencia Artificial Aplicada a Modelos de Negocio', type: 'Taller', speaker: 'Consultores de Innovación', location: 'Laboratorio de Cómputo C' },
      { time: '11:00 - 12:30', icon: 'model_training', text: 'Estrategias de Escalabilidad de Capital y Atracción de Fondos', type: 'Conferencia', speaker: 'Inversionista Ángel & Venture Capital', location: 'Main Stage' },
      { time: '12:30 - 14:00', icon: 'workspace_premium', text: 'Mesa de Evaluación e Indexación Científica y Tecnológica (ISSN / ISBN)', type: 'Investigación', speaker: 'Cuerpo Académico Dictaminador', location: 'Sala de Juntas B' },
      { time: '14:00 - 15:00', icon: 'coffee', text: 'Café de Networking Colectivo Institucional', type: 'Break', speaker: 'Cámaras de Comercio participantes', location: 'Jardín de Encuentros' },
      { time: '15:00 - 16:30', icon: 'emoji_events', text: 'Clausura Oficial, Galardón ELiGE y Premiación Económica 2026', type: 'Clausura', speaker: 'Comité Evaluador y Directivos', location: 'Auditorio Metropolitano' }
    ]
  };

  const currentSchedule = activeTab === 'day1' ? scheduleDay1 : scheduleDay2;

  return (
    <div className={`${tokens.bg} ${tokens.text} font-['Sora'] overflow-x-hidden min-h-screen antialiased`}>
      <Navbar />

      <main className="pt-20">
        
        {/* Encabezado del Programa */}
        <section style={styles.heroGradient} className="relative py-16 flex items-center overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 md:px-16 w-full relative z-10 text-center">
            <div className="inline-flex items-center gap-2 mb-4 justify-center">
              <span style={{ backgroundColor: tokens.secondary }} className="w-10 h-[3px] rounded-full"></span>
              <span style={{ color: tokens.secondary }} className="text-[13px] font-bold tracking-widest uppercase">
                Cronograma Oficial de Actividades
              </span>
              <span style={{ backgroundColor: tokens.secondary }} className="w-10 h-[3px] rounded-full"></span>
            </div>
            
            <h1 style={{ color: tokens.primary }} className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
              Programa del Congreso
            </h1>
            <p className="text-[#4A5E78] text-sm md:text-base max-w-2xl mx-auto leading-relaxed mt-2">
              Explora las conferencias magistrales, talleres interactivos, mesas de investigación científica y el concurso de pitch estructurado para los dos días del evento.
            </p>
          </div>
        </section>
        {/* Sección Interactiva del Cronograma */}
        <section id="schedule-tabs" className="py-12 max-w-7xl mx-auto px-6 md:px-16">
          
          {/* Selectores de Día (M3 Tabs Style) */}
          <div className="flex justify-center gap-4 mb-12">
            <button
              onClick={() => setActiveTab('day1')}
              style={{
                backgroundColor: activeTab === 'day1' ? tokens.primary : 'transparent',
                color: activeTab === 'day1' ? '#white' : tokens.primary,
                borderColor: tokens.primary
              }}
              className={`px-8 py-3.5 rounded-xl font-bold text-sm tracking-wide border transition-all duration-300 flex items-center gap-2 shadow-sm ${activeTab === 'day1' ? 'text-white shadow-md scale-105' : 'bg-white/50 hover:bg-white'}`}
            >
              <span className="material-symbols-outlined text-xl" style={styles.iconSettings}>calendar_today</span>
              Día 1: 18 de Noviembre
            </button>
            <button
              onClick={() => setActiveTab('day2')}
              style={{
                backgroundColor: activeTab === 'day2' ? tokens.primary : 'transparent',
                color: activeTab === 'day2' ? '#white' : tokens.primary,
                borderColor: tokens.primary
              }}
              className={`px-8 py-3.5 rounded-xl font-bold text-sm tracking-wide border transition-all duration-300 flex items-center gap-2 shadow-sm ${activeTab === 'day2' ? 'text-white shadow-md scale-105' : 'bg-white/50 hover:bg-white'}`}
            >
              <span className="material-symbols-outlined text-xl" style={styles.iconSettings}>event</span>
              Día 2: 19 de Noviembre
            </button>
          </div>

          {/* Tarjeta de Encabezado del Día */}
          <div className="animate-on-scroll bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-slate-200 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded bg-[#0B2545]/5 text-[#0B2545]">
                {currentSchedule.dayTitle}
              </span>
              <h3 className="text-xl font-extrabold text-[#0B2545] mt-2">{currentSchedule.daySubtitle}</h3>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#5C6E85]">
              <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: currentSchedule.themeColor }}></span>
              Actividades Programadas en Tiempo Local
            </div>
          </div>

          {/* Lista del Cronograma Estilo TimeLine de Material Design */}
          <div className="space-y-4">
            {currentSchedule.items.map((item, idx) => (
              <div 
                key={idx} 
                style={styles.glassCard}
                className="animate-on-scroll rounded-2xl p-5 md:p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 grid grid-cols-1 md:grid-cols-12 gap-4 items-center group"
              >
                {/* Bloque de Hora */}
                <div className="md:col-span-2 flex items-center gap-2 md:flex-col md:items-start">
                  <span className="material-symbols-outlined text-slate-400 text-lg md:hidden" style={styles.iconSettings}>schedule</span>
                  <span className="text-sm font-black text-[#0B2545] tracking-tight whitespace-nowrap bg-slate-100 px-3 py-1 rounded-lg md:bg-transparent md:p-0">
                    {item.time}
                  </span>
                </div>

                {/* Bloque del Ícono Dinámico */}
                <div className="hidden md:flex md:col-span-1 justify-center">
                  <div 
                    style={{ backgroundColor: `${tokens.secondary}15`, color: tokens.primary }} 
                    className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                  >
                    <span className="material-symbols-outlined text-2xl" style={styles.iconSettings}>{item.icon}</span>
                  </div>
                </div>

                {/* Bloque del Título de la Actividad y Ponente */}
                <div className="md:col-span-6 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-extrabold tracking-wider uppercase bg-[#00B4D8]/10 text-[#00B4D8] px-2 py-0.5 rounded">
                      {item.type}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-[#0B2545] leading-snug group-hover:text-[#00B4D8] transition-colors">
                    {item.text}
                  </h4>
                  {item.speaker && (
                    <p className="text-xs text-[#5C6E85] font-medium mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm" style={styles.iconSettings}>person</span>
                      {item.speaker}
                    </p>
                  )}
                </div>

                {/* Bloque de Ubicación */}
                <div className="md:col-span-3 flex items-center md:justify-end gap-1.5 text-xs font-bold text-[#006B55]">
                  <span className="material-symbols-outlined text-md" style={styles.iconSettings}>location_on</span>
                  <span className="bg-[#006B55]/5 px-3 py-1.5 rounded-lg border border-[#006B55]/10 w-full md:w-auto text-center md:text-right">
                    {item.location}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Banner Horizontal Institucional Recreado */}
        <section className="max-w-7xl mx-auto px-6 md:px-16 my-16">
          <div className="min-h-[450px] bg-[#0B2545] text-white relative overflow-hidden flex flex-col justify-between p-4 md:p-6 border border-[#0B2545]/10 rounded-3xl shadow-2xl">
            {/* Decoración de fondo */}
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#00B4D8]/10 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[250px] h-[250px] bg-[#D95D26]/10 blur-[90px] rounded-full pointer-events-none" />

            {/* CONTENIDO PRINCIPAL SUPERIOR (Distribución Horizontal) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center z-10 w-full bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
              
              {/* 1. Sección ELIGE */}
              <div className="lg:col-span-4 border-r border-white/10 pr-4 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[10px] bg-[#D95D26] text-white font-extrabold px-2 py-0.5 rounded tracking-wider uppercase">
                    1er Congreso Internacional
                  </span>
                  <span className="text-xs font-bold text-[#00B4D8] tracking-widest">TecNM Zongolica</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-white mb-1">
                  Gestión Empresarial <span className="text-[#00B4D8]">ELiGE</span>
                </h2>
                <p className="text-[10px] font-medium tracking-widest uppercase text-gray-300">
                  Emprendimiento &bull; Liderazgo &bull; Innovación
                </p>
              </div>

              {/* 2. Sección Central: Temazate Tank & Concurso de Pitch */}
              <div className="lg:col-span-5 border-r border-white/10 px-4 grid grid-cols-2 gap-4">
                <div className="flex flex-col justify-center border-r border-white/5 pr-2 text-center md:text-left">
                  <h3 className="text-xl font-black tracking-tight text-white flex items-center gap-1">
                    TEMAZATE <span className="text-[#00B4D8] font-extrabold">TANK</span>
                  </h3>
                  <p className="text-[10px] text-gray-400 font-mono mt-1">
                    Innovar. Emprender. Transformar.
                  </p>
                </div>
                
                <div className="flex flex-col justify-center pl-2 text-center md:text-left">
                  <h3 className="text-sm font-bold tracking-wider text-[#D95D26] uppercase">
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
                  <span className="text-[9px] font-bold text-[#006B55] uppercase tracking-widest block mb-1">
                    Nuestro Proyecto Destacado
                  </span>
                  <h4 className="text-md font-black text-white flex items-center gap-1">
                    BOSQUE VIVO <span className="text-xs">🍃</span>
                  </h4>
                  <p className="text-[11px] text-gray-300 leading-tight mt-1">
                    Restauración ecológica con impacto social, reforestación y economía sustentable.
                  </p>
                </div>
              </div>
            </div>

            {/* BARRA INFORMATIVA INFERIOR (Footer del Banner Recreado) */}
            <div className="w-full bg-[#0B2545]/80 border-t border-white/10 mt-6 pt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 text-center z-10">
              <div className="flex flex-col justify-center items-center p-2 border-r border-white/10 last:border-0">
                <span className="material-symbols-outlined text-2xl text-[#D95D26]" style={styles.iconSettings}>lightbulb</span>
                <h5 className="text-[11px] font-black uppercase tracking-wider text-white mt-1">¡Convocatoria Abierta!</h5>
                <p className="text-[9px] text-gray-400">Impulsa tu Emprendimiento 2026</p>
              </div>

              <div className="flex flex-col justify-center items-center p-2 border-r border-white/10 last:border-0">
                <span className="material-symbols-outlined text-2xl text-[#00B4D8]" style={styles.iconSettings}>calendar_month</span>
                <h5 className="text-[11px] font-black uppercase text-white mt-1">18 de Noviembre, 2026</h5>
                <p className="text-[9px] text-gray-400">Horario: 15:00 a 17:00 HRS</p>
              </div>

              <div className="flex flex-col justify-center items-center p-2 border-r border-white/10 last:border-0">
                <span className="material-symbols-outlined text-2xl text-[#006B55]" style={styles.iconSettings}>location_on</span>
                <h5 className="text-[11px] font-black uppercase text-white mt-1">Auditorio Metropolitano</h5>
                <p className="text-[9px] text-gray-400">Orizaba, Veracruz</p>
              </div>

              <div className="flex flex-col justify-center items-center p-2 border-r border-white/10 last:border-0">
                <span className="material-symbols-outlined text-2xl text-yellow-500" style={styles.iconSettings}>emoji_events</span>
                <h5 className="text-[11px] font-black uppercase text-white mt-1">Premios en Efectivo</h5>
                <p className="text-[9px] text-gray-300 font-semibold">1&deg; $15K MXN | 2&deg; $5K MXN</p>
              </div>

              <div className="flex flex-col justify-center items-center p-2 last:border-0 col-span-2 md:col-span-1">
                <span className="material-symbols-outlined text-2xl text-red-400" style={styles.iconSettings}>crisis_alert</span>
                <h5 className="text-[11px] font-black uppercase text-white mt-1">Filtro de Finalistas</h5>
                <p className="text-[9px] text-gray-400">Cierre: 06 de Noviembre, 2026</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-24 bg-white">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="animate-on-scroll p-12 rounded-3xl shadow-xl text-white relative overflow-hidden" style={{ backgroundColor: '#0B2545' }}>
              <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full blur-2xl" style={{ backgroundColor: `${tokens.secondary}15` }}></div>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Impulsa el desarrollo tecnológico</h2>
              <p className="text-[17px] text-[#A9C2E0] mb-10 max-w-2xl mx-auto leading-relaxed">
                Asegura tu lugar en el encuentro empresarial e institucional más robusto de 2026.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
                <button 
                  style={{ backgroundColor: tokens.tertiary }}
                  className="text-white text-[15px] font-bold px-10 py-4 rounded-xl active:scale-95 transition-all shadow-md shadow-orange-950/20"
                >
                  Registrarme Ahora
                </button>
                <button className="bg-white/10 border border-white/20 text-white text-[15px] font-bold px-10 py-4 rounded-xl hover:bg-white/20 transition-all">
                  Descargar PDF
                </button>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}