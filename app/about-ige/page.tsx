'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../../src/components/ui/navbar';
import Footer from '../../src/components/ui/Footer';

/* ═══════════════════════════════════════════════════════════════
   DATOS — Perfil de Ingreso (16 puntos)
   ═══════════════════════════════════════════════════════════════ */
const perfilIngreso = [
  {
    num: '01',
    keyword: 'Capacidad de análisis',
    desc: 'Habilidad para descomponer problemas complejos en partes manejables, identificar patrones y extraer conclusiones fundamentadas que impulsin la toma de decisiones estratégicas.',
  },
  {
    num: '02',
    keyword: 'Comunicación efectiva',
    desc: 'Destreza para expresar ideas con claridad y persuasión tanto en forma oral como escrita, facilitando la negociación, el liderazgo y la colaboración multidisciplinaria.',
  },
  {
    num: '03',
    keyword: 'Pensamiento innovador',
    desc: 'Interés genuino por la creatividad y la mejora continua, con la capacidad de proponer soluciones originales que transformen procesos, productos y modelos de negocio.',
  },
  {
    num: '04',
    keyword: 'Juicio crítico',
    desc: 'Actitud reflexiva que permite evaluar información desde múltiples perspectivas, cuestionar supuestos y tomar posturas fundamentadas ante los retos empresariales.',
  },
  {
    num: '05',
    keyword: 'Trabajo colaborativo',
    desc: 'Aptitud para integrarse en equipos multidisciplinarios, aportando desde la escucha activa y la empatía hasta la coordinación eficiente de esfuerzos colectivos.',
  },
  {
    num: '06',
    keyword: 'Vocación tecnológica',
    desc: 'Fascinación por las herramientas digitales y los sistemas de información, con disposición para aprovecharlos como palancas de productividad y ventaja competitiva.',
  },
  {
    num: '07',
    keyword: 'Liderazgo transformador',
    desc: 'Capacidad de inspirar, guiar y potenciar el talento de otros, fomentando un entorno de confianza, accountability y visión compartida hacia metas ambiciosas.',
  },
  {
    num: '08',
    keyword: 'Responsabilidad social',
    desc: 'Conciencia del impacto ético, social y ambiental de las decisiones empresariales, con un compromiso firme hacia la sostenibilidad y el desarrollo comunitario.',
  },
  {
    num: '09',
    keyword: 'Toma de decisiones',
    desc: 'Seguridad para evaluar riesgos, ponderar alternativas y actuar con determinación bajo incertidumbre, respaldado por datos y criterios técnicos sólidos.',
  },
  {
    num: '10',
    keyword: 'Inteligencia interpersonal',
    desc: 'Facilidad para establecer y mantener relaciones profesionales genuinas, manejar conflictos con diplomacia y construir redes de colaboración de alto valor.',
  },
  {
    num: '11',
    keyword: 'Aprendizaje autónomo',
    desc: 'Curiosidad intelectual permanente y disciplina para actualizarse de forma continua, dominando nuevas metodologías, regulaciones y tendencias del entorno global.',
  },
  {
    num: '12',
    keyword: 'Visión estratégica',
    desc: 'Capacidad de anticipar escenarios futuros, identificar oportunidades de negocio y diseñar rutas de acción que alineen los recursos con los objetivos organizacionales.',
  },
  {
    num: '13',
    keyword: 'Adaptabilidad',
    desc: 'Flexibilidad para navegar entornos volátiles, reconfigurar prioridades y aprender de la adversidad, manteniendo la efectividad ante cambios disruptivos.',
  },
  {
    num: '14',
    keyword: 'Planeación metódica',
    desc: 'Habilidad para estructurar proyectos, definir hitos, asignar recursos y monitorear avances con rigor, asegurando la ejecución ordenada de iniciativas complejas.',
  },
  {
    num: '15',
    keyword: 'Iniciativa emprendedora',
    desc: 'Actitud proactiva para detectar necesidades insatisfechas en el mercado, diseñar propuestas de valor viables y materializar ideas en proyectos productivos.',
  },
  {
    num: '16',
    keyword: 'Gestión con calidad',
    desc: 'Orientación a la excelencia operativa mediante la implementación de sistemas de gestión, control estadístico y mejora continua en todos los niveles organizacionales.',
  },
];

/* ═══════════════════════════════════════════════════════════════
   DATOS — Campo Laboral (7 áreas)
   ═══════════════════════════════════════════════════════════════ */
const campoLaboral = [
  {
    area: 'Consultoría Empresarial',
    desc: 'Asesorar a organizaciones públicas y privadas en diagnóstico organizacional, planeación estratégica, reingeniería de procesos y optimización de recursos. El egresado IGE puede integrarse en firmas consultoras o ejercer como consultor independiente, ayudando a las empresas a elevar su competitividad y sostenibilidad en el mercado.',
    icon: 'chat_info',
    badgeColor: 'text-[#1E2A39] bg-[#1E2A39]/10'
  },
  {
    area: 'Gestión de Proyectos',
    desc: 'Planear, ejecutar y controlar proyectos de inversión, desarrollo organizacional y mejora continua aplicando metodologías como PMI, Scrum o Lean Six Sigma. El profesional IGE lidera equipos multidisciplinarios, gestiona presupuestos, cronogramas y riesgos, asegurando la entrega de resultados en tiempo, costo y calidad.',
    icon: 'assignment',
    badgeColor: 'text-[#8B1E23] bg-[#8B1E23]/10'
  },
  {
    area: 'Logística y Cadena de Suministro',
    desc: 'Diseñar y administrar redes de suministro, almacenes, inventarios y sistemas de distribución nacional e internacional. Con competencias en negociación, comercio exterior y tecnologías logísticas, el IGE optimiza flujos de materiales e información para reducir costos y maximizar la eficiencia operativa.',
    icon: 'local_shipping',
    badgeColor: 'text-[#8B1E23] bg-[#8B1E23]/10'
  },
  {
    area: 'Emprendimiento e Incubación',
    desc: 'Crear y gestionar su propia empresa o incubar proyectos innovadores dentro de corporativos (intraemprendimiento). El IGE desarrolla modelos de negocio, estudios de factibilidad, planes de marketing y estrategias de financiamiento, contribuyendo al ecosistema emprendedor regional con sentido de responsabilidad social.',
    icon: 'lightbulb',
    badgeColor: 'text-[#1E2A39] bg-[#1E2A39]/10'
  },
  {
    area: 'Recursos Humanos',
    desc: 'Diseñar e implementar estrategias de capital humano: reclutamiento, capacitación, evaluación del desempeño, clima organizacional y administración de compensaciones. El egresado promueve una cultura organizacional inclusiva, productiva y alineada con los objetivos estratégicos de la empresa.',
    icon: 'groups',
    badgeColor: 'text-[#1E2A39] bg-[#1E2A39]/10'
  },
  {
    area: 'Gestión de la Calidad',
    desc: 'Implementar y auditar sistemas de gestión de calidad bajo normas ISO 9001, ISO 14001 y otros estándares internacionales. El IGE en calidad aplica herramientas estadísticas, círculos de mejora y metodologías Six Sigma para garantizar productos y servicios que superen las expectativas del cliente.',
    icon: 'verified',
    badgeColor: 'text-[#8B1E23] bg-[#8B1E23]/10'
  },
  {
    area: 'Tecnologías de la Información',
    desc: 'Integrar soluciones tecnológicas en los procesos de negocio: ERP, CRM, business intelligence, comercio electrónico y transformación digital. El IGE funge como puente entre el área técnica y la dirección general, traduciendo necesidades del negocio en requerimientos tecnológicos viables y rentables.',
    icon: 'developer_board',
    badgeColor: 'text-[#1E2A39] bg-[#1E2A39]/10'
  },
];

/* ═══════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL REDISEÑADO (LÍNEA CLARA)
   ═══════════════════════════════════════════════════════════════ */
export default function AboutIGEPage() {
  
  useEffect(() => {
    // Inyección dinámica de tipografía Montserrat y Material Symbols
    const linkMontserrat = document.createElement('link');
    linkMontserrat.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&display=swap';
    linkMontserrat.rel = 'stylesheet';
    document.head.appendChild(linkMontserrat);

    const linkIcons = document.createElement('link');
    linkIcons.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
    linkIcons.rel = 'stylesheet';
    document.head.appendChild(linkIcons);

    // Observer para animaciones de entrada fluidas en scroll
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

    return () => observer.disconnect();
  }, []);

  const styles = {
    iconSettings: {
      fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"
    }
  };

  return (
    <div className="bg-white text-[#1E2A39] font-['Montserrat'] overflow-x-hidden min-h-screen antialiased selection:bg-[#8B1E23] selection:text-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 md:px-16 py-20">
        
        {/* ─── Botón de Regreso Estilo M3 Clear ─── */}
        <div className="mb-12 animate-on-scroll">
          <Link
            href="/"
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white border border-[#E6E6E6] text-[#1E2A39] hover:bg-[#E6E6E6] hover:border-[#7D7D7D] transition-all duration-300 shadow-sm text-sm font-semibold group active:scale-95"
          >
            <span className="transform group-hover:-translate-x-1 transition-transform duration-200">
              ←
            </span>
            Regresar al Inicio
          </Link>
        </div>

        {/* ═══════════════════════════════════════════════════════
            CABECERA PRINCIPAL
           ═══════════════════════════════════════════════════════ */}
        <header className="mb-20 animate-on-scroll">
          <span className="text-[#8B1E23] text-xs font-bold uppercase tracking-[0.25em] block mb-4">
            —— ITSZ · FUNDADA EN 2009
          </span>
          <h1 className="text-4xl md:text-[56px] font-extrabold mb-6 tracking-tighter text-[#1E2A39] leading-tight">
            Ingeniería en Gestión <br className="hidden md:inline" />
            <span className="text-[#8B1E23]">Empresarial</span>
          </h1>
          <p className="text-base md:text-xl text-[#7D7D7D] max-w-3xl leading-relaxed font-normal">
            Perfil Profesional y Oportunidades Globales — Formamos líderes con visión estratégica, conciencia social y dominio tecnológico para transformar de manera sostenible el entorno corporativo global.
          </p>
        </header>

        {/* ═══════════════════════════════════════════════════════
            SECCIÓN 1: PERFIL DE INGRESO
           ═══════════════════════════════════════════════════════ */}
        <section className="mb-28">
          {/* Encabezado de sección */}
          <div className="flex items-center gap-4 mb-12 animate-on-scroll">
            <div className="w-12 h-[2px] bg-[#8B1E23]" />
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#1E2A39]">
              Perfil de Ingreso
            </h2>
            <div className="flex-1 h-[1px] bg-[#E6E6E6]" />
          </div>

          {/* Grid de 16 micro-tarjetas Bento-Clean */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {perfilIngreso.map((item) => (
              <div
                key={item.num}
                className="animate-on-scroll bg-white border border-[#E6E6E6] p-6 rounded-xl shadow-sm transition-all duration-300 hover:scale-[1.02] hover:border-[#8B1E23] hover:shadow-lg hover:shadow-[#8B1E23]/5 relative group flex flex-col justify-between"
              >
                {/* Número secuencial limpio y refinado */}
                <span className="absolute top-4 right-5 text-4xl font-extrabold leading-none text-[#8B1E23]/20 select-none group-hover:text-[#8B1E23]/40 transition-colors">
                  {item.num}
                </span>

                {/* Contenido */}
                <div>
                  <h3 className="text-base font-bold text-[#1E2A39] mb-3 pr-14 tracking-tight">
                    {item.keyword}
                  </h3>
                  <p className="text-sm text-[#7D7D7D] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Nota decorativa al final */}
          <p className="text-xs text-[#7D7D7D] text-center mt-12 font-semibold uppercase tracking-widest">
            [ 16 competencias clave para el éxito profesional ]
          </p>
        </section>

        {/* ═══════════════════════════════════════════════════════
            SECCIÓN 2: CAMPO LABORAL
           ═══════════════════════════════════════════════════════ */}
        <section className="mb-12">
          {/* Encabezado de sección */}
          <div className="flex items-center gap-4 mb-12 animate-on-scroll">
            <div className="w-12 h-[2px] bg-[#8B1E23]" />
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#1E2A39]">
              Campo Laboral
            </h2>
            <div className="flex-1 h-[1px] bg-[#E6E6E6]" />
          </div>

          <p className="text-[#7D7D7D] text-base md:text-lg mb-12 max-w-3xl leading-relaxed animate-on-scroll">
            El egresado de Ingeniería en Gestión Empresarial posee un perfil multidisciplinario que le permite insertarse estratégicamente en los sectores público, privado y social, así como liderar su propia unidad productiva hacia mercados internacionales:
          </p>

          {/* Grid de 7 tarjetas de Campo Laboral */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {campoLaboral.map((item, idx) => (
              <div
                key={idx}
                className="animate-on-scroll bg-white border border-[#E6E6E6] rounded-xl overflow-hidden shadow-sm transition-all duration-300 hover:scale-[1.01] hover:border-[#8B1E23] hover:shadow-xl hover:shadow-[#8B1E23]/5 flex flex-col group"
              >
                {/* Cabecera limpia de tarjeta */}
                <div className="px-6 py-5 bg-[#E6E6E6] border-b border-[#E6E6E6] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white border border-[#E6E6E6] flex items-center justify-center text-[#8B1E23] group-hover:bg-[#8B1E23] group-hover:text-white group-hover:border-transparent transition-all duration-300">
                      <span className="material-symbols-outlined text-xl" style={styles.iconSettings}>
                        {item.icon}
                      </span>
                    </div>
                    <h3 className="text-base md:text-lg font-bold text-[#1E2A39] tracking-tight">
                      {item.area}
                    </h3>
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wide border border-[#E6E6E6]/30 ${item.badgeColor}`}>
                    Área Activa
                  </span>
                </div>

                {/* Cuerpo de la tarjeta */}
                <div className="p-6 flex-1 bg-white">
                  <p className="text-[#7D7D7D] text-sm md:text-base leading-relaxed text-justify">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Cierre decorativo e Indicador Estadístico */}
          <div className="mt-16 text-center animate-on-scroll">
            <div className="inline-flex items-center gap-3 px-6 py-3.5 rounded-full bg-[#E6E6E6] border border-[#E6E6E6] text-xs md:text-sm text-[#1E2A39] font-semibold tracking-wide">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8B1E23] animate-pulse" />
              Tasa de inserción laboral certificada superior al 85 % en el primer año académico.
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}