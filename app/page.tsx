'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/src/lib/supabase/client';
import Navbar from '../src/components/ui/navbar';
import TeatroMap from '../src/components/ui/MapaTeatro';
import AliadosYPatrocinadores from '../src/components/ui/AliadosYPatrocinadores';
import MapboxMap from '../src/components/ui/MapboxMap';
import dynamic from 'next/dynamic';
import Footer from '../src/components/ui/Footer';
import { hyperspeedPresets } from '../src/components/Backgrounds/Hyperspeed';
import SpeakersMagistrales from '../src/components/ui/SpeakersMagistrales';
import ThemeToggle from '../src/components/ui/ThemeToggle';

const AuroraBackground = dynamic(
  () => import('../src/components/ui/AuroraBackground'),
  { ssr: false }
);

const TextPressure = dynamic(
  () => import('../src/components/ui/TextPressure'),
  { ssr: false }
);

interface HyperspeedProps {
  effectOptions?: Record<string, unknown>;
}

const Hyperspeed = dynamic<HyperspeedProps>(
  () => import('../src/components/Backgrounds/Hyperspeed'),
  { ssr: false }
);

const LANDS = [
  {
    id: 'dev',
    name: 'DEVELOPER LAND',
    color: '#03B3C3',
    preset: hyperspeedPresets.one,
    desc: 'Investigación en IA aplicada al emprendimiento y desarrollo de software empresarial.',
  },
  {
    id: 'creative',
    name: 'CREATIVE LAND',
    color: '#D856BF',
    preset: hyperspeedPresets.two,
    desc: 'Innovación en modelos de negocio, diseño estratégico y emprendimiento social.',
  },
  {
    id: 'blockchain',
    name: 'BLOCKCHAIN LAND',
    color: '#ff102a',
    preset: hyperspeedPresets.three,
    desc: 'Economía digital, Ciudades Inteligentes y Sustentabilidad tecnológica.',
  },
  {
    id: 'business',
    name: 'BUSINESS LAND',
    color: '#f1eece',
    preset: hyperspeedPresets.four,
    desc: 'Liderazgo, vinculación laboral y crecimiento económico en la Zona Centro.',
  },
] as const;

export default function TalentLandInspiredPage() {
  const [currentPreset, setCurrentPreset] = useState<Record<string, unknown>>(hyperspeedPresets.one);
  const [asientosSeleccionados, setAsientosSeleccionados] = useState<string[]>([]);
  // NO usar usePathname: evitar que Three.js se remonte en cada ruta.
  // Usamos key constante para que React no desmonte el fondo 3D en re-renders.
  const HYPERSPEED_KEY = "hyperspeed-bg";

  type AuthStatus = 'loading' | 'error' | 'success';
  const [status, setStatus] = useState<AuthStatus>('loading');

  // 🛡️ Mecanismo para evitar fugas de memoria y actualizaciones en componentes desmontados
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  // 🛡️ VALIDACIÓN DE INTEGRIDAD DE SESIÓN (Anti-Zombie Session)
  const checkRealSession = useCallback(async () => {
    try {
      const supabase = createClient();
      console.log("🔍 [DEBUG INTEGRIDAD]: Validando existencia real del usuario en la base de datos...");
      
      // getUser() valida contra el servidor de Supabase, no solo contra el almacenamiento local.
      const { data: { user }, error } = await supabase.auth.getUser();
      
      // Si hay un error de lógica de negocio (el usuario no existe)
      if (error || !user) {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          console.warn("⚠️ [ALERTA INTEGRIDAD]: Se detectó una sesión local activa, pero el usuario ya NO existe en Supabase. Limpiando rastro...");
          
          await supabase.auth.signOut();
          localStorage.clear();
          sessionStorage.clear();
          
          console.log("🧹 [DEBUG INTEGRIDAD]: Navegador sanitizado.");
        }
      }
      if (isMounted.current) {
        setStatus('success');
      }
    } catch (err) {
      console.error("❌ [ERROR INTEGRIDAD]: Fallo de red al validar sesión:", err);
      if (isMounted.current) {
        setStatus('error');
      }
    }
  }, []);

  useEffect(() => {
    const runValidation = async () => {
      await checkRealSession();
    };
    if (isMounted.current) {
      runValidation();
    }
  }, [checkRealSession]);

  if (status === 'loading') {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(147,51,234,0.4)]"></div>
          <p className="font-mono text-xs text-purple-400 uppercase tracking-[0.3em] animate-pulse">Validando credenciales...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-6 max-w-sm text-center px-6">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="space-y-2">
            <h3 className="text-white font-bold text-lg tracking-tight uppercase">Error de Sincronización</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              No pudimos establecer conexión con el sistema de seguridad. Por favor, verifica tu conexión a internet.
            </p>
          </div>
          <button 
            onClick={() => {
              setStatus('loading');
              checkRealSession();
            }}
            className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(147,51,234,0.3)]"
          >
            Reintentar Conexión
          </button>
        </div>
      </div>
    );
  }

  return (
    <AuroraBackground>
    <main style={styles.main}>
      <HyperspeedBackground key={HYPERSPEED_KEY} preset={currentPreset} />
      
      <ContentWrapper>
        <Navbar />
        <HeroSection />
        <Divider />
        <ObjectivesSection />
        <WorkTablesSection />
        <ScheduleSection />
        
        <LandsSection lands={LANDS} onSelectLand={setCurrentPreset} />
        
        <div className="mt-12 w-full max-w-6xl mx-auto px-4 mb-16">
          <TeatroMap 
            color={
              LANDS.find(l => l.preset === currentPreset)?.color || '#03B3C3'
            }
            asientosSeleccionados={asientosSeleccionados}
            setAsientosSeleccionados={setAsientosSeleccionados}
            eventId="landing-preview"
          />
        </div>
        <SpeakersMagistrales />
      </ContentWrapper>
      
      <ThemeToggle />
      
      <div className="relative z-20 w-full">
        <AliadosYPatrocinadores />
        <Footer />
      </div>
    </main>
    </AuroraBackground>
  );
}

/* ─── Componentes internos ─── */

function HyperspeedBackground({ preset }: { preset: Record<string, unknown> }) {
  return (
    <div style={styles.bgContainer}>
      <Hyperspeed effectOptions={preset} />
      <div style={styles.bgOverlay} />
    </div>
  );
}

function ContentWrapper({ children }: { children: React.ReactNode }) {
  return <div className="relative z-10 w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</div>;
}

function HeroSection() {
  return (
    <section className="animate-fadeIn mb-[14vh]">
      <div className="mt-12 md:mt-24 flex flex-col items-center justify-center text-center w-full">
        <div className="w-full max-w-5xl mx-auto mt-[40px] sm:mt-[70px] md:mt-[90px] mb-8 h-[80px] sm:h-[130px] md:h-[180px] flex items-center justify-center overflow-hidden">
          <TextPressure 
            text="ELIGE 2026"
            flex={true}
            alpha={false}
            stroke={false}
            width={true}
            weight={true}
            italic={true}
            textColor="currentColor"
            minFontSize={20}
          />
        </div>
      </div>
      <p style={styles.heroDesc}>
        Emprendimiento Liderazgo e Innovación en la Gestión Empresarial
      </p>
      <div className="flex flex-col sm:flex-row gap-6 justify-center items-center my-8">
        <a 
          href="/agenda-dia-1" 
          className="relative group px-8 py-3.5 bg-black/40 backdrop-blur-md text-white font-bold text-sm tracking-wider uppercase rounded-lg border border-[#D856BF]/40 transition-all duration-300 hover:border-[#D856BF] hover:text-[#D856BF] hover:shadow-[0_0_25px_rgba(216,86,191,0.5)] flex items-center justify-center overflow-hidden min-w-[200px]"
        >
          <span className="absolute top-0 left-0 w-full h-[2px] bg-[#D856BF] opacity-50 group-hover:opacity-100 transition-opacity" />
          <span className="relative z-10 flex items-center gap-2">
            Ver Día 1 <span className="text-[11px] opacity-60 font-mono">(25 Mayo)</span>
          </span>
        </a>

        <a 
          href="/agenda-dia-2" 
          className="relative group px-8 py-3.5 bg-black/40 backdrop-blur-md text-white font-bold text-sm tracking-wider uppercase rounded-lg border border-[#10B981]/40 transition-all duration-300 hover:border-[#10B981] hover:text-[#10B981] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] flex items-center justify-center overflow-hidden min-w-[200px]"
        >
          <span className="absolute top-0 left-0 w-full h-[2px] bg-[#10B981] opacity-50 group-hover:opacity-100 transition-opacity" />
          <span className="relative z-10 flex items-center gap-2">
            Ver Día 2 <span className="text-[11px] opacity-60 font-mono">(26 Mayo)</span>
          </span>
        </a>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   1. PROPÓSITO ESTRATÉGICO — Tarjeta Masiva con Gradiente Interno
   ═══════════════════════════════════════════════════════════════ */
function ObjectivesSection() {
  return (
    <section className="mb-24 scroll-reveal">
      <div className="bg-surface-card border border-border-subtle shadow-[0_0_50px_-12px_rgba(124,58,237,0.3)] backdrop-blur-xl p-8 md:p-12 rounded-3xl relative overflow-hidden">
        {/* Adorno de fondo: rombo brillante fantasmal */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-purple-500/5 blur-3xl pointer-events-none" aria-hidden="true" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" aria-hidden="true" />
        
        {/* Barra lateral izquierda de acento */}
        <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-purple-500 via-purple-400 to-cyan-400 rounded-r-full" />
        
        {/* Icono flotante decorativo de fondo */}
        <div className="absolute top-6 right-8 text-purple-500/10 dark:text-purple-400/10 select-none pointer-events-none" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z" />
            <path d="M2 12h20" />
          </svg>
        </div>

        <h2 className="text-3xl md:text-4xl font-black mb-8 uppercase tracking-tight bg-gradient-to-r from-purple-500 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
          Propósito Estratégico
        </h2>
        
        <p className="text-xl md:text-2xl leading-relaxed text-text-main font-light border-l-4 border-purple-500 pl-6">
          Impulsar el desarrollo de competencias empresariales, el emprendimiento y la innovación tecnológica mediante un espacio de intercambio de conocimientos, experiencias y oportunidades, que integre a estudiantes, profesionales, empresas e investigadores, fomentando la creación de proyectos sostenibles, la vinculación laboral y el crecimiento económico y social en la Zona Centro del Estado de Veracruz.
        </p>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   2. MESAS DE TRABAJO — Grid Futurista Metálico con Neón Atenuado
   ═══════════════════════════════════════════════════════════════ */
const diamondIcon = (
  <svg className="w-3.5 h-3.5 shrink-0 mt-0.5 text-purple-500 dark:text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5" />
    <path d="M2 12l10 5 10-5" />
  </svg>
);

const arrowRightIcon = (
  <svg className="w-4 h-4 shrink-0 mt-0.5 text-cyan-500 dark:text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

function WorkTablesSection() {
  return (
    <section className="mb-24">
      <h2 className="text-3xl md:text-4xl font-black text-center mb-12 uppercase tracking-tighter bg-gradient-to-r from-purple-500 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
        Mesas de Trabajo
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
        {/* Mesa 01 */}
        <div className="group scroll-reveal bg-surface-card text-text-main border border-border-subtle shadow-[0_0_40px_-16px_rgba(124,58,237,0.2)] backdrop-blur-xl rounded-3xl p-8 relative overflow-hidden transition-all duration-300 hover:shadow-[0_0_60px_-12px_rgba(124,58,237,0.4)] hover:border-purple-500/30">
          {/* Brillo esquina */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-500/10 blur-[60px] rounded-full pointer-events-none group-hover:bg-purple-500/20 transition-all duration-500" aria-hidden="true" />
          
          <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-purple-500 bg-purple-500/10 px-3 py-1 rounded-full w-fit mb-4 block">
            Mesa 01
          </span>
          <h3 className="text-2xl font-bold mb-4 text-text-main">Emprendimiento</h3>
          <ul className="space-y-2 text-sm text-text-main/80">
            <li className="flex items-start gap-3 hover:bg-purple-500/5 p-2 rounded-xl transition-colors duration-200">
              {diamondIcon}
              <span><strong className="text-text-main">Intraemprendimiento:</strong> Estudios e investigaciones relacionadas en innovación dentro de las organizaciones.</span>
            </li>
            <li className="flex items-start gap-3 hover:bg-purple-500/5 p-2 rounded-xl transition-colors duration-200">
              {diamondIcon}
              <span><strong className="text-text-main">Emprendimientos:</strong> Agrícolas, Sociales, Turísticos, Comunitarios y Tecnológicos.</span>
            </li>
          </ul>
        </div>

        {/* Mesa 02 */}
        <div className="group scroll-reveal bg-surface-card text-text-main border border-border-subtle shadow-[0_0_40px_-16px_rgba(6,182,212,0.2)] backdrop-blur-xl rounded-3xl p-8 relative overflow-hidden transition-all duration-300 hover:shadow-[0_0_60px_-12px_rgba(6,182,212,0.4)] hover:border-cyan-500/30">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/10 blur-[60px] rounded-full pointer-events-none group-hover:bg-cyan-500/20 transition-all duration-500" aria-hidden="true" />
          
          <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-cyan-500 bg-cyan-500/10 px-3 py-1 rounded-full w-fit mb-4 block">
            Mesa 02
          </span>
          <h3 className="text-2xl font-bold mb-4 text-text-main">Innovación Tecnológica</h3>
          <ul className="space-y-2 text-sm text-text-main/80">
            <li className="flex items-start gap-3 hover:bg-cyan-500/5 p-2 rounded-xl transition-colors duration-200">
              {arrowRightIcon}
              <span><strong className="text-text-main">IA en el Emprendimiento:</strong> Estudios e investigaciones relacionadas.</span>
            </li>
            <li className="flex items-start gap-3 hover:bg-cyan-500/5 p-2 rounded-xl transition-colors duration-200">
              {arrowRightIcon}
              <span>Ciudades inteligentes y sustentabilidad.</span>
            </li>
            <li className="flex items-start gap-3 hover:bg-cyan-500/5 p-2 rounded-xl transition-colors duration-200">
              {arrowRightIcon}
              <span>Proyectos de Innovación Tecnológica.</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   3. CRONOGRAMA OFICIAL — Timeline dividido en dos columnas
   ═══════════════════════════════════════════════════════════════ */
function ScheduleSection() {
  return (
    <section className="mb-24">
      <h2 className="text-3xl md:text-4xl font-black text-center mb-12 uppercase tracking-tighter bg-gradient-to-r from-purple-500 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
        Cronograma Oficial
      </h2>

      {/* ─── DOS COLUMNAS LADO A LADO ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        
        {/* ══ COLUMNA DÍA 1 ══ */}
        <div className="relative">
          {/* Línea de timeline vertical */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 via-purple-400 to-purple-500/20 rounded-full" aria-hidden="true" />
          
          {/* Círculo superior */}
          <div className="absolute left-[11px] top-0 w-[18px] h-[18px] rounded-full bg-purple-600 border-[3px] border-bg-base shadow-[0_0_16px_rgba(168,85,247,0.6)] z-10" aria-hidden="true" />
          
          {/* Header Día 1 */}
          <TimelineDayHeader
            day="Día 1"
            title="Emprendimiento"
            date="Miércoles 18 de Noviembre"
            location="Teatro Metropolitano"
            gradientFrom="from-purple-600"
            gradientTo="to-purple-700"
            shadowColor="shadow-purple-500/25"
          />

          {/* Items del timeline Día 1 */}
          <div className="relative space-y-6 pl-14">
            <TimelineItem 
              time="Mañana" 
              activities={['Conferencia Magistral', 'Panel Mujeres Emprendedoras']} 
              dotColor="bg-purple-500" 
              lineColor="via-purple-400"
            />
            <TimelineItem 
              time="Tarde" 
              activities={['Expo Emprendimiento', 'Comida & Networking']} 
              dotColor="bg-purple-500"
              lineColor="via-purple-400" 
            />
            <TimelineItem 
              time="Noche" 
              activities={['Evento Cultural (Talento IGE)']} 
              dotColor="bg-purple-500"
              lineColor="via-purple-400" 
            />
            <TimelineItem 
              time="Cierre" 
              activities={['Grupo Musical']} 
              dotColor="bg-purple-500"
              lineColor="via-purple-400"
              isLast
            />
          </div>
        </div>

        {/* ══ COLUMNA DÍA 2 ══ */}
        <div className="relative">
          {/* Línea de timeline vertical */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-500 via-emerald-400 to-emerald-500/20 rounded-full" aria-hidden="true" />
          
          {/* Círculo superior */}
          <div className="absolute left-[11px] top-0 w-[18px] h-[18px] rounded-full bg-emerald-600 border-[3px] border-bg-base shadow-[0_0_16px_rgba(16,185,129,0.6)] z-10" aria-hidden="true" />
          
          {/* Header Día 2 */}
          <TimelineDayHeader
            day="Día 2"
            title="Innovación"
            date="Jueves 19 de Noviembre"
            location="Teatro Metropolitano"
            gradientFrom="from-emerald-600"
            gradientTo="to-emerald-700"
            shadowColor="shadow-emerald-500/25"
          />

          {/* Items del timeline Día 2 */}
          <div className="relative space-y-6 pl-14">
            <TimelineItem 
              time="09:00" 
              activities={['Conferencia 01']} 
              dotColor="bg-emerald-500"
              lineColor="via-emerald-400"
            />
            <TimelineItem 
              time="11:00" 
              activities={['Conferencia 02']} 
              dotColor="bg-emerald-500"
              lineColor="via-emerald-400"
            />
            <TimelineItem 
              time="13:00" 
              activities={['Conferencia 03']} 
              dotColor="bg-emerald-500"
              lineColor="via-emerald-400"
            />
            <TimelineItem 
              time="Tarde" 
              activities={['Expo Innovación', 'Gran Rifa']} 
              dotColor="bg-emerald-500"
              lineColor="via-emerald-400"
            />
            <TimelineItem 
              time="Cierre" 
              activities={['Clausura Oficial']} 
              dotColor="bg-emerald-500"
              lineColor="via-emerald-400"
              isLast
            />
          </div>
        </div>

      </div>

      {/* ── MAPA INTERACTIVO DE LA SEDE ── */}
      <div className="mt-16">
        <MapboxMap />
      </div>
    </section>
  );
}

/* ─── Componente: Cabecera de cada columna del Timeline ─── */
function TimelineDayHeader({
  day,
  title,
  date,
  location,
  gradientFrom,
  gradientTo,
  shadowColor,
}: {
  day: string;
  title: string;
  date: string;
  location: string;
  gradientFrom: string;
  gradientTo: string;
  shadowColor: string;
}) {
  return (
    <div className={`relative mb-8 ml-14 bg-gradient-to-r ${gradientFrom} ${gradientTo} rounded-2xl p-5 md:p-6 text-white shadow-2xl ${shadowColor} overflow-hidden`}>
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mt-8 -mr-8 blur-2xl pointer-events-none" aria-hidden="true" />
      <div className="relative z-10">
        <span className="inline-block text-[10px] uppercase font-mono tracking-[0.3em] bg-white/15 px-3 py-1 rounded-full mb-2">{day}</span>
        <h3 className="font-black text-xl md:text-2xl uppercase tracking-tight">{title}</h3>
        <p className="text-sm text-white/80 font-mono mt-1">{date}</p>
        <p className="text-xs text-white/60 font-mono flex items-center gap-1.5 mt-1">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {location}
        </p>
      </div>
    </div>
  );
}

/* ─── Componente: Item individual del Timeline ─── */
function TimelineItem({
  time,
  activities,
  dotColor,
  lineColor = 'via-purple-400',
  isLast = false,
}: {
  time: string;
  activities: string[];
  dotColor: string;
  lineColor?: string;
  isLast?: boolean;
}) {
  return (
    <div className="scroll-reveal relative group">
      {/* Conexión vertical (se oculta si es el último) */}
      {!isLast && (
        <div className={`absolute left-[3px] top-5 bottom-[-1.5rem] w-0.5 bg-gradient-to-b from-current ${lineColor} to-transparent opacity-20 rounded-full`} aria-hidden="true" />
      )}
      
      {/* Círculo conector */}
      <div className={`absolute -left-[10px] top-[14px] w-[22px] h-[22px] rounded-full border-[3px] border-bg-base ${dotColor} shadow-[0_0_12px_rgba(168,85,247,0.3)] z-10 transition-all duration-300 group-hover:scale-125 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.5)]`} aria-hidden="true" />
      
      {/* Tarjeta de contenido */}
      <div className="bg-surface-card border border-border-subtle rounded-xl p-4 shadow-lg backdrop-blur-md transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-xl ml-2">
        <div className="flex flex-col md:flex-row gap-2 md:gap-6">
          {/* Badge de tiempo */}
          <span className={`w-fit md:min-w-[80px] text-center text-white font-bold text-[11px] py-1.5 px-3 rounded-md shadow-md ${dotColor}`}>
            {time}
          </span>
          {/* Lista de actividades */}
          <div className="space-y-1.5">
            {activities.map((act, i) => (
              <p key={i} className="text-sm font-semibold text-text-main leading-snug flex items-start gap-2">
                <span className={`inline-block w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${dotColor}`} aria-hidden="true" />
                {act}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Divider() {
  return <hr style={styles.divider} />;
}

function LandsSection({
  lands,
  onSelectLand,
}: {
  lands: typeof LANDS;
  onSelectLand: (preset: Record<string, unknown>) => void;
}) {
  return (
    <section id="lands" style={styles.landsSection}>
      <h2 style={styles.sectionTitle}>EXPLORA NUESTRAS TIERRAS TEMÁTICAS</h2>
      <p style={styles.sectionSub}>
        Interactúa con las tarjetas para alterar el flujo y los colores del hiperespacio 3D.
      </p>
      <div style={styles.landsGrid}>
        {lands.map((land) => (
          <LandCard key={land.id} land={land} onSelect={() => onSelectLand(land.preset)} />
        ))}
      </div>
    </section>
  );
}

function LandCard({
  land,
  onSelect,
}: {
  land: (typeof LANDS)[number];
  onSelect: () => void;
}) {
  return (
    <div
      onMouseEnter={onSelect}
      onClick={onSelect}
      className="bg-white dark:bg-slate-900 text-texto-base border border-borde-sutil p-10 rounded-lg cursor-pointer transition-all duration-300 shadow-lg"
      style={{
        borderTop: `4px solid ${land.color}`,
        transform: 'none',
      }}
    >
      <span className="font-bold text-xs tracking-widest block mb-3" style={{ color: land.color }}>IGE LANDS</span>
      <h3 className="text-[1.4rem] font-bold mb-4 tracking-tight">{land.name}</h3>
      <p className="text-sm leading-relaxed mb-8" style={{ color: 'var(--text-principal)', opacity: 0.65 }}>{land.desc}</p>
      <div className="text-sm font-bold flex items-center gap-2" style={{ color: land.color }}>
        Conocer conferencias <span>→</span>
      </div>
    </div>
  );
}

/* ─── Estilos agrupados ─── */

const styles: Record<string, React.CSSProperties> = {
  main: {
    position: 'relative',
    width: '100vw',
    minHeight: '100vh',
    backgroundColor: 'transparent',
    color: 'var(--text-principal)',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    overflowX: 'hidden',
  },
  bgContainer: {
    position: 'fixed',
    inset: 0,
    zIndex: 1,
  },
  bgOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.05) 50%, transparent 80%)',
    pointerEvents: 'none',
  },
  content: {
    position: 'relative',
    zIndex: 10,
    maxWidth: 1200,
    margin: '0 auto',
    padding: '2rem 1rem',
  },
  hero: {
    textAlign: 'center',
    marginBottom: '14vh',
    marginTop: '4vh',
  },
  heroTagline: {
    letterSpacing: '0.4em',
    color: '#03B3C3',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 'clamp(2.3rem, 7vw, 4.8rem)',
    fontWeight: 900,
    margin: '1rem 0',
    lineHeight: 1.05,
    letterSpacing: '-0.02em',
  },
  heroDesc: {
    fontSize: 'clamp(1rem, 2vw, 1.2rem)',
    color: 'var(--text-principal)',
    maxWidth: 630,
    margin: '0 auto 2.5rem',
    lineHeight: 1.6,
  },
  divider: {
    border: 0,
    height: 1,
    background: 'linear-gradient(to right, transparent, var(--border-componentes), transparent)',
    margin: '5rem 0',
  },
  landsSection: { marginBottom: '12vh' },
  sectionTitle: {
    fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
    fontWeight: 800,
    textAlign: 'center',
    marginBottom: '0.5rem',
  },
  sectionSub: {
    textAlign: 'center',
    color: 'var(--text-principal)',
    opacity: 0.6,
    marginBottom: '4rem',
    fontSize: '1rem',
  },
  landsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '1.5rem',
  },
};