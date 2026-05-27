import { createClient } from "@/src/lib/supabase/server";
import { redirect } from "next/navigation";
import React from "react";

// Mock Data para la vista de usuarios (se integrará con la DB después)
const MOCK_USERS = [
  { id: 1, name: "David Tech", email: "david@example.com", land: "Developer", status: "Confirmado" },
  { id: 2, name: "Sofia Creative", email: "sofia@design.com", land: "Creative", status: "Confirmado" },
  { id: 3, name: "Lucas Block", email: "lucas@web3.com", land: "Blockchain", status: "Pendiente" },
  { id: 4, name: "Marta Admin", email: "marta@business.com", land: "Business", status: "Confirmado" },
  { id: 5, name: "Victor Dev", email: "victor@code.com", land: "Developer", status: "Cancelado" },
];

const LAND_COLORS: Record<string, string> = {
  Developer: "#03B3C3",
  Creative: "#D856BF",
  Blockchain: "#ff102a",
  Business: "#f1eece",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Verificación de sesión Server-Side
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-[#000] text-white font-sans selection:bg-[#03B3C3]/30">
      {/* Sidebar Minimalista - Estilo Google Futursita */}
      <aside className="w-64 border-r border-white/10 bg-[#0d0e12] flex flex-col p-6 hidden lg:flex">
        <div className="mb-10">
          <h2 className="text-xl font-black tracking-tighter text-[#03B3C3] uppercase italic">
            IGE <span className="text-white">Admin</span>
          </h2>
        </div>
        
        <nav className="flex-1 space-y-2">
          <SidebarItem label="Dashboard" active />
          <SidebarItem label="Usuarios" />
          <SidebarItem label="Conferencias" />
          <SidebarItem label="Configuración" />
        </nav>

        <div className="pt-6 border-t border-white/10 mt-auto">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#03B3C3] to-[#D856BF]" />
            <div className="overflow-hidden">
              <p className="text-[11px] font-bold truncate uppercase tracking-tight">{user.email?.split('@')[0]}</p>
              <p className="text-[9px] text-[#aaa] uppercase tracking-widest font-mono">Root Access</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Contenedor Principal */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto bg-[radial-gradient(circle_at_top_right,#03B3C310,transparent_40%)]">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-widest uppercase mb-1">Centro de Comando</h1>
            <p className="text-[#aaa] text-sm tracking-wide">Gestionando el futuro de la industria digital.</p>
          </div>
          
          <div className="flex gap-3">
             <button className="px-5 py-2 bg-white/5 border border-white/10 rounded-md text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-white/10 transition-all">
                Exportar CSV
             </button>
             <button className="px-5 py-2 bg-[#03B3C3]/10 border border-[#03B3C3]/40 text-[#03B3C3] rounded-md text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-[#03B3C3]/20 hover:shadow-[0_0_15px_rgba(3,179,195,0.3)] transition-all">
                Nuevo Usuario +
             </button>
          </div>
        </header>

        {/* KPI Cards Section */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
          <KpiCard label="Asistentes Registrados" value="1,428" color="#03B3C3" trend="+14% este mes" />
          <KpiCard label="Sesiones Activas" value="12" color="#D856BF" trend="En vivo ahora" />
          <KpiCard label="Capacidad Teatro" value="92%" color="#10B981" trend="Casi lleno" />
        </section>

        {/* Vista de Usuarios - Tabla Estilizada */}
        <section className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:border-white/20">
          <div className="p-6 border-b border-white/10 bg-white/5 flex justify-between items-center">
            <h3 className="text-sm font-bold tracking-[0.3em] uppercase text-[#aaa]">Base de Datos de Talentos</h3>
            <div className="px-3 py-1 bg-black/50 border border-white/10 rounded font-mono text-[10px] text-white/40">
              SYNC: ONLINE_STABLE
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[#666] text-[10px] uppercase tracking-[0.2em] border-b border-white/5">
                  <th className="px-8 py-5 font-bold">Identidad / Contacto</th>
                  <th className="px-8 py-5 font-bold">Eje Temático (Land)</th>
                  <th className="px-8 py-5 font-bold">Status</th>
                  <th className="px-8 py-5 font-bold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {MOCK_USERS.map((u) => (
                  <tr key={u.id} className="group hover:bg-[#03B3C3]/5 transition-all duration-300">
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold tracking-tight text-white/90 group-hover:text-[#03B3C3] transition-colors">{u.name}</span>
                        <span className="text-xs text-[#666] font-mono mt-0.5">{u.email}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <LandBadge land={u.land} />
                    </td>
                    <td className="px-8 py-6">
                       <StatusBadge status={u.status} />
                    </td>
                    <td className="px-8 py-6 text-right">
                       <button className="text-white/20 hover:text-white transition-all transform hover:scale-110">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

/* --- Componentes de UI Internos --- */

function SidebarItem({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <div className={`group px-4 py-3 rounded-xl flex items-center gap-4 cursor-pointer transition-all duration-300 ${
      active 
        ? 'bg-[#03B3C3]/10 text-[#03B3C3] border border-[#03B3C3]/30 shadow-[inset_0_0_10px_rgba(3,179,195,0.1)]' 
        : 'text-[#aaa] hover:text-white hover:bg-white/5 border border-transparent'
    }`}>
      <div className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
        active ? 'bg-[#03B3C3] shadow-[0_0_10px_#03B3C3]' : 'bg-white/20 group-hover:bg-white/40'
      }`} />
      <span className="text-xs font-bold uppercase tracking-[0.15em]">{label}</span>
    </div>
  );
}

function KpiCard({ label, value, color, trend }: { label: string; value: string; color: string; trend: string }) {
  return (
    <div className="relative group bg-[#0d0e12]/80 backdrop-blur-xl border border-white/10 p-8 rounded-2xl overflow-hidden transition-all duration-500 hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(0,0,0,0.6)]">
      {/* Neon Top Bar */}
      <div 
        className="absolute top-0 left-0 w-full h-[2px] opacity-40 group-hover:opacity-100 transition-all duration-500"
        style={{ 
          backgroundColor: color, 
          boxShadow: `0 0 20px ${color}, 0 0 40px ${color}` 
        }}
      />
      
      <p className="text-[10px] uppercase tracking-[0.25em] text-[#666] font-black mb-4">{label}</p>
      <div className="flex flex-col gap-1">
        <h4 className="text-4xl font-black tracking-tighter" style={{ color: color }}>{value}</h4>
        <p className="text-[11px] text-[#444] font-mono uppercase mt-1 italic group-hover:text-white/40 transition-colors">
          {trend}
        </p>
      </div>
      
      {/* Ambient Glow */}
      <div 
        className="absolute -right-8 -bottom-8 w-32 h-32 blur-[60px] opacity-10 rounded-full transition-opacity group-hover:opacity-20"
        style={{ backgroundColor: color }}
      />
    </div>
  );
}

function LandBadge({ land }: { land: string }) {
  const color = LAND_COLORS[land] || "#fff";
  return (
    <span 
      className="inline-flex items-center px-3 py-1 rounded-md text-[9px] font-black tracking-widest uppercase border border-opacity-20"
      style={{ 
        color: color, 
        borderColor: color, 
        backgroundColor: `${color}08`,
        textShadow: `0 0 8px ${color}40`
      }}
    >
      <span className="w-1 h-1 rounded-full mr-2" style={{ backgroundColor: color }} />
      {land}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, string> = {
    Confirmado: "#10B981",
    Pendiente: "#F59E0B",
    Cancelado: "#EF4444",
  };
  const color = config[status] || "#aaa";
  
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
        <div className="absolute inset-0 w-2 h-2 rounded-full animate-ping opacity-40" style={{ backgroundColor: color }} />
      </div>
      <span className="text-[11px] font-bold uppercase tracking-wider text-white/70">{status}</span>
    </div>
  );
}