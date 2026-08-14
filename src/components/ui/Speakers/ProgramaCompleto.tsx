'use client';

import React, { useState, useEffect } from 'react';

interface Actividad {
  hora: string;
  tipo: 'conferencia' | 'mesa_expertas';
  titulo: string;
  subtitulo?: string;
  ponente: string;
  cargo: string;
}

interface DiaPrograma {
  id: number;
  nombre: string;
  fecha: string;
  actividades: Actividad[];
}

export default function ProgramaCompleto() {
  const [diaActivo, setDiaActivo] = useState<number>(1);

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

  const programa: DiaPrograma[] = [
    {
      id: 1,
      nombre: "Día 1",
      fecha: "Martes 18 de Noviembre de 2026",
      actividades: [
        {
          hora: "09:30 – 10:30",
          tipo: "conferencia",
          titulo: "Retos y Oportunidades que Enfrentan las Empresas Frente a los Cambios del Comercio Internacional",
          ponente: "Dr. Fausto R. López Aguilar",
          cargo: "Vicepresidente del Consejo Empresarial Mexicano de Comercio Exterior, Inversión y Tecnología (COMCE) / Gerente de Relaciones Gubernamentales en Volkswagen"
        },
        {
          hora: "10:30 – 11:30",
          tipo: "conferencia",
          titulo: "Emprendimiento, Innovación y Turismo para el Desarrollo de las Ciudades",
          ponente: "C. Carlos Vidal Neri",
          cargo: "Director y conductor de TVEO Canal. Desarrolló el proyecto TVeO en la región de las Altas Montañas, Veracruz. Ha trabajado en administración municipal de Orizaba."
        },
        {
          hora: "12:00 – 14:30",
          tipo: "mesa_expertas",
          titulo: "Ciencia, Empresa, Sociedad y Campo: Las Mujeres que Transforman el Ecosistema Emprendedor",
          ponente: "Dra. María Graciela Hernández y Orduña",
          cargo: "Directora General de COVEICYDET / Miembro del SNII / Presidenta de la Alianza de Mujeres Líderes Emprendedoras y Empresarias A.C. / Directora General de CECATTO Publicidad"
        }
      ]
    },
    {
      id: 2,
      nombre: "Día 2",
      fecha: "Miércoles 19 de Noviembre de 2026",
      actividades: [
        {
          hora: "11:00 – 12:00",
          tipo: "conferencia",
          titulo: "Impacto de la IA en el Éxito de tu Empresa",
          subtitulo: "Historias que conectan, estrategias que venden",
          ponente: "Marco Antonio Arroyo Carranza",
          cargo: "Asesor de Marketing / Especialista en Storytelling / Escritor, Speaker, Capacitador, Mentor / Director de Arroyo Mercadotecnia y Gestor Google. Lic. en Administración de Empresas (UCC), Maestría en Psicoterapia Ericksoniana."
        },
        {
          hora: "12:00 – 14:00",
          tipo: "conferencia",
          titulo: "Cultura Digital y Organizaciones Super Inteligentes con IA",
          ponente: "Jahasiel E. Sevilla Muñoz",
          cargo: "Gerente de Innovation & Digital Transformation @ Google Cloud Consulting / CDO as a Service para Latinoamérica. Asesor de directivos y fundadores en transformación digital e IA."
        }
      ]
    }
  ];

  const diaSeleccionado = programa.find(d => d.id === diaActivo) || programa[0];

  return (
    // Agregamos aislamiento de contexto de bloque claro y desborde controlado
    <section className="relative w-full bg-[#E6E6E6] block clear-both pt-24 pb-20 px-4 md:px-12 font-['Montserrat',sans-serif] z-10">
      <div className="max-w-5xl mx-auto relative z-20">
        
        {/* ENCABEZADO PRINCIPAL RE-ESTRUCTURADO */}
        <div className="text-center max-w-3xl mx-auto mb-14 pt-6">
          <span className="inline-block text-xs font-bold px-4 py-1.5 rounded-full mb-4 tracking-wide bg-blue-100 text-[#1A73E8]">
            Programa Oficial — ELIGE 2026
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#1E2A39] mb-4 block">
            Cronograma de Actividades
          </h2>
          <p className="text-sm md:text-base text-slate-600 leading-relaxed font-normal max-w-2xl mx-auto">
            &quot;Un espacio internacional de aprendizaje, inspiración y conexión para transformar ideas en soluciones que generen valor y desarrollo sostenible.&quot;
          </p>
        </div>

        {/* SELECTORES DE DÍA */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-slate-200/80 p-1.5 rounded-[28px] border border-slate-300/50 shadow-sm z-20 relative">
            {programa.map((dia) => (
              <button
                key={dia.id}
                onClick={() => setDiaActivo(dia.id)}
                className={`px-8 py-3 rounded-[24px] font-semibold text-sm transition-all duration-300 flex flex-col items-center min-w-[160px] ${
                  diaActivo === dia.id 
                    ? 'bg-[#D6E4FF] text-[#001A41] shadow-md' 
                    : 'text-slate-700 hover:bg-slate-300'
                }`}
              >
                <span>{dia.nombre}</span>
                <span className="text-[10px] font-normal opacity-70 mt-0.5">
                  {dia.id === 1 ? '18 Nov' : '19 Nov'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* DETALLE DEL DÍA SELECCIONADO */}
        <div className="text-center mb-12">
          <h3 className="text-base md:text-lg font-bold text-[#8B1E23] tracking-wide inline-flex items-center gap-2 bg-white px-5 py-2 rounded-full border border-slate-200 shadow-sm">
            <span className="material-symbols-outlined text-xl">calendar_today</span>
            {diaSeleccionado.fecha}
          </h3>
        </div>

        {/* LÍNEA DE TIEMPO INTERACTIVA */}
        <div className="relative border-l-2 border-[#D6E4FF] ml-4 md:ml-36 space-y-8 pb-4">
          {diaSeleccionado.actividades.map((actividad, index) => {
            const esMesa = actividad.tipo === 'mesa_expertas';
            return (
              <div key={index} className="relative pl-6 md:pl-10 group">
                
                {/* Hora Flotante */}
                <div className="hidden md:block absolute right-full mr-10 top-1 text-right min-w-[120px]">
                  <p className="text-sm font-bold text-[#1E2A39]">{actividad.hora}</p>
                  <p className="text-[11px] text-slate-500 font-medium">hrs</p>
                </div>

                {/* Nodo */}
                <span className={`absolute -left-[11px] top-1.5 w-5 h-5 rounded-full border-4 border-slate-50 flex items-center justify-center transition-all duration-300 group-hover:scale-125 ${
                  esMesa ? 'bg-[#9C27B0]' : 'bg-[#1A73E8]'
                }`} />

                {/* Tarjeta de Actividad */}
                <div className="bg-white border border-slate-200 rounded-[24px] p-5 md:p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-slate-300">
                  
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="md:hidden inline-flex items-center gap-1 text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                      <span className="material-symbols-outlined text-sm">schedule</span>
                      {actividad.hora} hrs
                    </span>
                    <span className={`text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-lg ${
                      esMesa ? 'bg-[#F3E5F5] text-[#7B1FA2]' : 'bg-[#E8F0FE] text-[#1A73E8]'
                    }`}>
                      {esMesa ? 'Mesa de Expertas' : 'Conferencia'}
                    </span>
                  </div>

                  <h4 className="text-base md:text-xl font-bold text-[#1E2A39] tracking-tight mb-1 group-hover:text-[#8B1E23] transition-colors">
                    &#34;{actividad.titulo}&#34;
                  </h4>

                  {actividad.subtitulo && (
                    <p className="text-xs md:text-sm text-slate-500 font-medium italic mb-3">
                      Subtítulo: &quot;{actividad.subtitulo}&quot;
                    </p>
                  )}

                  <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-start gap-3">
                    <div className={`p-2 rounded-xl flex-shrink-0 ${esMesa ? 'bg-[#F3E5F5]' : 'bg-[#E8F0FE]'}`}>
                      <span className={`material-symbols-outlined text-xl block ${esMesa ? 'text-[#7B1FA2]' : 'text-[#1A73E8]'}`}>
                        {esMesa ? 'groups' : 'record_voice_over'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#1E2A39]">{actividad.ponente}</p>
                      <p className="text-xs text-slate-600 leading-relaxed mt-0.5 font-normal">
                        {actividad.cargo}
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* METADATOS Y PIE DE PÁGINA */}
        <div className="mt-16 bg-white border border-slate-200 rounded-[32px] p-6 md:p-8 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <span className="material-symbols-outlined p-2.5 bg-blue-50 text-blue-600 rounded-2xl">apartment</span>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Organiza</p>
                <p className="text-xs font-bold text-slate-700">Academia en Gestión Empresarial</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <span className="material-symbols-outlined p-2.5 bg-red-50 text-red-600 rounded-2xl">location_on</span>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Sede Oficial</p>
                <p className="text-xs font-bold text-slate-700">Auditorio Metropolitano</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-3 sm:col-span-2 md:col-span-1">
              <span className="material-symbols-outlined p-2.5 bg-purple-50 text-purple-600 rounded-2xl">local_activity</span>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Acceso</p>
                <p className="text-xs font-bold text-slate-700">1er Congreso Internacional</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-slate-100 pt-6 mt-6 text-center">
        <p className="text-[#8B1E23] text-xs font-bold uppercase tracking-[0.2em]">
          ¡Sé parte del futuro, emprende, lidera e innova!
        </p>
          </div>
        </div>

      </div>
    </section>
  );
}