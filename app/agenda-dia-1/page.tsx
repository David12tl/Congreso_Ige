"use client";

import React from "react";
import Link from "next/link";

interface Experta {
  image: string;
  title: string;
  subtitle: string;
  handle: string;
  location: string;
}

export default function AgendaDia1() {
  const cronogramaMenu = [
    { id: "conferencia", hora: "10:30 AM", titulo: "Conferencia Magistral", categoria: "Apertura", color: "hover:border-blue-500 hover:shadow-blue-500/10" },
    { id: "mesa-expertas", hora: "12:00 PM", titulo: "Mesa Redonda Internacional", sub: "Mujeres Emprendedoras", categoria: "Debate", color: "hover:border-emerald-500 hover:shadow-emerald-500/10" },
    { id: "expo", hora: "Durante el día", titulo: "Expo Emprendimiento Tecnológico", categoria: "Exhibición", color: "hover:border-purple-500 hover:shadow-purple-500/10" },
    { id: "temazate", hora: "03:00 PM", titulo: "Temazate Tank", sub: "Concurso de Pitch", categoria: "Certamen", color: "hover:border-amber-500 hover:shadow-amber-500/10" },
  ];

  const expertasItems: Experta[] = [
    {
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400",
      title: "Dra. María Graciela Hernández y Orduña",
      subtitle: "Dirección General COVEICYDET y Miembro del Sistema Nacional de Investigadores (SNI).",
      handle: "@coveicydet",
      location: "🇲🇽 México"
    },
    {
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400",
      title: "Dra. Elyana Pelaez Muñoz",
      subtitle: "Directora General de Ori-Stereo y miembro distinguido de COPARMEX.",
      handle: "@oristereo",
      location: "🇲🇽 México"
    },
    {
      image: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=400",
      title: "Dra. Mónica Margot Risueño Solarte",
      subtitle: "Docente e Investigadora de la Facultad de Ciencias Agrarias - Universidad del Cauca.",
      handle: "@unicauca",
      location: "🇨🇴 Colombia"
    },
    {
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400",
      title: "Lic. Ihalí Saldaña Romero",
      subtitle: "Presidenta de la Cámara Nacional de Comercio, Servicios y Turismo (CANACO Servytur) Orizaba.",
      handle: "@canacoorizaba",
      location: "🇲🇽 México"
    },
    {
      image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=400",
      title: "L.A.E. Atenea Merino Chicatto",
      subtitle: "Presidenta de la Alianza de Mujeres Líderes Emprendedoras.",
      handle: "@alianzalideres",
      location: "🇲🇽 México"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-white scroll-smooth">
      
      {/* BOTÓN VOLVER */}
      <div className="max-w-6xl mx-auto pt-8 px-4">
        <Link href="/" className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-2 group w-fit">
          <span className="transform group-hover:-translate-x-1 transition-transform">←</span> Volver al inicio del congreso
        </Link>
      </div>

      {/* ENCABEZADO DEL DÍA */}
      <header className="relative overflow-hidden py-16 px-4 text-center flex flex-col items-center justify-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-gradient-to-r from-emerald-600/10 via-teal-500/10 to-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> 1er Congreso Internacional ELIGE 2026
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none mb-4">
            DÍA 1: EMPRENDIMIENTO <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-400 bg-clip-text text-transparent">
              & LIDERAZGO
            </span>
          </h1>
          <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto font-light">
            Miércoles 18 de Noviembre • <span className="text-slate-200 font-medium">Auditorio Metropolitano Orizaba</span>
          </p>
        </div>
      </header>

      {/* MENÚ DE ACCESO RÁPIDO */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cronogramaMenu.map((item, index) => (
            <a
              key={index}
              href={`#${item.id}`}
              className={`group relative flex flex-col justify-between p-6 bg-slate-900/40 border border-slate-800/80 rounded-2xl transition-all duration-300 backdrop-blur-sm ${item.color} hover:-translate-y-1`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold text-slate-400 bg-slate-950 px-2 py-1 rounded">
                    {item.hora}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider font-semibold opacity-60">
                    {item.categoria}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors leading-snug">
                  {item.titulo}
                </h3>
                {item.sub && <p className="text-xs text-slate-400 mt-1 italic font-light">{item.sub}</p>}
              </div>
              <div className="mt-6 flex items-center justify-between text-xs text-slate-500 group-hover:text-slate-300 font-medium transition-colors">
                <span>Ver bloque</span>
                <span className="transform group-hover:translate-x-1 transition-transform">➔</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* SECCIÓN: CONFERENCIA MAGISTRAL REESTRUCTURADA */}
      <section id="conferencia" className="max-w-6xl mx-auto px-4 pb-32 scroll-mt-24">
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <span className="bg-gradient-to-r from-orange-500 to-fuchsia-600 text-white text-xs font-mono font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider shadow-lg shadow-fuchsia-900/20">
            10:30 AM - 11:30 AM
          </span>
          <span className="text-sm font-semibold tracking-widest text-amber-400 uppercase flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping" />
            Conferencia Magistral
          </span>
        </div>

        {/* ESTRUCTURA CORREGIDA: FLEXBOX OBLIGATORIO EN LA MISMA FILA PARA ESCRITORIO Y TABLETS */}
        <div className="flex flex-col md:flex-row gap-10 lg:gap-14 items-start w-full">
          
          {/* COLUMNA IZQUIERDA: Reducida al 50% (w-[150px] fijo) */}
          <div className="w-[50px] md:w-[150px] shrink-0 flex justify-center md:justify-start">
            <div className="relative group w-[500px] h-[150px]">
              
              {/* Resplandor trasero reactivo */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 via-fuchsia-500 to-cyan-400 rounded-xl blur-sm opacity-50 group-hover:opacity-90 transition duration-500" />
              
              {/* Contenedor de la tarjeta reducida */}
              <article className="relative flex flex-col bg-slate-950 border border-cyan-500/20 rounded-2xl overflow-hidden group-hover:border-cyan-400 transition-all duration-300 shadow-2xl">
                
                {/* Imagen del Ponente */}
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-950">
                  <img 
                    src="/c_carlos_vidal.jpg" 
                    alt="C. Carlos Vidal Neri" 
                    loading="lazy" 
                    className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-2 right-2 bg-gradient-to-r from-orange-500 to-fuchsia-600 text-white font-mono text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-widest shadow-xl flex items-center gap-1 animate-bounce">
                    <span className="w-1 h-1 rounded-full bg-white animate-pulse"></span>
                    Keynote
                  </div>
                </div>

                {/* Zona de textos de la tarjeta adaptada al nuevo ancho */}
                <div className="p-2 flex flex-col gap-1.5 bg-gradient-to-b from-slate-900 via-slate-950 to-black">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-white to-cyan-400 leading-none mb-0.5">
                      Carlos Vidal Neri
                    </h3>
                    <span className="inline-block text-[7px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/50 border border-amber-500/30 px-1 py-0.5 rounded">
                      Dir. TVEO Canal
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-slate-900">
                    <div className="text-[9px] font-mono font-bold text-yellow-400/80 tracking-wide">
                      @tveocanal
                    </div>
                    <span className="text-[7px] font-extrabold tracking-widest text-cyan-400 bg-cyan-950/40 px-1 py-0.5 rounded border border-cyan-800/40">
                      🇲🇽 MX
                    </span>
                  </div>
                </div>

              </article>
            </div>
          </div>

          {/* COLUMNA DERECHA: flex-1 obliga a esta caja a tomar el resto del espacio en la derecha */}
          <div className="flex-1 w-full space-y-8 md:pt-2">
            
            {/* Título en formato gigante */}
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-none">
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-400 bg-clip-text text-transparent block">
                EMPRENDIMIENTO, INNOVACIÓN Y TURISMO
              </span>
              <span className="text-xs font-mono tracking-[0.25em] text-fuchsia-400 font-bold block mt-3">
                // PARA EL DESARROLLO DE LAS CIUDADES
              </span>
            </h2>

            {/* Puntos del perfil del ponente */}
            <div className="space-y-6 border-l-2 border-slate-900 pl-4">
              
              <div className="flex items-start gap-4 text-slate-300 group">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 text-xs mt-0.5 font-black shadow-[0_0_15px_rgba(34,211,238,0.25)] group-hover:scale-110 transition-transform">
                  ✓
                </span>
                <p className="leading-relaxed text-base md:text-lg">
                  <span className="text-cyan-300 font-bold">Director y conductor</span> del prestigioso Diario <span className="text-yellow-300 font-black tracking-wide">TVEO</span>.
                </p>
              </div>

              <div className="flex items-start gap-4 text-slate-300 group">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-fuchsia-500/10 border border-fuchsia-500/40 text-fuchsia-400 text-xs mt-0.5 font-black shadow-[0_0_15px_rgba(217,70,239,0.25)] group-hover:scale-110 transition-transform">
                  ✓
                </span>
                <p className="leading-relaxed text-base md:text-lg">
                  Desarrolló junto con <span className="text-white font-semibold">Román Rodríguez Martín</span> el innovador proyecto TVeO, consolidándolo de manera exitosa en los <span className="text-amber-400 font-mono font-black">últimos 12 años</span> como un medio líder en la región de las <span className="text-fuchsia-400 font-bold tracking-wide">Altas Montañas en Veracruz</span>.
                </p>
              </div>

              <div className="flex items-start gap-4 text-slate-300 group">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/40 text-amber-400 text-xs mt-0.5 font-black shadow-[0_0_15px_rgba(245,158,11,0.25)] group-hover:scale-110 transition-transform">
                  ✓
                </span>
                <p className="leading-relaxed text-base md:text-lg">
                  Comenzó su destacada trayectoria en medios de comunicación desde muy joven, forjando su experiencia en <span className="text-yellow-400 font-black tracking-wider bg-yellow-950/40 px-2 py-0.5 rounded border border-yellow-500/30">LÁSER 89</span> en paralelo a sus estudios.
                </p>
              </div>

              <div className="flex items-start gap-4 text-slate-300 group">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 text-xs mt-0.5 font-black shadow-[0_0_15px_rgba(34,211,238,0.25)] group-hover:scale-110 transition-transform">
                  ✓
                </span>
                <p className="leading-relaxed text-base md:text-lg">
                  Ha laborado con un récord sobresaliente dentro de la <span className="text-cyan-400 font-bold">administración municipal</span> de la emblemática ciudad de <span className="text-white font-bold underline decoration-cyan-400 decoration-2 underline-offset-4 font-mono">ORIZABA</span>.
                </p>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* SECCIÓN: MESA REDONDA INTERNACIONAL */}
      <section id="mesa-expertas" className="max-w-6xl mx-auto px-4 pb-32 scroll-mt-12">
        <div className="text-center mb-12">
          <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold px-3 py-1 rounded-md uppercase tracking-wider mb-3 inline-block">
            12:00 PM - 02:30 PM
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-3">
            MESA REDONDA INTERNACIONAL
          </h2>
          <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto font-light">
            <span className="text-emerald-400 font-medium">Ciencia, Empresa, Sociedad y Campo:</span><br />
            Las Mujeres que Transforman el Ecosistema Emprendedor.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
          {expertasItems.map((experta, i) => (
            <article 
              key={i}
              className="group flex flex-col bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden hover:border-emerald-500/40 hover:bg-slate-900/80 transition-all duration-300 shadow-xl"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-950">
                <img 
                  src={experta.image} 
                  alt={experta.title} 
                  loading="lazy" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-medium border border-slate-800">
                  {experta.location}
                </div>
              </div>

              <div className="p-5 flex flex-col flex-1 justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-100 group-hover:text-emerald-400 transition-colors leading-snug mb-2">
                    {experta.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-light">
                    {experta.subtitle}
                  </p>
                </div>
                <div className="text-[11px] font-mono text-slate-500 group-hover:text-emerald-500/80 transition-colors">
                  {experta.handle}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* SECCIONES COMPLEMENTARIAS */}
      <section id="expo" className="max-w-5xl mx-auto px-4 pb-20 border-t border-slate-900 pt-16 opacity-40">
        <h2 className="text-xl font-bold tracking-wider uppercase text-slate-400 mb-2">Expo Emprendimiento Tecnológico</h2>
        <p className="text-sm font-light text-slate-500">Contenido y muestras de stands de proyectos durante el día.</p>
      </section>

      <section id="temazate" className="max-w-5xl mx-auto px-4 pb-32 opacity-40">
        <h2 className="text-xl font-bold tracking-wider uppercase text-slate-400 mb-2">Temazate Tank</h2>
        <p className="text-sm font-light text-slate-500">Concurso de Pitch y premiación oficial de ideas de negocio a las 03:00 PM.</p>
      </section>

    </div>
  );
}