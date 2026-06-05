'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation'; // Importamos el lector de rutas
import Navbar from '../src/components/ui/navbar';
import TeatroMap from '../src/components/ui/MapaTeatro';
import AliadosYPatrocinadores from '../src/components/ui/AliadosYPatrocinadores';
import dynamic from 'next/dynamic';
import Footer from '../src/components/ui/Footer';
import { hyperspeedPresets } from '../src/components/Backgrounds/Hyperspeed';
import SpeakersMagistrales from '../src/components/ui/SpeakersMagistrales';

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
    desc: 'Inteligencia Artificial, Cloud Computing y Arquitectura de Software de última generación.',
  },
  {
    id: 'creative',
    name: 'CREATIVE LAND',
    color: '#D856BF',
    preset: hyperspeedPresets.two,
    desc: 'Diseño UX/UI, Animación CGI, Realidad Virtual y estrategias de Marketing Digital.',
  },
  {
    id: 'blockchain',
    name: 'BLOCKCHAIN LAND',
    color: '#ff102a',
    preset: hyperspeedPresets.three,
    desc: 'Criptoeconomía, Finanzas Descentralizadas (DeFi), Web3 y protocolos de Ciberseguridad.',
  },
  {
    id: 'business',
    name: 'BUSINESS LAND',
    color: '#f1eece',
    preset: hyperspeedPresets.four,
    desc: 'E-commerce, ecosistemas de Startups, metodologías ágiles y modelos de negocio exponenciales.',
  },
] as const;

export default function TalentLandInspiredPage() {
  const [currentPreset, setCurrentPreset] = useState<Record<string, unknown>>(hyperspeedPresets.one);
  const [asientosSeleccionados, setAsientosSeleccionados] = useState<string[]>([]);
  const pathname = usePathname(); // Detecta la ruta actual de forma reactiva

  return (
    <main style={styles.main}>
      {/* SOLUCIÓN DEFINITIVA: Al usar pathname como 'key', si navegas fuera y regresas, 
        React detecta el cambio de ruta y vuelve a montar el componente desde cero, 
        evitando que el Canvas 3D se quede colgado en negro. Todo sin usar useEffect.
      */}
      <HyperspeedBackground key={pathname} preset={currentPreset} />
      
      <ContentWrapper>
        <Navbar />
        <HeroSection />
        <Divider />
        
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
      
      <div className="relative z-20 w-full bg-[#0d0e12]">
        <AliadosYPatrocinadores />
        <Footer />
      </div>
    </main>
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
  return <div style={styles.content}>{children}</div>;
}

function HeroSection() {
  return (
    <section style={styles.hero}>
      <span style={styles.heroTagline}>El encuentro de talento tecnológico más grande</span>
      <h1 style={styles.heroTitle}>INNOVACIÓN EN MOVIMIENTO</h1>
      <p style={styles.heroDesc}>
        2 Días intensivos, 4 Ejes Temáticos simultáneos y los expertos que están rediseñando el futuro de la industria digital.
      </p>
      <div className="flex flex-col sm:flex-row gap-6 justify-center items-center my-8">
        {/* Botón Día 1 - Efecto LED Púrpura / Magenta */}
        <a 
          href="/agenda-dia-1" 
          className="relative group px-8 py-3.5 bg-black/40 backdrop-blur-md text-white font-bold text-sm tracking-wider uppercase rounded-lg border border-[#D856BF]/40 transition-all duration-300 hover:border-[#D856BF] hover:text-[#D856BF] hover:shadow-[0_0_25px_rgba(216,86,191,0.5)] flex items-center justify-center overflow-hidden min-w-[200px]"
        >
          <span className="absolute top-0 left-0 w-full h-[2px] bg-[#D856BF] opacity-50 group-hover:opacity-100 transition-opacity" />
          <span className="relative z-10 flex items-center gap-2">
            Ver Día 1 <span className="text-[11px] opacity-60 font-mono">(25 Mayo)</span>
          </span>
        </a>

        {/* Botón Día 2 - Efecto LED Cian / Esmeralda */}
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
      style={{
        ...styles.landCard,
        borderTop: `4px solid ${land.color}`,
      }}
    >
      <span style={{ ...styles.landBadge, color: land.color }}>IGE LANDS</span>
      <h3 style={styles.landTitle}>{land.name}</h3>
      <p style={styles.landDesc}>{land.desc}</p>
      <div style={{ ...styles.landLink, color: land.color }}>
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
    backgroundColor: '#000',
    color: '#fff',
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
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), #000 95%)',
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
    color: '#ccc',
    maxWidth: 630,
    margin: '0 auto 2.5rem',
    lineHeight: 1.6,
  },
  divider: {
    border: 0,
    height: 1,
    background: 'linear-gradient(to right, transparent, #222, transparent)',
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
    color: '#888',
    marginBottom: '4rem',
    fontSize: '1rem',
  },
  landsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '1.5rem',
  },
  landCard: {
    backgroundColor: 'rgba(10, 10, 12, 0.55)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    padding: '2.5rem 2rem',
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s',
  },
  landBadge: {
    fontWeight: 'bold',
    fontSize: '0.75rem',
    letterSpacing: '0.15rem',
    display: 'block',
    marginBottom: '0.75rem',
  },
  landTitle: {
    fontSize: '1.4rem',
    margin: '0 0 1rem 0',
    fontWeight: 700,
    letterSpacing: '-0.01em',
  },
  landDesc: {
    color: '#aaa',
    fontSize: '0.95rem',
    lineHeight: 1.6,
    marginBottom: '2rem',
  },
  landLink: {
    fontSize: '0.9rem',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
};