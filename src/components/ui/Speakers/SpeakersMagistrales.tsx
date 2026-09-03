'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import SpeakerModal, { Speaker } from './perfil/SpeakerModal.tsx';

export default function SpeakersMagistrales() {
  const [activeTab, setActiveTab] = useState<'magistrales' | 'mesas'>('magistrales');
  const [selectedSpeakerId, setSelectedSpeakerId] = useState<number | null>(null);

  useEffect(() => {
    const linkMontserrat = document.createElement('link');
    linkMontserrat.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap';
    linkMontserrat.rel = 'stylesheet';
    document.head.appendChild(linkMontserrat);

    const linkIcons = document.createElement('link');
    linkIcons.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200';
    linkIcons.rel = 'stylesheet';
    document.head.appendChild(linkIcons);
  }, []);

  const mdGlobal = {
    onSurface: '#1A1C1E',
    onSurfaceVariant: '#43474E',
    primaryTabBg: '#D6E4FF',
    primaryTabTxt: '#001A41',
  };

  const todosLosSpeakers: Speaker[] = [
    /* ─── CONFERENCIAS MAGISTRALES ─── */
    {
      id: 1,
      nombre: "C. Carlos Vidal Neri",
      puesto: "Director y conductor del Diario TVEO",
      compania: "TVEO Canal",
      conferencia: "Emprendimiento, Innovación y Turismo para el Desarrollo de las Ciudades",
      avatarUrl: "/expocitor_1.png",
      tipo: 'magistral',
      fecha: "Día 18 de noviembre de 2026",
      hora: "10:30 a 11:30 hrs",
      lugar: "Auditorio Metropolitano",
      organiza: "Academia en Gestión Empresarial",
      bio: [
        "Desarrolló junto con Román Rodríguez Martín el proyecto TVeO, consolidado en los últimos 12 años como medio importante en la región de las Altas Montañas en Veracruz.",
        "Inició su carrera en medios de comunicación desde joven, trabajando en Láser 89 mientras estudiaba.",
        "Ha laborado en la administración municipal de Orizaba.",
        "En abril de 2026, el equipo de TVEO Canal lo felicitó por su liderazgo y dedicación."
      ],
      theme: { container: '#E8F0FE', onContainer: '#1A73E8', badgeBg: '#D2E3FC', badgeText: '#185ABC' }
    },
    {
      id: 2,
      nombre: "Jahasiel E. Sevilla Muñoz",
      puesto: "Gerente de Innovation & Digital Transformation / CDO as a Service para Latinoamérica",
      compania: "Google Cloud Consulting",
      conferencia: "Cultura Digital y Organizaciones Super Inteligentes con IA",
      avatarUrl: "/expocitor_2.png",
      tipo: 'magistral',
      fecha: "Día 19 de noviembre de 2026",
      hora: "12:00 a 14:00 hrs",
      lugar: "Auditorio Metropolitano",
      organiza: "Academia en Gestión Empresarial",
      bio: [
        "Asesor de directivos y fundadores para transformar modelos de negocio y crear experiencias de cliente innovadoras basadas en IA de última generación y tecnologías digitales.",
        "Amplia experiencia en ventas, generación de demanda, negociación, transformación digital, innovación y liderazgo tecnológico.",
        "Dirige una red integral que conecta directivos, fundadores, cámaras de comercio, instituciones académicas y actores interesados en un mundo empresarial mejor y un planeta saludable, valorando diversas perspectivas."
      ],
      theme: { container: '#E6F4EA', onContainer: '#137333', badgeBg: '#CEEAD6', badgeText: '#137333' }
    },
    {
      id: 3,
      nombre: "Marco Antonio Arroyo Carranza",
      puesto: "Director de Arroyo Mercadotecnia y Gestor Google / Especialista en Storytelling",
      compania: "Arroyo Mercadotecnia",
      conferencia: "Impacto de la IA en el Éxito de tu Empresa (Historias que conectan, estrategias que venden)",
      avatarUrl: "/expocitor_3.png",
      tipo: 'magistral',
      fecha: "Día 19 de noviembre de 2026",
      hora: "11:00 a 12:00 hrs",
      lugar: "Auditorio Metropolitano",
      organiza: "Academia en Gestión Empresarial",
      bio: [
        "Escritor, Speaker, Capacitador, Entrevistador y Mentor enfocado en el desarrollo estratégico y comercial de marcas competitivas.",
        "Licenciatura en Administración de Empresas egresado de la Universidad Cristóbal Colón.",
        "Maestría en Psicoterapia Ericksoniana por parte del Centro Ericksoniano de México.",
        "Especialista certificado en Análisis de Mercadotecnia Digital y Análisis de Redes Sociales.",
        "Apasionado por fusionar el poder de la Inteligencia Artificial con narrativas humanas persuasivas para generar un alto impacto empresarial."
      ],
      theme: { container: '#FEF7E0', onContainer: '#B06000', badgeBg: '#FFE0B2', badgeText: '#B06000' }
    },
    {
      id: 4,
      nombre: "Dr. Fausto R. López Aguilar",
      puesto: "VP del COMCE / Gerente de Relaciones Gubernamentales en Volkswagen",
      compania: "Volkswagen de México",
      conferencia: "Retos y Oportunidades que Enfrentan las Empresas Frente a los Cambios del Comercio Internacional",
      avatarUrl: "/expocitor_4.png",
      tipo: 'magistral',
      fecha: "Día 18 de noviembre de 2026",
      hora: "9:30 a 10:30 hrs",
      lugar: "Auditorio Metropolitano",
      organiza: "Academia en Gestión Empresarial",
      bio: [
        "Economista con formación en negocios internacionales y amplia trayectoria en sectores público, privado y académico.",
        "Trabajó en la Secretaría de Economía desempeñándose en áreas críticas de comercio exterior y competitividad.",
        "Destacó en Volkswagen de México por su impecable gestión en tratados internacionales y certificaciones de seguridad C-TPAT.",
        "Colaboró en Volkswagen Estados Unidos, donde estructuró y desarrolló la gerencia de aduanas.",
        "Ha fungido como docente en diversas universidades de prestigio y ha ocupado altos cargos en organismos empresariales.",
        "Frase distintiva: \"Liderazgo global, visión estratégica, impacto real.\""
      ],
      theme: { container: '#ECEFF1', onContainer: '#37474F', badgeBg: '#CFD8DC', badgeText: '#263238' }
    },
    /* ─── INTEGRANTES DE MESA REDONDA ─── */
    {
      id: 5,
      nombre: "DRA. MARÍA GRACIELA HERNÁNDEZ Y ORDUÑA",
      puesto: "Directora General",
      compania: "COVEICYDET",
      conferencia: "Ciencia, Empresa, Sociedad y Campo: Las mujeres que transforman el ecosistema emprendedor.",
      subtipo: 'MODERADOR',
      avatarUrl: "/mesa_redonda_2.jpeg",
      tipo: 'mesa_redonda',
      fecha: "Día 18 de noviembre de 2026",
      hora: "12:00 a 14:30 hrs",
      lugar: "Auditorio Metropolitano",
      organiza: "Academia en Gestión Empresarial",
      bio: [
        "Directora General de COVEICYDET / Miembro del SNII / Presidenta de la Red de Mujeres Científicas del Estado de Veracruz / Miembro del Comité de Ética en Investigación del Hospital Regional de Alta Especialidad de Veracruz.",
        "Ha sido reconocida por su liderazgo y contribuciones al desarrollo científico y tecnológico en la región.",
        "Su enfoque se centra en fomentar la participación de las mujeres en la ciencia y la innovación, promoviendo un ecosistema emprendedor inclusivo y sostenible."
      ],
      theme: { container: '#FCE8E6', onContainer: '#C5221F', badgeBg: '#FAD2CF', badgeText: '#A50E0E' }
    },
    {
      id: 6,
      nombre: "DRA. MONÍCA MARGOT RISUEÑOS SOLARTE",
      puesto: "Universidad del Cauca · Facultad de Ciencias Agrarias (Popayán, Colombia)",
      compania: "Emprendimientos Agrícolas",
      conferencia: "Mesa Redonda: Emprendimiento, Innovación y Turismo para el Desarrollo de las Ciudades",
      tipo: 'mesa_redonda',
      subtipo: 'PANELISTA',
      avatarUrl: "/mesa_redonda_3.jpg",
      theme: { container: '#F3E5F5', onContainer: '#7B1FA2', badgeBg: '#E1BEE7', badgeText: '#4A148C' }
    },
    {
      id: 7,
      nombre: "Panelista 3",
      puesto: "Especialista Invitada",
      compania: "Ecosistema Emprendedor",
      conferencia: "Mesa Redonda: Emprendimiento, Innovación y Turismo para el Desarrollo de las Ciudades",
      tipo: 'mesa_redonda',
      subtipo: 'PANELISTA',
      avatarUrl: "/mesa_redonda.png",
      theme: { container: '#E8F0FE', onContainer: '#1A73E8', badgeBg: '#D2E3FC', badgeText: '#185ABC' }
    },
    {
      id: 8,
      nombre: "Panelista 4",
      puesto: "Especialista Invitada",
      compania: "Ecosistema Emprendedor",
      tipo: 'mesa_redonda',
      subtipo: 'PANELISTA',
      avatarUrl: "/mesa_redonda_1.png",
      theme: { container: '#E6F4EA', onContainer: '#137333', badgeBg: '#CEEAD6', badgeText: '#137333' }
    },
    {
      id: 9,
      nombre: "Panelista 5",
      puesto: "Especialista Invitada",
      compania: "Ecosistema Emprendedor",
      tipo: 'mesa_redonda',
      subtipo: 'PANELISTA',
      avatarUrl: "/mesa_redonda_1.png",
      theme: { container: '#FEF7E0', onContainer: '#B06000', badgeBg: '#FFE0B2', badgeText: '#B06000' }
    }
  ];

  const speakersFiltrados = todosLosSpeakers.filter(speaker => 
    activeTab === 'magistrales' ? speaker.tipo === 'magistral' : speaker.tipo === 'mesa_redonda'
  );

  const currentSelectedSpeaker = todosLosSpeakers.find(s => s.id === selectedSpeakerId) || null;

  return (
    <section className="w-full bg-white py-20 px-4 md:px-12 relative font-['Montserrat',sans-serif]">
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* ENCABEZADO DE LA SECCIÓN */}
        <div className="text-center max-w-2xl mx-auto mb-12 animate-[fadeIn_0.6s_ease-out]">
          <span className="inline-block text-xs font-semibold px-4 py-1.5 rounded-full mb-4 tracking-wide bg-[#E8F0FE] text-[#1A73E8] transition-all duration-300">
            1er Congreso ELIGE 2026
          </span>
          <h3 style={{ color: mdGlobal.onSurface }} className="text-3xl md:text-4xl font-semibold tracking-tight mb-3">
            Ponentes y Expertos
          </h3>
          <p style={{ color: mdGlobal.onSurfaceVariant }} className="text-sm md:text-base leading-relaxed font-normal">
            Líderes globales y visionarios comparten su experiencia en la gestión empresarial bajo entornos dinámicos de colaboración.
          </p>
        </div>

        {/* SELECTORES DE PESTAÑA */}
        <div className="flex justify-center mb-14">
          <div className="inline-flex bg-[#F1F3F4] p-1.5 rounded-full border border-slate-200">
            <button
              onClick={() => setActiveTab('magistrales')}
              style={{
                backgroundColor: activeTab === 'magistrales' ? mdGlobal.primaryTabBg : 'transparent',
                color: activeTab === 'magistrales' ? mdGlobal.primaryTabTxt : mdGlobal.onSurfaceVariant,
              }}
              className="px-6 py-2.5 rounded-full font-medium text-sm transition-all duration-300 flex items-center gap-2 active:scale-95"
            >
              <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: `'FILL' ${activeTab === 'magistrales' ? 1 : 0}` }}>stars</span>
              Conferencias Magistrales
            </button>
            <button
              onClick={() => setActiveTab('mesas')}
              style={{
                backgroundColor: activeTab === 'mesas' ? mdGlobal.primaryTabBg : 'transparent',
                color: activeTab === 'mesas' ? mdGlobal.primaryTabTxt : mdGlobal.onSurfaceVariant,
              }}
              className="px-6 py-2.5 rounded-full font-medium text-sm transition-all duration-300 flex items-center gap-2 active:scale-95"
            >
              <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: `'FILL' ${activeTab === 'mesas' ? 1 : 0}` }}>groups</span>
              Mesa Redonda
            </button>
          </div>
        </div>

        {/* ENCABEZADO DE SUB-SECCIÓN */}
        <div className="mb-6 flex justify-between items-center px-2">
          <h5 style={{ color: mdGlobal.onSurfaceVariant }} className="text-xs font-semibold tracking-wider uppercase">
            {activeTab === 'magistrales' ? 'Lineup Principal' : 'Paneles Integrados'}
          </h5>
          <span className="text-[11px] font-medium px-3 py-1 rounded-full bg-[#F1F3F4] text-slate-700">
            {speakersFiltrados.length} Asignados
          </span>
        </div>

        {/* REJILLA DE TARJETAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {speakersFiltrados.map((speaker) => (
            <div
              key={speaker.id}
              style={{ borderColor: speaker.theme.badgeBg }}
              className="group bg-white border rounded-[32px] p-5 flex flex-col justify-between transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-2 hover:shadow-xl hover:border-transparent"
            >
              <div>
                <div className="mb-4">
                  <span 
                    style={{ backgroundColor: speaker.theme.badgeBg, color: speaker.theme.badgeText }} 
                    className="inline-block text-[11px] font-bold px-3 py-1 rounded-full tracking-wide transition-colors duration-300"
                  >
                    {speaker.tipo === 'magistral' ? 'Keynote Speaker' : speaker.subtipo}
                  </span>
                </div>

                <div 
                  style={{ backgroundColor: speaker.theme.container }} 
                  className="w-full h-64 rounded-[24px] flex flex-col items-center justify-center mb-5 relative overflow-hidden border border-white/40 shadow-inner"
                >
                  {speaker.avatarUrl ? (
                    <Image
                      src={speaker.avatarUrl}
                      alt={speaker.nombre}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                    />
                  ) : (
                    <span 
                      style={{ color: speaker.theme.onContainer }} 
                      className="text-3xl font-bold tracking-wider opacity-50 group-hover:scale-110 transition-transform duration-500"
                    >
                      {speaker.nombre.split(' ').filter(Boolean).map(n => n[0]).join('').substring(0, 3).toUpperCase()}
                    </span>
                  )}
                </div>

                <h4 style={{ color: mdGlobal.onSurface }} className="text-lg font-bold tracking-tight mb-1 leading-snug group-hover:text-black transition-colors duration-200">
                  {speaker.nombre}
                </h4>
                <p style={{ color: mdGlobal.onSurfaceVariant }} className="text-xs mb-4 font-normal leading-relaxed">
                  {speaker.puesto} — <span style={{ color: speaker.theme.onContainer }} className="font-bold">{speaker.compania}</span>
                </p>

                {speaker.conferencia && (
                  <div 
                    style={{ backgroundColor: speaker.theme.container }} 
                    className="p-4 rounded-[20px] border border-transparent group-hover:shadow-sm transition-all duration-300"
                  >
                    <p style={{ color: mdGlobal.onSurface }} className="text-xs leading-relaxed font-medium line-clamp-3">
                      &quot;{speaker.conferencia}&quot;
                    </p>
                  </div>
                )}
              </div>

              {/* Llamada al ID mediante la propiedad onClick */}
              <div className="mt-5 pt-3 flex justify-between items-center border-t border-slate-100">
                <span style={{ color: mdGlobal.onSurfaceVariant }} className="text-[11px] font-mono opacity-60">
                  ID: 00{speaker.id}
                </span>
                <button 
                  onClick={() => setSelectedSpeakerId(speaker.id)}
                  style={{ color: speaker.theme.onContainer }} 
                  className="text-xs font-bold tracking-wide flex items-center gap-1 py-1.5 px-4 rounded-full bg-transparent group-hover:bg-slate-50 transition-all duration-300"
                >
                  Ver Perfil
                  <span className="material-symbols-outlined text-sm transition-transform duration-300 group-hover:translate-x-1">
                    arrow_forward
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* MODAL EXTERNALIZADO */}
      <SpeakerModal 
        speaker={currentSelectedSpeaker} 
        onClose={() => setSelectedSpeakerId(null)} 
      />
    </section>
  );
}