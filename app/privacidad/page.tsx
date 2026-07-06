'use client';

import React, { useEffect } from 'react';
import Navbar from '../../src/components/ui/navbar';
import Footer from '../../src/components/ui/Footer';

/**
 * Página de Aviso de Privacidad
 * Estética: Línea Clara, Tipografía Sora y Bloques Bento-Clean Integrados
 */
export default function PrivacidadPage() {
  const lastUpdate = "27 de mayo de 2026";

  useEffect(() => {
    // Inyección dinámica de tipografía Sora y Material Symbols
    const linkSora = document.createElement('link');
    linkSora.href = 'https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap';
    linkSora.rel = 'stylesheet';
    document.head.appendChild(linkSora);

    const linkIcons = document.createElement('link');
    linkIcons.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
    linkIcons.rel = 'stylesheet';
    document.head.appendChild(linkIcons);

    // Intersection Observer para transiciones de scroll fluidas
    const observerOptions = { threshold: 0.05 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100', 'translate-y-0');
          entry.target.classList.remove('translate-y-10', 'opacity-0');
        }
      });
    }, observerOptions);

    const elementsToAnimate = document.querySelectorAll('.animate-on-scroll');
    elementsToAnimate.forEach((el) => {
      el.classList.add('transition-all', 'duration-700', 'translate-y-10', 'opacity-0');
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const styles = {
    iconSettings: {
      fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"
    }
  };

  return (
    <div className="bg-[#f4fbf6] text-[#161d1a] font-['Sora'] overflow-x-hidden min-h-screen antialiased selection:bg-[#006b55] selection:text-white">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 md:px-16 pt-36 pb-24">
        
        {/* ─── HEADER DE LA PÁGINA ─── */}
        <header className="mb-16 text-center animate-on-scroll">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-xs font-bold tracking-wider text-[#006874] uppercase border border-[#bbcac3] rounded-full bg-white shadow-sm">
            <span className="material-symbols-outlined text-sm" style={styles.iconSettings}>shield</span> 
            Protección de Datos
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tighter text-[#161d1a] uppercase mb-4 leading-tight">
            Aviso de <span className="text-[#006b55]">Privacidad</span>
          </h1>
          <p className="text-[#6c7a74] text-xs font-bold uppercase tracking-widest">
            Última actualización: {lastUpdate}
          </p>
        </header>

        {/* ─── CONTENIDO ESTRUCTURADO BENTO-CLEAN ─── */}
        <div className="grid gap-8">
          
          {/* 01. Responsable */}
          <section className="animate-on-scroll group relative bg-white border border-[#bbcac3] rounded-xl p-8 transition-all duration-300 hover:border-[#006b55] hover:shadow-lg hover:shadow-[#006b55]/5 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start gap-5">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[#eef5f0] border border-[#bbcac3] flex items-center justify-center text-[#006b55] group-hover:bg-[#006b55] group-hover:text-white group-hover:border-transparent transition-all duration-300">
                <span className="material-symbols-outlined text-2xl" style={styles.iconSettings}>admin_panel_settings</span>
              </div>
              <div className="space-y-2 flex-1">
                <h2 className="text-base md:text-lg font-bold text-[#161d1a] tracking-tight flex items-center gap-2">
                  01. Responsable del Tratamiento de Datos
                </h2>
                <p className="text-sm md:text-base text-[#3c4a44] leading-relaxed text-justify">
                  El comité organizador del Congreso IGE de Campus Zongolica es el responsable del resguardo y uso de la información recolectada en esta plataforma, garantizando que el tratamiento de los datos personales se realice estrictamente de acuerdo con los principios de licitud y transparencia institucionales.
                </p>
              </div>
            </div>
          </section>

          {/* 02. Datos Recabados */}
          <section className="animate-on-scroll group relative bg-white border border-[#bbcac3] rounded-xl p-8 transition-all duration-300 hover:border-[#00b894] hover:shadow-lg hover:shadow-[#00b894]/5 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start gap-5">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[#eef5f0] border border-[#bbcac3] flex items-center justify-center text-[#00b894] group-hover:bg-[#00b894] group-hover:text-[#002018] group-hover:border-transparent transition-all duration-300">
                <span className="material-symbols-outlined text-2xl" style={styles.iconSettings}>database</span>
              </div>
              <div className="space-y-4 flex-1">
                <h2 className="text-base md:text-lg font-bold text-[#161d1a] tracking-tight">
                  02. Datos Recabados
                </h2>
                <p className="text-sm md:text-base text-[#3c4a44] leading-relaxed text-justify">
                  Para el funcionamiento óptimo del sistema y la gestión operativa interna del evento, recolectamos únicamente la siguiente información básica:
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#f4fbf6] p-4 rounded-lg border border-[#bbcac3]/40">
                  {['Nombre completo', 'Correo electrónico (Google Auth)', 'Unidad Académica', 'Estado del pago'].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-xs md:text-sm text-[#161d1a] font-semibold">
                      <span className="w-2 h-2 rounded-full bg-[#006b55]" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center gap-2 text-xs font-bold text-[#994700] uppercase tracking-wider bg-[#994700]/5 px-3 py-2 rounded border border-[#994700]/20">
                  <span className="material-symbols-outlined text-sm" style={styles.iconSettings}>lock</span> 
                  No se almacena ni procesa ninguna información bancaria o crediticia en este servidor.
                </div>
              </div>
            </div>
          </section>

          {/* 03. Finalidad */}
          <section className="animate-on-scroll group relative bg-white border border-[#bbcac3] rounded-xl p-8 transition-all duration-300 hover:border-[#006b55] hover:shadow-lg hover:shadow-[#006b55]/5 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start gap-5">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[#eef5f0] border border-[#bbcac3] flex items-center justify-center text-[#006b55] group-hover:bg-[#006b55] group-hover:text-white group-hover:border-transparent transition-all duration-300">
                <span className="material-symbols-outlined text-2xl" style={styles.iconSettings}>target</span>
              </div>
              <div className="space-y-4 flex-1">
                <h2 className="text-base md:text-lg font-bold text-[#161d1a] tracking-tight">
                  03. Finalidad del Tratamiento
                </h2>
                <p className="text-sm md:text-base text-[#3c4a44] leading-relaxed text-justify">
                  Sus datos personales serán utilizados única y exclusivamente para los siguientes propósitos operativos de control:
                </p>
                <div className="grid grid-cols-1 gap-3">
                  <div className="p-4 rounded-lg bg-white border border-[#bbcac3] hover:border-[#006b55] transition-colors">
                    <p className="text-sm text-[#3c4a44] leading-relaxed">
                      <strong className="text-[#006b55] font-bold">Acceso Físico:</strong> Validar su entrada a las ponencias en el Teatro Metropolitano de Orizaba mediante la lectura del código QR.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-white border border-[#bbcac3] hover:border-[#006b55] transition-colors">
                    <p className="text-sm text-[#3c4a44] leading-relaxed">
                      <strong className="text-[#006b55] font-bold">Gestión de Pagos:</strong> Permitir a los Encargados de Sede identificar de forma precisa los pagos pendientes de su respectiva unidad.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-white border border-[#bbcac3] hover:border-[#006b55] transition-colors">
                    <p className="text-sm text-[#3c4a44] leading-relaxed">
                      <strong className="text-[#006b55] font-bold">Métricas Globales:</strong> Generar analíticas y gráficas estadísticas agregadas en tiempo real para el uso exclusivo del Administrador general.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 04. Seguridad */}
          <section className="animate-on-scroll group relative bg-white border border-[#bbcac3] rounded-xl p-8 transition-all duration-300 hover:border-[#00b894] hover:shadow-lg hover:shadow-[#00b894]/5 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start gap-5">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[#eef5f0] border border-[#bbcac3] flex items-center justify-center text-[#006874] group-hover:bg-[#006874] group-hover:text-white group-hover:border-transparent transition-all duration-300">
                <span className="material-symbols-outlined text-2xl" style={styles.iconSettings}>encrypted</span>
              </div>
              <div className="space-y-2 flex-1">
                <h2 className="text-base md:text-lg font-bold text-[#161d1a] tracking-tight">
                  04. Seguridad y Almacenamiento
                </h2>
                <p className="text-sm md:text-base text-[#3c4a44] leading-relaxed text-justify">
                  Los registros informáticos están fuertemente protegidos mediante políticas activas de seguridad <strong className="text-[#161d1a] font-bold">RLS (Row Level Security)</strong> directamente configuradas en la infraestructura en la nube de <strong className="text-[#006b55] font-semibold">Supabase</strong>. Esto impide de forma absoluta que usuarios externos o perfiles de nivel básico intercepten o extraigan información ajena a su cuenta.
                </p>
              </div>
            </div>
          </section>

        </div>

        {/* ─── NOTA AL PIE DEL DOCUMENTO ─── */}
        <div className="mt-20 text-center border-t border-[#bbcac3]/60 pt-10 animate-on-scroll">
          <p className="text-[#6c7a74] text-xs font-bold uppercase tracking-widest">
            Protocolo de Privacidad Congreso IGE 2026
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}