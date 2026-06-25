export const dynamic = 'force-dynamic';

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { signOut } from "./actions";
import React, { Suspense } from "react";

// Mapeo de colores basado en la Land de Interés
const THEME_MAP: Record<string, { color: string; label: string; shadow: string }> = {
  'dev': { color: "#03B3C3", label: "Developer Land", shadow: "rgba(3,179,195,0.3)" },
  'creative': { color: "#D856BF", label: "Creative Land", shadow: "rgba(216,86,191,0.3)" },
  'blockchain': { color: "#ff102a", label: "Blockchain Land", shadow: "rgba(255,16,42,0.3)" },
  'business': { color: "#f1eece", label: "Business Land", shadow: "rgba(241,238,206,0.3)" },
  // Fallbacks por si el string guardado es el nombre completo de la land
  'Developer Land': { color: "#03B3C3", label: "Developer Land", shadow: "rgba(3,179,195,0.3)" },
  'Creative Land': { color: "#D856BF", label: "Creative Land", shadow: "rgba(216,86,191,0.3)" },
  'Blockchain Land': { color: "#ff102a", label: "Blockchain Land", shadow: "rgba(255,16,42,0.3)" },
  'Business Land': { color: "#f1eece", label: "Business Land", shadow: "rgba(241,238,206,0.3)" },
};

export default async function AuthPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Protección de ruta: Si no hay usuario, al Login
  if (!user) {
    redirect("/login");
  }

  // Extraer metadatos (configurados en el SignUp)
  const fullName = user.user_metadata?.full_name || "Talento IGE";
  const landKey = user.user_metadata?.land_interest || "dev";
  const theme = THEME_MAP[landKey] || THEME_MAP['dev'];

  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Cargando...</div>}>
    <div className="flex min-h-screen bg-[#000] text-white font-sans selection:bg-white/20">
      {/* Sidebar Minimalista (Google Clean Style) */}
      <aside className="w-72 border-r border-white/10 bg-[#0d0e12] flex flex-col hidden md:flex">
        <div className="p-8">
          <h2 className="text-2xl font-black tracking-tighter uppercase italic">
            IGE <span style={{ color: theme.color }}>DASH</span>
          </h2>
          <p className="text-[10px] text-[#555] tracking-[0.3em] font-bold mt-1 uppercase">
            Control Panel v1.0
          </p>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <SidebarLink label="Inicio" active color={theme.color} />
          <SidebarLink label="Mi Perfil" />
          <SidebarLink label="Mi Agenda" />
          <SidebarLink label="Talleres" />
          <SidebarLink label="Certificados" />
        </nav>

        <div className="p-6 mt-auto border-t border-white/5">
          <div className="flex items-center gap-3 mb-6 px-2">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-black text-sm"
              style={{ backgroundColor: theme.color }}
            >
              {fullName.substring(0, 2).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold truncate tracking-tight">{fullName}</p>
              <p className="text-[10px] text-[#aaa] font-mono">{theme.label}</p>
            </div>
          </div>

          <form action={signOut}>
            <button className="w-full py-3 px-4 bg-white/5 hover:bg-red-500/10 hover:text-red-500 border border-white/10 hover:border-red-500/50 rounded-xl text-[11px] font-bold tracking-widest uppercase transition-all duration-300">
              Cerrar Sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Área Principal de Contenido */}
      <main 
        className="flex-1 p-6 md:p-12 overflow-y-auto relative"
        style={{ 
          backgroundImage: `radial-gradient(circle at top right, ${theme.color}15, transparent 45%)` 
        }}
      >
        {/* Header Dinámico */}
        <header className="flex justify-between items-start mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: theme.color }} />
              <span className="text-[10px] font-mono tracking-[0.3em] text-[#666] uppercase">System Online</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase">
              Dashboard
            </h1>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tarjeta de Bienvenida Principal (Glassmorphism) */}
          <section className="lg:col-span-2 relative group overflow-hidden bg-black/40 backdrop-blur-xl border border-white/10 p-10 rounded-3xl transition-all duration-500 hover:border-white/20">
            {/* Glow dinámico basado en la Land */}
            <div 
              className="absolute top-0 left-0 w-full h-[3px] transition-all duration-500 group-hover:shadow-[0_0_20px_2px]"
              style={{ backgroundColor: theme.color, boxShadow: `0 0 15px ${theme.color}60` }}
            />
            
            <div className="relative z-10">
              <h3 className="text-lg font-bold text-[#aaa] mb-2 tracking-wide">¡Hola de nuevo!</h3>
              <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight leading-none">
                Bienvenido de vuelta,<br />
                <span style={{ color: theme.color }}>{fullName.split(' ')[0]}</span>
              </h2>
              <p className="text-[#888] leading-relaxed max-w-xl mb-8">
                Estamos listos para tu experiencia en <span className="text-white font-bold">{theme.label}</span>. 
                Revisa tu agenda personalizada y no te pierdas los workshops de inteligencia artificial.
              </p>
              <button 
                className="px-8 py-3 rounded-full font-bold text-xs tracking-widest uppercase transition-all"
                style={{ backgroundColor: theme.color, color: landKey === 'business' ? '#000' : '#fff' }}
              >
                Ver mi agenda →
              </button>
            </div>

            {/* Elemento Decorativo */}
            <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none uppercase font-black text-8xl italic">
              {landKey.substring(0, 3)}
            </div>
          </section>

          {/* Sidebar de Estados Rápidos */}
          <div className="space-y-6">
            <KpiCard 
              label="Estado del Acceso" 
              value="Confirmado" 
              color={theme.color} 
              sub="Boleto Digital Activo"
            />
            <KpiCard 
              label="IGE Points" 
              value="1,250" 
              color="#10B981" 
              sub="Canjeables en la Land"
            />
            <KpiCard 
              label="Conferencias" 
              value="04" 
              color={theme.color} 
              sub="Próximas 24 horas"
            />
          </div>
        </div>

        {/* Sección de Mensajes del Sistema */}
        <footer className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-[10px] font-mono text-[#444] uppercase tracking-[0.2em]">
            Node_ID: {user.id.substring(0, 8)} {'//'} Sec_Level: L3
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-[10px] text-[#666] hover:text-white transition-colors uppercase tracking-widest font-bold">Soporte Técnico</a>
            <a href="#" className="text-[10px] text-[#666] hover:text-white transition-colors uppercase tracking-widest font-bold">Reglamento</a>
          </div>
        </footer>
      </main>
    </div>
    </Suspense>
  );
}

/* --- Sub-componentes Estilizados --- */

function SidebarLink({ label, active = false, color }: { label: string; active?: boolean; color?: string }) {
  return (
    <div 
      className={`flex items-center gap-4 px-6 py-3.5 rounded-2xl cursor-pointer transition-all duration-300 group ${
        active 
          ? 'bg-white/5 border border-white/10' 
          : 'text-[#666] hover:text-white hover:bg-white/[0.02]'
      }`}
    >
      <div 
        className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
          active ? 'scale-125' : 'bg-transparent group-hover:bg-white/20'
        }`} 
        style={active ? { backgroundColor: color, boxShadow: `0 0 10px ${color}` } : {}}
      />
      <span className={`text-xs font-bold uppercase tracking-[0.2em] ${active ? 'text-white' : ''}`}>
        {label}
      </span>
    </div>
  );
}

function KpiCard({ label, value, color, sub }: { label: string; value: string; color: string; sub: string }) {
  return (
    <div className="bg-[#0d0e12] border border-white/10 p-6 rounded-2xl relative overflow-hidden group hover:border-white/20 transition-all duration-300">
      {/* LED vertical lateral */}
      <div 
        className="absolute left-0 top-1/4 w-[2px] h-1/2 opacity-50 group-hover:opacity-100 group-hover:h-3/4 transition-all duration-500" 
        style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }}
      />
      
      <p className="text-[10px] font-black text-[#555] uppercase tracking-[0.2em] mb-4">{label}</p>
      <div className="flex flex-col">
        <h4 className="text-3xl font-black tracking-tighter transition-all duration-300 group-hover:scale-105 origin-left" style={{ color }}>
          {value}
        </h4>
        <span className="text-[10px] text-[#777] font-mono mt-1 uppercase italic tracking-wider">{sub}</span>
      </div>

      <div 
        className="absolute -right-4 -bottom-4 w-16 h-16 blur-[40px] opacity-10 rounded-full transition-opacity group-hover:opacity-30"
        style={{ backgroundColor: color }}
      />
    </div>
  );
}