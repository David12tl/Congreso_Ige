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
import { GlassCard } from '@/components/ui/GlassCard'

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
          <h1 className="font-black tracking-tight text-[#1E2A39] text-2xl md:text-3xl">
            Panel de Control <span className="text-[#8B1E23]">—</span> 
            <span className="text-[#8B1E23] ml-2">
              {landData.name}
            </span>
          </h1>
          <p className="text-slate-500 text-xs font-light mt-1">STATUS: OPERATIVO // SESIÓN_ACTIVA: STAFF_084</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full self-start md:self-auto">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-emerald-700 text-xs font-bold uppercase tracking-widest">En Vivo</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 2. Simulador de Escáner QR (Área Central) */}
        <section className="lg:col-span-2 space-y-6">
          <GlassCard className="p-8 sm:p-12 flex flex-col items-center justify-center text-center min-h-[350px] sm:min-h-[400px]" glowColor="cyan">
            
            {/* HUD Decorative Elements */}
            <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-cyan-200" />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-cyan-200" />

            <div className="relative group cursor-pointer" onClick={() => setIsModalOpen(true)}>
              {/* Pulsing scanner ring */}
              <div className="absolute -inset-4 bg-cyan-100 rounded-full blur-xl group-hover:bg-cyan-200 transition-all duration-500 animate-pulse" />
              
              <button className="relative w-24 h-24 sm:w-32 sm:h-32 bg-white border-2 border-cyan-200 rounded-[24px] flex items-center justify-center text-cyan-700 group-hover:scale-110 transition-transform duration-300">
                <HiOutlineQrcode className="w-12 h-12 sm:w-16 sm:h-16" />
              </button>
            </div>

            <div className="mt-8 space-y-2">
              <h2 className="text-lg font-bold text-[#1E2A39] uppercase tracking-widest">Simulador de Escaneo</h2>
              <p className="text-slate-500 text-xs max-w-xs font-light">Haz clic para simular la lectura del código QR de un asistente y registrar su entrada.</p>
            </div>

            <button 
              onClick={() => setIsModalOpen(true)}
              className="mt-8 px-6 sm:px-8 py-3 bg-[#8B1E23] text-white font-bold rounded-xl uppercase tracking-tight flex items-center justify-center gap-2 hover:bg-[#70181D] transition shadow-sm"
            >
              Simular Escaneo de Asistente
            </button>

            {/* Notificación de último escaneo */}
            {lastScanned && (
              <div className="absolute bottom-10 left-0 right-0 animate-bounce">
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-1.5 rounded-full text-xs font-bold uppercase">
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
            <div className="flex items-center gap-3 mb-4 text-emerald-700">
              <HiOutlineUserGroup className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-widest">Total Visitas Hoy</span>
            </div>
            <div className="relative">
              <span className="text-5xl sm:text-6xl font-black text-[#1E2A39]">
                {visitasHoy}
              </span>
              <span className="ml-2 text-emerald-700 text-sm font-bold">+12%</span>
            </div>
            <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-2/3 animate-shimmer" />
            </div>
          </GlassCard>

          {/* Métrica: Capacidad Stand */}
          <GlassCard className="p-6" glowColor="purple">
            <div className="flex items-center justify-between mb-4 text-purple-700">
              <div className="flex items-center gap-3">
                <HiOutlineChartBar className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-widest">Capacidad Actual</span>
              </div>
              <span className="text-xs font-light">{visitasHoy}/{landData.maxCapacity}</span>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <span className="text-2xl sm:text-3xl font-black text-[#1E2A39]">{currentCapacityPercent}%</span>
                <span className="text-[10px] text-slate-500 uppercase font-bold pb-1">Ocupación</span>
              </div>
              
              {/* Tailwind Progress Bar Estilizada */}
              <div className="relative w-full h-4 bg-slate-100 rounded-full border border-slate-200 p-1 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${
                    currentCapacityPercent > 90 ? 'bg-red-500' : 
                    currentCapacityPercent > 70 ? 'bg-amber-500' : 
                    'bg-cyan-500'
                  }`}
                  style={{ width: `${currentCapacityPercent}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-500 font-light italic">Actualizado automáticamente cada 30s</p>
            </div>
          </GlassCard>

          <div className="p-4 border border-slate-200 rounded-xl bg-slate-50">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-3">Logs de Actividad</h4>
            <div className="space-y-2 font-light text-[10px]">
              <p className="text-slate-500"><span className="text-cyan-700">14:20:01</span> User IGE-902 Entrada</p>
              <p className="text-slate-500"><span className="text-cyan-700">14:18:45</span> User IGE-112 Entrada</p>
              <p className="text-slate-400 tracking-tighter"> Esperando nuevos datos...</p>
            </div>
          </div>
        </aside>
      </div>

      {/* Modal de Simulación de Escaneo */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md animate-scaleIn">
            <GlassCard className="p-8" glowColor="cyan">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-[#1E2A39] flex items-center gap-2">
                  <HiOutlineShieldCheck className="text-cyan-700" />
                  Validar Asistente
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-[#1E2A39] transition-colors">
                  <HiOutlineX className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleScan} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-cyan-700 uppercase tracking-widest mb-1.5 text-left">ID del Usuario (Badge)</label>
                  <input 
                    autoFocus
                    type="text" 
                    placeholder="Ej: IGE-2026-XXXX"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-[#1E2A39] font-light focus:border-[#8B1E23] focus:bg-white transition-all"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full py-3 bg-[#8B1E23] text-white font-bold rounded-xl uppercase tracking-tight flex items-center justify-center gap-2 hover:bg-[#70181D] transition shadow-sm"
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