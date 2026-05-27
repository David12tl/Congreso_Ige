'use client';

import Navbar from '../../src/components/ui/navbar';
import Footer from '../../src/components/ui/Footer';
import { FiShield, FiDatabase, FiTarget, FiLock } from 'react-icons/fi';

export default function PrivacidadPage() {
  const lastUpdate = "27 de mayo de 2026";

  return (
    <main className="min-h-screen bg-slate-950 text-slate-300 selection:bg-cyan-500/30 font-sans overflow-x-hidden">
      <div className="relative z-50">
        <Navbar />
      </div>

      <div className="relative pt-40 pb-24 px-4 min-h-[calc(100vh-80px)]">
        {/* Luces de ambiente (Ambient Neon) */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto relative z-10">
          {/* Header de Sección */}
          <header className="mb-16 text-center animate-fadeIn">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-[10px] font-bold tracking-[0.3em] text-cyan-400 uppercase border border-cyan-400/20 rounded-full bg-cyan-400/5 backdrop-blur-sm">
              <FiShield className="w-3 h-3" /> Protección de Datos
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase mb-6 leading-tight">
              Aviso de <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Privacidad</span>
            </h1>
            <p className="text-slate-500 text-sm font-mono uppercase tracking-[0.2em]">
              Última actualización: {lastUpdate}
            </p>
          </header>

          {/* Contenido Estructurado */}
          <div className="grid gap-6 md:gap-8">
            
            {/* 01. Responsable */}
            <section className="group relative bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-8 hover:border-cyan-500/30 transition-all duration-500 shadow-xl">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform duration-500">
                  <FiShield className="w-6 h-6" />
                </div>
                <div className="space-y-3">
                  <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                    01. Responsable del Tratamiento de Datos
                  </h2>
                  <p className="text-slate-400 leading-relaxed">
                    El comité organizador del Congreso IGE de Campus Zongolica es el responsable del resguardo y uso de la información recolectada en esta plataforma, garantizando que el tratamiento de los datos personales se realice de acuerdo con los principios de licitud y transparencia.
                  </p>
                </div>
              </div>
            </section>

            {/* 02. Datos Recabados */}
            <section className="group relative bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-8 hover:border-blue-500/30 transition-all duration-500 shadow-xl">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform duration-500">
                  <FiDatabase className="w-6 h-6" />
                </div>
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    02. Datos Recabados
                  </h2>
                  <p className="text-slate-400 leading-relaxed">
                    Para el funcionamiento óptimo del sistema y la gestión operativa del evento, recolectamos únicamente la siguiente información:
                  </p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {['Nombre completo', 'Correo electrónico (Google Auth)', 'Unidad Académica', 'Estado del pago'].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-slate-300 font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-red-400/80 font-mono mt-4 flex items-center gap-2 italic">
                    <FiLock className="w-3 h-3" /> No se almacena ninguna información bancaria o crediticia.
                  </p>
                </div>
              </div>
            </section>

            {/* 03. Finalidad */}
            <section className="group relative bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-8 hover:border-cyan-500/30 transition-all duration-500 shadow-xl">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform duration-500">
                  <FiTarget className="w-6 h-6" />
                </div>
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    03. Finalidad del Tratamiento
                  </h2>
                  <p className="text-slate-400 leading-relaxed">
                    Sus datos serán utilizados estrictamente para los siguientes propósitos operativos:
                  </p>
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                      <p className="text-sm text-slate-300 leading-relaxed">
                        <strong className="text-cyan-400">Acceso Físico:</strong> Validar su entrada a las conferencias en el Teatro Metropolitano de Orizaba mediante el código QR.
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                      <p className="text-sm text-slate-300 leading-relaxed">
                        <strong className="text-cyan-400">Gestión de Pagos:</strong> Permitir a los Encargados identificar los pagos pendientes de su respectiva sede asignada.
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                      <p className="text-sm text-slate-300 leading-relaxed">
                        <strong className="text-cyan-400">Métricas:</strong> Generar gráficas estadísticas en tiempo real para el uso exclusivo del Administrador global.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 04. Seguridad */}
            <section className="group relative bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-8 hover:border-blue-500/30 transition-all duration-500 shadow-xl">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform duration-500">
                  <FiLock className="w-6 h-6" />
                </div>
                <div className="space-y-3">
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    04. Seguridad y Almacenamiento
                  </h2>
                  <p className="text-slate-400 leading-relaxed">
                    Los datos están protegidos mediante las políticas de seguridad <strong className="text-white">RLS (Row Level Security)</strong> directamente en la infraestructura en la nube de <strong className="text-cyan-400">Supabase</strong>, impidiendo que usuarios de nivel básico o externos intercepten la información de los otros sistemas o perfiles ajenos.
                  </p>
                </div>
              </div>
            </section>

          </div>

          {/* Footer de sección */}
          <div className="mt-20 text-center border-t border-white/5 pt-12">
            <p className="text-slate-500 text-xs font-mono tracking-widest uppercase">
              // Protocolo de Privacidad Congreso IGE 2026 //
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-10">
        <Footer />
      </div>
    </main>
  );
}