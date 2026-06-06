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
    className="w-8 h-8 text-purple-500 mb-4"
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
    className="w-8 h-8 text-fuchsia-500 mb-4"
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
            <Link href="/" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-surface-card border border-border-subtle text-text-main hover:bg-purple-500/10 hover:border-purple-500/40 transition-all duration-300 shadow-sm text-sm font-medium backdrop-blur-md group">
              <span className="transform group-hover:-translate-x-1 transition-transform duration-200">←</span>
              Regresar al Inicio
            </Link>
          </div>
          {/* ═══════════════════════════════════════════════════
              SECCIÓN 1: NUESTRA HISTORIA
             ═══════════════════════════════════════════════════ */}
          <section className="mb-16 md:mb-24 scroll-reveal">
            {/* Tag decorativo superior */}
            <span className="text-purple-500 font-mono text-xs tracking-[0.25em] uppercase block mb-4">
              —— Desde 2009
            </span>

            {/* Tarjeta masiva satinada con la historia */}
            <div className="bg-surface-card border border-border-subtle shadow-2xl backdrop-blur-xl p-6 md:p-10 rounded-3xl relative overflow-hidden">
              {/* Adornos de fondo fantasmas */}
              <div
                className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-purple-500/5 blur-3xl pointer-events-none"
                aria-hidden="true"
              />
              <div
                className="absolute -bottom-20 -left-20 w-56 h-56 rounded-full bg-fuchsia-500/5 blur-3xl pointer-events-none"
                aria-hidden="true"
              />

              {/* Barra lateral de acento izquierda */}
              <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-purple-500 via-purple-400 to-fuchsia-400 rounded-r-full" />

              <h2 className="text-3xl md:text-4xl font-black mb-8 uppercase tracking-tight bg-gradient-to-r from-purple-500 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
                Nuestra Historia
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                {/* Columna de texto — ocupa 2 de 3 columnas */}
                <div className="lg:col-span-2 space-y-6 text-base md:text-lg text-text-main leading-relaxed text-justify">
                  <p>
                    El programa educativo de Ingeniería en Gestión Empresarial nació en el{' '}
                    <strong className="text-purple-500 dark:text-purple-400 font-bold">
                      Instituto Tecnológico Superior de Zongolica
                    </strong>{' '}
                    en 2009, con el objetivo de cubrir la necesidad de que los profesionistas 
                    que se forman en esta casa de estudios desarrollaran competencias que les 
                    permitieran administrar, emprender e innovar en beneficio de las empresas 
                    de la región. En ese año, con{' '}
                    <strong className="text-purple-500 dark:text-purple-400 font-bold">
                      41 alumnos
                    </strong>{' '}
                    de nuevo ingreso, arrancó este sueño que hoy se consolida como un referente 
                en la formación de líderes empresariales con sentido humano y visión tecnológica.
                  </p>
                  <p>
                    Desde sus inicios, el programa ha evolucionado constantemente, adaptándose 
                    a las demandas del entorno empresarial y tecnológico. Se ha convertido en una 
                    verdadera{' '}
                    <strong className="text-purple-500 dark:text-purple-400 font-bold">
                      incubadora de empresas
                    </strong>
                    , donde los estudiantes transforman sus ideas en proyectos productivos que 
                    impactan positivamente en las comunidades de la región. Actualmente, contamos 
                    con{' '}
                    <strong className="text-purple-500 dark:text-purple-400 font-bold">
                      38 docentes distribuidos en las 6 unidades académicas
                    </strong>
                    , quienes día a día forman a los profesionistas que el siglo XXI demanda, 
                    combinando la gestión empresarial con la innovación tecnológica y el 
                    emprendimiento sustentable.
                  </p>
                </div>

                {/* Columna de imagen — ocupa 1 de 3 columnas */}
                <div className="relative w-full h-[250px] md:h-[350px] rounded-2xl overflow-hidden border border-border-subtle shadow-inner scroll-reveal">
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
              <div className="scroll-reveal bg-surface-card border border-border-subtle shadow-2xl backdrop-blur-xl p-8 rounded-3xl relative overflow-hidden group transition-all duration-300 hover:shadow-[0_0_50px_-12px_rgba(168,85,247,0.25)]">
                {/* Esfera decorativa */}
                <div
                  className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-purple-500/8 blur-[80px] pointer-events-none group-hover:bg-purple-500/15 transition-all duration-500"
                  aria-hidden="true"
                />

                {/* Icono + título */}
                {TargetIcon}
                <div className="border-l-4 border-purple-500 pl-6">
                  <h3 className="text-2xl font-bold mb-4 text-text-main uppercase tracking-tight">
                    Misión
                  </h3>
                  <p className="text-base md:text-lg text-text-main leading-relaxed text-justify">
                    Formar profesionistas en gestión empresarial con un enfoque 
                    emprendinnovador, creativo y sustentable, que coadyuven de manera 
                    eficiente y eficaz hacia el desarrollo económico de la zona de 
                    influencia del ITSZ.
                  </p>
                </div>
              </div>

              {/* ─── TARJETA DE VISIÓN ─── */}
              <div className="scroll-reveal bg-surface-card border border-border-subtle shadow-2xl backdrop-blur-xl p-8 rounded-3xl relative overflow-hidden group transition-all duration-300 hover:shadow-[0_0_50px_-12px_rgba(217,70,239,0.25)]">
                {/* Esfera decorativa */}
                <div
                  className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-fuchsia-500/8 blur-[80px] pointer-events-none group-hover:bg-fuchsia-500/15 transition-all duration-500"
                  aria-hidden="true"
                />

                {/* Icono + título */}
                {VisionIcon}
                <div className="border-l-4 border-fuchsia-500 pl-6">
                  <h3 className="text-2xl font-bold mb-4 text-text-main uppercase tracking-tight">
                    Visión
                  </h3>
                  <p className="text-base md:text-lg text-text-main leading-relaxed text-justify">
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