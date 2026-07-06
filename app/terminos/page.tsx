'use client';

import React, { useEffect } from 'react';
import Navbar from '../../src/components/ui/navbar';
import Footer from '../../src/components/ui/Footer';

/**
 * Página de Términos y Condiciones
 * Estética: Línea Clara, Tipografía Sora y Contenedores Bento-Clean
 */
export default function TerminosPage() {
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

    // Intersection Observer para transiciones fluidas de scroll
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
        <header className="mb-12 animate-on-scroll">
          <span className="text-[#006b55] text-xs font-bold uppercase tracking-[0.25em] block mb-3">
            —— PROTOCOLO LEGAL INSTITUCIONAL
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tighter text-[#161d1a] uppercase mb-4">
            Términos y <span className="text-[#006b55]">Condiciones</span>
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-[#3c4a44]">
            <span className="px-3 py-1 border border-[#bbcac3] bg-white rounded uppercase tracking-wider text-[#006874]">
              Uso del Sistema
            </span>
            <span>Última actualización: {lastUpdate}</span>
          </div>
        </header>

        {/* ─── CONTENEDOR PRINCIPAL BENTO-CLEAN ─── */}
        <div className="animate-on-scroll relative group mb-12">
          <div className="relative bg-white border border-[#bbcac3] rounded-xl overflow-hidden shadow-sm flex flex-col">
            
            {/* Barra superior estética e identificador de documento */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#bbcac3] bg-[#eef5f0]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#006b55]/30" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#00b894]/40" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#994700]/30" />
                <span className="ml-2 text-[11px] font-bold text-[#6c7a74] uppercase tracking-wider">
                  IGE_SYS_DOC_TERMINOS
                </span>
              </div>
              <span className="material-symbols-outlined text-lg text-[#6c7a74]" style={styles.iconSettings}>
                gavel
              </span>
            </div>

            {/* Bloques de Contenido Legal */}
            <div className="p-8 md:p-12 space-y-10 max-h-[60vh] overflow-y-auto custom-scrollbar leading-relaxed text-justify">
              
              {/* Sección 1 */}
              <section className="space-y-3">
                <h2 className="text-base md:text-lg font-bold text-[#161d1a] flex items-center gap-3 tracking-tight">
                  <span className="text-[#006b55] font-bold text-sm">01.</span>
                  Aceptación de los Términos
                </h2>
                <p className="text-sm md:text-base text-[#3c4a44]">
                  Al registrarse en la plataforma del Congreso IGE, el usuario acepta cumplir plenamente con las normas estipuladas para el correcto desarrollo del evento. El acceso y uso de los servicios digitales proporcionados por este portal están condicionados a la aceptación irrestricta de estos términos.
                </p>
              </section>

              <hr className="border-[#bbcac3]/50" />

              {/* Sección 2 */}
              <section className="space-y-3">
                <h2 className="text-base md:text-lg font-bold text-[#161d1a] flex items-center gap-3 tracking-tight">
                  <span className="text-[#006b55] font-bold text-sm">02.</span>
                  Mecanismo de Pago y Deslinde Financiero
                </h2>
                <p className="text-sm md:text-base text-[#3c4a44]">
                  El usuario reconoce que esta plataforma es <strong className="text-[#161d1a] font-bold">exclusivamente un sistema de control de accesos e inventario de asientos</strong>. Ninguna transacción monetaria, cobro electrónico o procesamiento de tarjetas bancarias se realiza de manera digital a través de este sitio web.
                </p>
                
                {/* Cuadro de Advertencia Tonal */}
                <div className="bg-[#eef5f0] p-5 border-l-4 border-[#006b55] rounded-r-lg flex gap-4 items-start mt-4">
                  <span className="material-symbols-outlined text-[#006b55] text-xl mt-0.5" style={styles.iconSettings}>
                    info
                  </span>
                  <p className="text-xs md:text-sm text-[#3c4a44] font-medium leading-relaxed">
                    La entrega del dinero en efectivo y la posterior generación del Token de Acceso es responsabilidad única y exclusiva del Encargado de la Unidad Académica y el Alumno. La plataforma digital actúa meramente como validador de la transacción física previamente realizada.
                  </p>
                </div>
              </section>

              <hr className="border-[#bbcac3]/50" />

              {/* Sección 3 */}
              <section className="space-y-3">
                <h2 className="text-base md:text-lg font-bold text-[#161d1a] flex items-center gap-3 tracking-tight">
                  <span className="text-[#006b55] font-bold text-sm">03.</span>
                  Uso de Tokens y Boletos Digitales
                </h2>
                <p className="text-sm md:text-base text-[#3c4a44]">
                  Cada Token de Acceso es de un solo uso y queda ligado de forma permanente al perfil único de usuario que lo canjee. Queda estrictamente prohibida la reventa, alteración o duplicación de códigos de acceso. El código QR final generado es <span className="text-[#161d1a] font-semibold underline decoration-[#00b894]/40 decoration-2">intransferible</span> y será escaneado en los puntos de control del Teatro Metropolitano de Orizaba para autorizar el ingreso al recinto.
                </p>
              </section>

              <hr className="border-[#bbcac3]/50" />

              {/* Sección 4 */}
              <section className="space-y-3">
                <h2 className="text-base md:text-lg font-bold text-[#161d1a] flex items-center gap-3 tracking-tight">
                  <span className="text-[#006b55] font-bold text-sm">04.</span>
                  Cupos y Asignación de Zonas
                </h2>
                <p className="text-sm md:text-base text-[#3c4a44]">
                  La selección de zonas (Planta Baja, Primer Piso, Balcón) está sujeta en todo momento a la capacidad física máxima autorizada del teatro. La organización se reserva el derecho de cerrar el registro de secciones específicas una vez agotado su inventario en la base de datos, garantizando así la seguridad del inmueble y el estricto cumplimiento de las normativas de protección civil vigentes.
                </p>
              </section>

            </div>
          </div>
        </div>

        {/* ─── NOTA AL PIE DEL DOCUMENTO ─── */}
        <div className="text-center animate-on-scroll">
          <p className="text-[#6c7a74] text-xs font-bold uppercase tracking-widest">
            Fin del Documento Legal // IGE Congreso 2026
          </p>
        </div>
      </main>

      <Footer />

      {/* Estilos para el scroll interno adaptados a la nueva paleta */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #eef5f0;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #bbcac3;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #006b55;
        }
      `}</style>
    </div>
  );
}