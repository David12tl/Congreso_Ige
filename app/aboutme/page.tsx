'use client';

import Image from 'next/image';
import Link from 'next/link';
import Navbar from '../../src/components/ui/navbar';
import Footer from '../../src/components/ui/Footer';
import dynamic from 'next/dynamic';

const AuroraBackground = dynamic(
  () => import('../../src/components/ui/AuroraBackground'),
  { ssr: false }
);

/* ─── Iconos SVG minimalistas ─── */
const TargetIcon = (
  <svg
    className="w-8 h-8 text-congreso-teal mb-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const VisionIcon = (
  <svg
    className="w-8 h-8 text-congreso-blue mb-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export default function AboutMePage() {
  return (
    <AuroraBackground>
      <main className="relative z-10 w-full min-h-screen">
        <Navbar />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          {/* Botón premium estilo Aurora UI para regresar al inicio */}
          <div className="mb-8 scroll-reveal">
            <Link href="/" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white dark:bg-slate-900/60 border border-congreso-teal/20 text-congreso-dark dark:text-slate-100 hover:bg-congreso-teal/10 hover:border-congreso-teal/40 transition-all duration-300 shadow-sm text-sm font-medium group">
              <span className="transform group-hover:-translate-x-1 transition-transform duration-200">←</span>
              Regresar al Inicio
            </Link>
          </div>
          {/* ═══════════════════════════════════════════════════
              SECCIÓN 1: NUESTRA HISTORIA
             ═══════════════════════════════════════════════════ */}
          <section className="mb-16 md:mb-24 scroll-reveal">
            {/* Tag decorativo superior */}
            <span className="text-congreso-teal font-mono text-xs tracking-[0.25em] uppercase block mb-4">
              —— Desde 2009
            </span>

            {/* Tarjeta masiva satinada con la historia */}
            <div className="bg-white dark:bg-slate-900/60 dark:border-slate-800 border border-congreso-teal/10 shadow-2xl rounded-3xl p-6 md:p-10 relative overflow-hidden">
              {/* Adornos de fondo */}
              <div
                className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-congreso-teal/5 blur-3xl pointer-events-none"
                aria-hidden="true"
              />
              <div
                className="absolute -bottom-20 -left-20 w-56 h-56 rounded-full bg-congreso-blue/5 blur-3xl pointer-events-none"
                aria-hidden="true"
              />

              {/* Barra lateral de acento izquierda */}
              <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-congreso-dark via-congreso-blue to-congreso-teal rounded-r-full" />

              <h2 className="text-3xl md:text-4xl font-black mb-8 uppercase tracking-tight bg-gradient-to-r from-congreso-dark via-congreso-blue to-congreso-teal bg-clip-text text-transparent">
                Nuestra Historia
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                {/* Columna de texto — ocupa 2 de 3 columnas */}
                <div className="lg:col-span-2 space-y-6 text-base md:text-lg text-congreso-dark/80 dark:text-slate-400 leading-relaxed text-justify">
                  <p>
                    El programa educativo de Ingeniería en Gestión Empresarial nació en el{' '}
                    <strong className="text-congreso-teal font-bold">
                      Instituto Tecnológico Superior de Zongolica
                    </strong>{' '}
                    en 2009, con el objetivo de cubrir la necesidad de que los profesionistas 
                    que se forman en esta casa de estudios desarrollaran competencias que les 
                    permitieran administrar, emprender e innovar en beneficio de las empresas 
                    de la región. En ese año, con{' '}
                    <strong className="text-congreso-teal font-bold">
                      41 alumnos
                    </strong>{' '}
                    de nuevo ingreso, arrancó este sueño que hoy se consolida como un referente 
                en la formación de líderes empresariales con sentido humano y visión tecnológica.
                  </p>
                  <p>
                    Desde sus inicios, el programa ha evolucionado constantemente, adaptándose 
                    a las demandas del entorno empresarial y tecnológico. Se ha convertido en una 
                    verdadera{' '}
                    <strong className="text-congreso-teal font-bold">
                      incubadora de empresas
                    </strong>
                    , donde los estudiantes transforman sus ideas en proyectos productivos que 
                    impactan positivamente en las comunidades de la región. Actualmente, contamos 
                    con{' '}
                    <strong className="text-congreso-teal font-bold">
                      38 docentes distribuidos en las 6 unidades académicas
                    </strong>
                    , quienes día a día forman a los profesionistas que el siglo XXI demanda, 
                    combinando la gestión empresarial con la innovación tecnológica y el 
                    emprendimiento sustentable.
                  </p>
                </div>

                {/* Columna de imagen — ocupa 1 de 3 columnas */}
                <div className="relative w-full h-[250px] md:h-[350px] rounded-2xl overflow-hidden border border-congreso-teal/20 shadow-inner scroll-reveal">
                <Image 
                    src="/IGE.png"
                    alt="Ingeniería en Gestión Empresarial - IGE"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover hover:scale-105 transition-transform duration-500"
                    priority
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════
              SECCIÓN 2: MISIÓN Y VISIÓN
             ═══════════════════════════════════════════════════ */}
          <section>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
              {/* ─── TARJETA DE MISIÓN ─── */}
              <div className="scroll-reveal bg-white dark:bg-slate-900/60 dark:border-slate-800 border border-congreso-teal/10 shadow-2xl rounded-3xl p-8 relative overflow-hidden group transition-all duration-300 hover:shadow-[0_0_50px_-12px_rgba(0,151,167,0.2)]">
                {/* Esfera decorativa */}
                <div
                  className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-congreso-teal/8 blur-[80px] pointer-events-none group-hover:bg-congreso-teal/15 transition-all duration-500"
                  aria-hidden="true"
                />

                {/* Icono + título */}
                {TargetIcon}
                <div className="border-l-4 border-congreso-teal pl-6">
                  <h3 className="text-2xl font-bold mb-4 text-congreso-dark dark:text-slate-100 uppercase tracking-tight">
                    Misión
                  </h3>
                  <p className="text-base md:text-lg text-congreso-dark/80 dark:text-slate-400 leading-relaxed text-justify">
                    Formar profesionistas en gestión empresarial con un enfoque 
                    emprendinnovador, creativo y sustentable, que coadyuven de manera 
                    eficiente y eficaz hacia el desarrollo económico de la zona de 
                    influencia del ITSZ.
                  </p>
                </div>
              </div>

              {/* ─── TARJETA DE VISIÓN ─── */}
              <div className="scroll-reveal bg-white dark:bg-slate-900/60 dark:border-slate-800 border border-congreso-blue/10 shadow-2xl rounded-3xl p-8 relative overflow-hidden group transition-all duration-300 hover:shadow-[0_0_50px_-12px_rgba(13,71,161,0.2)]">
                {/* Esfera decorativa */}
                <div
                  className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-congreso-blue/8 blur-[80px] pointer-events-none group-hover:bg-congreso-blue/15 transition-all duration-500"
                  aria-hidden="true"
                />

                {/* Icono + título */}
                {VisionIcon}
                <div className="border-l-4 border-congreso-blue pl-6">
                  <h3 className="text-2xl font-bold mb-4 text-congreso-dark dark:text-slate-100 uppercase tracking-tight">
                    Visión
                  </h3>
                  <p className="text-base md:text-lg text-congreso-dark/80 dark:text-slate-400 leading-relaxed text-justify">
                    Ser un programa educativo líder a nivel nacional por su excelencia 
                    profesional, mediante la mejora continua, impulsando el desarrollo 
                    sustentable emprendeinnovador, que permita elevar la calidad de vida 
                    de la sociedad.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer al final */}
        <Footer />
      </main>
    </AuroraBackground>
  );
}