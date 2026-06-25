'use client'

import { useState } from 'react'
import {
  HiOutlineQrcode,
  HiOutlineUserGroup,
  HiOutlineChartBar,
  HiOutlineLogin,
  HiOutlineX,
  HiOutlineShieldCheck,
} from 'react-icons/hi'

// ─── Components ─────────────────────────────────────────────────────────────

function GlassCard({ children, className = '', glowColor = 'cyan' }: { 
  children: React.ReactNode; 
  className?: string;
  glowColor?: 'cyan' | 'emerald' | 'purple'
}) {
  const glowStyles = {
    cyan: 'border-congreso-teal/30 shadow-[0_0_20px_rgba(0,151,167,0.15)]',
    emerald: 'border-congreso-emerald/30 shadow-[0_0_20px_rgba(0,184,148,0.15)]',
    purple: 'border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.15)]',
  }

  return (
    <div className={`relative rounded-2xl border bg-congreso-bgDark/60 backdrop-blur-xl overflow-hidden transition-all duration-300 ${glowStyles[glowColor]} ${className}`}>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      {children}
    </div>
  )
}

export default function EncargadoDashboardPage() {
  // Mock State para la Land (esto vendría de una DB/Metadata)
  const [landData] = useState({
    name: 'Developer Land',
    maxCapacity: 150,
  })

  const [visitasHoy, setVisitasHoy] = useState(84)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [lastScanned, setLastScanned] = useState<string | null>(null)
  const [userId, setUserId] = useState('')

  const currentCapacityPercent = Math.min(Math.round((visitasHoy / landData.maxCapacity) * 100), 100)

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    // Simulación de registro
    setVisitasHoy(prev => prev + 1)
    setLastScanned(userId)
    setUserId('')
    setIsModalOpen(false)

    // Feedback visual rápido
    setTimeout(() => setLastScanned(null), 5000)
  }

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto">
      
      {/* 1. Header Dinámico */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tighter uppercase">
            Panel de Control <span className="text-congreso-teal">—</span> 
            <span className="bg-gradient-to-r from-congreso-teal to-congreso-blue bg-clip-text text-transparent ml-2">
              {landData.name}
            </span>
          </h1>
          <p className="text-congreso-greyMed text-xs sm:text-sm font-mono mt-1">STATUS: OPERATIVO // SESIÓN_ACTIVA: STAFF_084</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-congreso-emerald/10 border border-congreso-emerald/30 rounded-full self-start md:self-auto">
          <div className="w-2 h-2 rounded-full bg-congreso-emerald animate-pulse" />
          <span className="text-congreso-emerald text-xs font-bold uppercase tracking-widest">En Vivo</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 2. Simulador de Escáner QR (Área Central) */}
        <section className="lg:col-span-2 space-y-6">
          <GlassCard className="p-8 sm:p-12 flex flex-col items-center justify-center text-center min-h-[350px] sm:min-h-[400px]" glowColor="cyan">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
            
            {/* HUD Decorative Elements */}
            <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-congreso-teal/50" />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-congreso-teal/50" />

            <div className="relative group cursor-pointer" onClick={() => setIsModalOpen(true)}>
              {/* Pulsing scanner ring */}
              <div className="absolute -inset-4 bg-congreso-teal/20 rounded-full blur-xl group-hover:bg-congreso-teal/30 transition-all duration-500 animate-pulse" />
              
              <button className="relative w-24 h-24 sm:w-32 sm:h-32 bg-congreso-dark border-2 border-congreso-teal rounded-2xl flex items-center justify-center text-congreso-teal group-hover:scale-110 transition-transform duration-300">
                <HiOutlineQrcode className="w-12 h-12 sm:w-16 sm:h-16" />
              </button>
            </div>

            <div className="mt-8 space-y-2">
              <h2 className="text-lg sm:text-xl font-bold text-white uppercase tracking-widest">Simulador de Escaneo</h2>
              <p className="text-congreso-greyMed text-xs sm:text-sm max-w-xs">Haz clic para simular la lectura del código QR de un asistente y registrar su entrada.</p>
            </div>

            <button 
              onClick={() => setIsModalOpen(true)}
              className="mt-8 px-6 sm:px-8 py-3 bg-congreso-teal text-congreso-dark font-black rounded-lg uppercase tracking-tighter hover:bg-congreso-teal/90 transition-colors shadow-[0_0_20px_rgba(0,151,167,0.4)] text-sm sm:text-base"
            >
              Simular Escaneo de Asistente
            </button>

            {/* Notificación de último escaneo */}
            {lastScanned && (
              <div className="absolute bottom-10 left-0 right-0 animate-bounce">
                <span className="bg-congreso-emerald/20 text-congreso-emerald border border-congreso-emerald/50 px-4 py-1.5 rounded-full text-xs font-bold uppercase">
                  ✓ Usuario {lastScanned} Registrado
                </span>
              </div>
            )}
          </GlassCard>
        </section>

        {/* 3. Métricas en Tiempo Real */}
        <aside className="space-y-6">
          
          {/* Métrica: Visitas Hoy */}
          <GlassCard className="p-6" glowColor="emerald">
            <div className="flex items-center gap-3 mb-4 text-congreso-emerald">
              <HiOutlineUserGroup className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-widest">Total Visitas Hoy</span>
            </div>
            <div className="relative">
              <span className="text-5xl sm:text-6xl font-black text-white drop-shadow-[0_0_15px_rgba(0,184,148,0.5)]">
                {visitasHoy}
              </span>
              <span className="ml-2 text-congreso-emerald text-sm font-bold">+12%</span>
            </div>
            <div className="mt-4 h-1 w-full bg-congreso-emerald/20 rounded-full overflow-hidden">
              <div className="h-full bg-congreso-emerald w-2/3 animate-shimmer" />
            </div>
          </GlassCard>

          {/* Métrica: Capacidad Stand */}
          <GlassCard className="p-6" glowColor="purple">
            <div className="flex items-center justify-between mb-4 text-purple-400">
              <div className="flex items-center gap-3">
                <HiOutlineChartBar className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-widest">Capacidad Actual</span>
              </div>
              <span className="text-xs font-mono">{visitasHoy}/{landData.maxCapacity}</span>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <span className="text-2xl sm:text-3xl font-black text-white">{currentCapacityPercent}%</span>
                <span className="text-[10px] text-gray-500 uppercase font-bold pb-1">Ocupación</span>
              </div>
              
              {/* Tailwind Progress Bar Estilizada */}
              <div className="relative w-full h-4 bg-congreso-dark rounded-full border border-white/5 p-1 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${
                    currentCapacityPercent > 90 ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : 
                    currentCapacityPercent > 70 ? 'bg-congreso-orange shadow-[0_0_10px_#FF7A00]' : 
                    'bg-congreso-teal shadow-[0_0_10px_#0097A7]'
                  }`}
                  style={{ width: `${currentCapacityPercent}%` }}
                />
              </div>
              <p className="text-[10px] text-congreso-greyMed italic">Actualizado automáticamente cada 30s</p>
            </div>
          </GlassCard>

          <div className="p-4 border border-white/5 rounded-xl bg-white/[0.02]">
            <h4 className="text-[10px] font-bold text-congreso-greyMed uppercase tracking-[0.2em] mb-3">Logs de Actividad</h4>
            <div className="space-y-2 font-mono text-[10px]">
              <p className="text-gray-400"><span className="text-congreso-teal">14:20:01</span> User IGE-902 Entrada</p>
              <p className="text-gray-400"><span className="text-congreso-teal">14:18:45</span> User IGE-112 Entrada</p>
              <p className="text-gray-600 tracking-tighter"> Esperando nuevos datos...</p>
            </div>
          </div>
        </aside>
      </div>

      {/* Modal de Simulación de Escaneo */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-congreso-bgDark/80 backdrop-blur-md">
          <div className="w-full max-w-md animate-scaleIn">
            <GlassCard className="p-8" glowColor="cyan">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <HiOutlineShieldCheck className="text-congreso-teal" />
                  Validar Asistente
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                  <HiOutlineX className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleScan} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-congreso-teal uppercase tracking-widest mb-1.5 text-left">ID del Usuario (Badge)</label>
                  <input 
                    autoFocus
                    type="text" 
                    placeholder="Ej: IGE-2026-XXXX"
                    className="w-full bg-congreso-dark border border-white/10 rounded-lg px-4 py-3 text-white font-mono focus:border-congreso-teal focus:outline-none focus:ring-1 focus:ring-congreso-teal transition-all"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-congreso-teal to-congreso-blue text-white font-bold rounded-lg uppercase tracking-widest flex items-center justify-center gap-2 hover:from-congreso-teal/90 hover:to-congreso-blue/90 transition-all shadow-lg"
                >
                  <HiOutlineLogin className="w-5 h-5" />
                  Registrar Visita
                </button>
              </form>
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  )
}