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
    cyan: 'border-cyan-500/30 shadow-[0_0_20px_rgba(34,211,238,0.15)]',
    emerald: 'border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.15)]',
    purple: 'border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.15)]',
  }

  return (
    <div className={`relative rounded-2xl border bg-slate-900/40 backdrop-blur-xl overflow-hidden transition-all duration-300 ${glowStyles[glowColor]} ${className}`}>
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
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase">
            Panel de Control <span className="text-cyan-400">—</span> 
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent ml-2">
              {landData.name}
            </span>
          </h1>
          <p className="text-gray-500 text-sm font-mono mt-1">STATUS: OPERATIVO // SESIÓN_ACTIVA: STAFF_084</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">En Vivo</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 2. Simulador de Escáner QR (Área Central) */}
        <section className="lg:col-span-2 space-y-6">
          <GlassCard className="p-12 flex flex-col items-center justify-center text-center min-h-[400px]" glowColor="cyan">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
            
            {/* HUD Decorative Elements */}
            <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-cyan-500/50" />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-cyan-500/50" />

            <div className="relative group cursor-pointer" onClick={() => setIsModalOpen(true)}>
              {/* Pulsing scanner ring */}
              <div className="absolute -inset-4 bg-cyan-500/20 rounded-full blur-xl group-hover:bg-cyan-400/30 transition-all duration-500 animate-pulse" />
              
              <button className="relative w-32 h-32 bg-slate-950 border-2 border-cyan-500 rounded-2xl flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform duration-300">
                <HiOutlineQrcode className="w-16 h-16" />
              </button>
            </div>

            <div className="mt-8 space-y-2">
              <h2 className="text-xl font-bold text-white uppercase tracking-widest">Simulador de Escaneo</h2>
              <p className="text-gray-400 text-sm max-w-xs">Haz clic para simular la lectura del código QR de un asistente y registrar su entrada.</p>
            </div>

            <button 
              onClick={() => setIsModalOpen(true)}
              className="mt-8 px-8 py-3 bg-cyan-500 text-slate-950 font-black rounded-lg uppercase tracking-tighter hover:bg-cyan-400 transition-colors shadow-[0_0_20px_rgba(34,211,238,0.4)]"
            >
              Simular Escaneo de Asistente
            </button>

            {/* Notificación de último escaneo */}
            {lastScanned && (
              <div className="absolute bottom-10 left-0 right-0 animate-bounce">
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 px-4 py-1.5 rounded-full text-xs font-bold uppercase">
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
            <div className="flex items-center gap-3 mb-4 text-emerald-400">
              <HiOutlineUserGroup className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-widest">Total Visitas Hoy</span>
            </div>
            <div className="relative">
              <span className="text-6xl font-black text-white drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                {visitasHoy}
              </span>
              <span className="ml-2 text-emerald-500 text-sm font-bold">+12%</span>
            </div>
            <div className="mt-4 h-1 w-full bg-emerald-500/20 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-2/3 animate-shimmer" />
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
                <span className="text-3xl font-black text-white">{currentCapacityPercent}%</span>
                <span className="text-[10px] text-gray-500 uppercase font-bold pb-1">Ocupación</span>
              </div>
              
              {/* Tailwind Progress Bar Estilizada */}
              <div className="relative w-full h-4 bg-slate-950 rounded-full border border-white/5 p-1 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${
                    currentCapacityPercent > 90 ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : 
                    currentCapacityPercent > 70 ? 'bg-amber-500 shadow-[0_0_10px_#f59e0b]' : 
                    'bg-purple-500 shadow-[0_0_10px_#a855f7]'
                  }`}
                  style={{ width: `${currentCapacityPercent}%` }}
                />
              </div>
              <p className="text-[10px] text-gray-500 italic">Actualizado automáticamente cada 30s</p>
            </div>
          </GlassCard>

          <div className="p-4 border border-white/5 rounded-xl bg-white/[0.02]">
            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-3">Logs de Actividad</h4>
            <div className="space-y-2 font-mono text-[10px]">
              <p className="text-gray-400"><span className="text-cyan-500">14:20:01</span> User IGE-902 Entrada</p>
              <p className="text-gray-400"><span className="text-cyan-500">14:18:45</span> User IGE-112 Entrada</p>
              <p className="text-gray-600 tracking-tighter"> Esperando nuevos datos...</p>
            </div>
          </div>
        </aside>
      </div>

      {/* Modal de Simulación de Escaneo */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md animate-scaleIn">
            <GlassCard className="p-8" glowColor="cyan">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <HiOutlineShieldCheck className="text-cyan-400" />
                  Validar Asistente
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                  <HiOutlineX className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleScan} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-cyan-500 uppercase tracking-widest mb-1.5 text-left">ID del Usuario (Badge)</label>
                  <input 
                    autoFocus
                    type="text" 
                    placeholder="Ej: IGE-2026-XXXX"
                    className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-3 text-white font-mono focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-lg uppercase tracking-widest flex items-center justify-center gap-2 hover:from-cyan-500 hover:to-blue-500 transition-all shadow-lg"
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