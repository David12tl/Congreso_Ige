'use client';

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
    desc: 'Habilidad para descomponer problemas complejos en partes manejables, identificar patrones y extraer conclusiones fundamentadas que impulsen la toma de decisiones estratégicas.',
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
    gradient: 'from-congreso-teal/40 to-congreso-blue/20',
  },
  {
    area: 'Gestión de Proyectos',
    desc: 'Planear, ejecutar y controlar proyectos de inversión, desarrollo organizacional y mejora continua aplicando metodologías como PMI, Scrum o Lean Six Sigma. El profesional IGE lidera equipos multidisciplinarios, gestiona presupuestos, cronogramas y riesgos, asegurando la entrega de resultados en tiempo, costo y calidad.',
    gradient: 'from-congreso-blue/40 to-congreso-teal/20',
  },
  {
    area: 'Logística y Cadena de Suministro',
    desc: 'Diseñar y administrar redes de suministro, almacenes, inventarios y sistemas de distribución nacional e internacional. Con competencias en negociación, comercio exterior y tecnologías logísticas, el IGE optimiza flujos de materiales e información para reducir costos y maximizar la eficiencia operativa.',
    gradient: 'from-congreso-emerald/40 to-congreso-teal/20',
  },
  {
    area: 'Emprendimiento e Incubación',
    desc: 'Crear y gestionar su propia empresa o incubar proyectos innovadores dentro de corporativos (intraemprendimiento). El IGE desarrolla modelos de negocio, estudios de factibilidad, planes de marketing y estrategias de financiamiento, contribuyendo al ecosistema emprendedor regional con sentido de responsabilidad social.',
    gradient: 'from-congreso-orange/40 to-congreso-yellow/20',
  },
  {
    area: 'Recursos Humanos',
    desc: 'Diseñar e implementar estrategias de capital humano: reclutamiento, capacitación, evaluación del desempeño, clima organizacional y administración de compensaciones. El egresado promueve una cultura organizacional inclusiva, productiva y alineada con los objetivos estratégicos de la empresa.',
    gradient: 'from-congreso-blue/40 to-congreso-dark/20',
  },
  {
    area: 'Gestión de la Calidad',
    desc: 'Implementar y auditar sistemas de gestión de calidad bajo normas ISO 9001, ISO 14001 y otros estándares internacionales. El IGE en calidad aplica herramientas estadísticas, círculos de mejora y metodologías Six Sigma para garantizar productos y servicios que superen las expectativas del cliente.',
    gradient: 'from-congreso-teal/40 to-congreso-emerald/20',
  },
  {
    area: 'Tecnologías de la Información',
    desc: 'Integrar soluciones tecnológicas en los procesos de negocio: ERP, CRM, business intelligence, comercio electrónico y transformación digital. El IGE funge como puente entre el área técnica y la dirección general, traduciendo necesidades del negocio en requerimientos tecnológicos viables y rentables.',
    gradient: 'from-congreso-dark/40 to-congreso-blue/20',
  },
];

/* ═══════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
   ═══════════════════════════════════════════════════════════════ */
export default function AboutIGEPage() {
  return (
    <main className="relative z-10 w-full min-h-screen bg-congreso-whiteSmoke">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        {/* ─── Botón de Regreso ─── */}
        <div className="mb-10 scroll-reveal">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-congreso-teal/20 text-congreso-dark hover:bg-congreso-teal/10 hover:border-congreso-teal/40 transition-all duration-300 shadow-sm text-sm font-medium group"
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
        <header className="mb-16 md:mb-20 scroll-reveal">
          <span className="text-congreso-teal font-mono text-xs tracking-[0.25em] uppercase block mb-4">
            —— ITSZ · 2009
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight bg-gradient-to-r from-congreso-dark via-congreso-blue to-congreso-teal bg-clip-text text-transparent">
            Ingeniería en Gestión<br />
            <span className="text-congreso-dark">Empresarial</span>
          </h1>
          <p className="text-lg md:text-xl text-congreso-dark/70 max-w-2xl leading-relaxed">
            Perfil Profesional y Oportunidades Globales — Formamos líderes con
            visión estratégica, conciencia social y dominio tecnológico para
            transformar el mundo empresarial del siglo XXI.
          </p>
        </header>

        {/* ═══════════════════════════════════════════════════════
            SECCIÓN 1: PERFIL DE INGRESO
           ═══════════════════════════════════════════════════════ */}
        <section className="mb-20 md:mb-28 scroll-reveal">
          {/* Encabezado de sección */}
          <div className="flex items-center gap-4 mb-10">
            <div className="w-10 h-[2px] bg-gradient-to-r from-congreso-teal to-transparent" />
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-congreso-dark">
              Perfil de Ingreso
            </h2>
            <div className="flex-1 h-[2px] bg-gradient-to-l from-congreso-teal/30 to-transparent" />
          </div>

          {/* Grid de 16 micro-tarjetas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {perfilIngreso.map((item) => (
              <div
                key={item.num}
                className="bg-white border border-congreso-teal/10 p-5 rounded-2xl shadow-md transition-all duration-300 hover:scale-[1.02] hover:border-congreso-teal/30 hover:shadow-congreso-teal/10 scroll-reveal relative group"
              >
                {/* Número secuencial brillante */}
                <span className="absolute top-3 right-4 text-3xl md:text-4xl font-black leading-none bg-gradient-to-b from-congreso-teal/40 to-transparent bg-clip-text text-transparent select-none">
                  {item.num}
                </span>

                {/* Contenido */}
                <h3 className="text-base font-bold text-congreso-dark mb-2 pr-12">
                  {item.keyword}
                </h3>
                <p className="text-sm text-congreso-dark/60 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Nota decorativa al final */}
          <p className="text-xs text-congreso-dark/40 text-center mt-10 font-mono tracking-wide">
            [ 16 competencias clave para el éxito profesional ]
          </p>
        </section>

        {/* ═══════════════════════════════════════════════════════
            SECCIÓN 2: CAMPO LABORAL
           ═══════════════════════════════════════════════════════ */}
        <section className="scroll-reveal">
          {/* Encabezado de sección */}
          <div className="flex items-center gap-4 mb-10">
            <div className="w-10 h-[2px] bg-gradient-to-r from-congreso-teal to-transparent" />
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-congreso-dark">
              📍 Campo Laboral
            </h2>
            <div className="flex-1 h-[2px] bg-gradient-to-l from-congreso-teal/30 to-transparent" />
          </div>

          <p className="text-congreso-dark/70 text-base md:text-lg mb-10 max-w-3xl leading-relaxed">
            El egresado de Ingeniería en Gestión Empresarial posee un perfil
            multidisciplinario que le permite insertarse en los sectores público,
            privado y social, así como emprender su propia unidad productiva.
            Estas son las siete áreas estratégicas con mayor proyección:
          </p>

          {/* Grid de 7 tarjetas laborales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            {campoLaboral.map((item, idx) => (
              <div
                key={idx}
                className="bg-white border border-congreso-teal/10 rounded-2xl overflow-hidden shadow-md transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_0_50px_-12px_rgba(0,151,167,0.15)] scroll-reveal group"
              >
                {/* Banner superior con gradiente */}
                <div
                  className={`bg-gradient-to-r ${item.gradient} px-6 py-4 border-b border-congreso-teal/10`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-congreso-teal animate-pulse" />
                    <h3 className="text-lg md:text-xl font-bold text-congreso-dark">
                      {item.area}
                    </h3>
                  </div>
                </div>

                {/* Cuerpo de la tarjeta */}
                <div className="p-6">
                  <p className="text-congreso-dark/80 text-sm md:text-base text-justify leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Cierre decorativo */}
          <div className="mt-14 text-center scroll-reveal">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white border border-congreso-emerald/20 text-sm text-congreso-dark/70 font-mono">
              <span className="w-2 h-2 rounded-full bg-congreso-emerald animate-pulse" />
              Tasa de inserción laboral superior al 85 % en el primer año
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <Footer />
    </main>
  );
}