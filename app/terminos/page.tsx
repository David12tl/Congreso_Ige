'use client';

import Navbar from '../../src/components/ui/navbar';
import Footer from '../../src/components/ui/Footer';

/**
 * Página de Términos y Condiciones
 * Estética: Institucional con paleta oficial del Congreso
 */
export default function TerminosPage() {
  const lastUpdate = "27 de mayo de 2026";

  return (
    <main className="min-h-screen bg-congreso-whiteSmoke text-congreso-dark selection:bg-congreso-teal/30 font-sans overflow-x-hidden">
      <div className="relative z-50">
        <Navbar />
      </div>

      <div className="relative pt-40 pb-24 px-4 min-h-[calc(100vh-80px)]">
        {/* Luces de ambiente */}
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-congreso-teal/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-congreso-blue/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto relative z-10">
          {/* Header de Sección */}
          <header className="mb-12 animate-fadeIn">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-congreso-dark uppercase mb-4">
              Términos y <span className="text-transparent bg-clip-text bg-gradient-to-r from-congreso-dark via-congreso-blue to-congreso-teal">Condiciones</span>
            </h1>
            <div className="flex items-center gap-4 text-xs font-mono text-congreso-dark/50">
              <span className="px-2 py-1 border border-congreso-teal/10 rounded bg-white uppercase tracking-widest">Protocolo Legal</span>
              <span>Actualizado: {lastUpdate}</span>
            </div>
          </header>

          {/* Contenedor para Lectura */}
          <div className="relative group">
            {/* Efecto de borde brillante sutil */}
            <div className="absolute -inset-px bg-gradient-to-b from-congreso-teal/10 to-transparent rounded-2xl group-hover:from-congreso-teal/20 transition-colors duration-500 pointer-events-none" />
            
            <div className="relative bg-white border border-congreso-teal/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
              {/* Barra superior estética decorativa */}
              <div className="flex items-center gap-2 px-6 py-3 border-b border-congreso-teal/10 bg-congreso-teal/[0.03]">
                <div className="w-2 h-2 rounded-full bg-congreso-orange/50" />
                <div className="w-2 h-2 rounded-full bg-congreso-yellow/50" />
                <div className="w-2 h-2 rounded-full bg-congreso-emerald/50" />
                <span className="ml-4 text-[10px] font-mono text-congreso-dark/40 uppercase tracking-widest">IGE_SYS_DOC_TERMINOS</span>
              </div>

              {/* Contenido con Scroll Interno */}
              <div className="p-8 md:p-12 space-y-10 max-h-[65vh] overflow-y-auto custom-scrollbar leading-relaxed">
                
                {/* Sección 1 */}
                <section className="space-y-4">
                  <h2 className="text-xl font-bold text-congreso-dark flex items-center gap-3">
                    <span className="text-congreso-teal font-mono text-sm">01.</span>
                    Aceptación de los Términos
                  </h2>
                  <p className="text-congreso-dark/70">
                    Al registrarse en la plataforma del Congreso IGE, el usuario acepta cumplir con las normas estipuladas para el correcto desarrollo del evento. El acceso y uso de los servicios digitales proporcionados por este portal están condicionados a la aceptación y cumplimiento de estos términos.
                  </p>
                </section>

                <hr className="border-congreso-teal/10" />

                {/* Sección 2 */}
                <section className="space-y-4">
                  <h2 className="text-xl font-bold text-congreso-dark flex items-center gap-3">
                    <span className="text-congreso-teal font-mono text-sm">02.</span>
                    Mecanismo de Pago y Deslinde Financiero
                  </h2>
                  <p className="text-congreso-dark/70">
                    El usuario reconoce que esta plataforma es <strong className="text-congreso-dark">exclusivamente un sistema de control de accesos e inventario de asientos</strong>. Ninguna transacción monetaria o cobro con tarjeta se realiza de manera digital aquí. 
                  </p>
                  <div className="bg-congreso-teal/5 p-4 border-l-2 border-congreso-teal rounded-r-lg">
                    <p className="text-congreso-dark/70 italic text-sm">
                      La entrega del dinero en efectivo y la posterior generación del Token de Acceso es responsabilidad única del Encargado de la Unidad Académica y el Alumno. La plataforma solo actúa como validador de la transacción previamente realizada de forma física.
                    </p>
                  </div>
                </section>

                <hr className="border-congreso-teal/10" />

                {/* Sección 3 */}
                <section className="space-y-4">
                  <h2 className="text-xl font-bold text-congreso-dark flex items-center gap-3">
                    <span className="text-congreso-teal font-mono text-sm">03.</span>
                    Uso de Tokens y Boletos Digitales
                  </h2>
                  <p className="text-congreso-dark/70">
                    Cada Token de Acceso es de un solo uso y queda ligado de forma permanente al perfil de Supabase que lo canjee. Queda prohibida la reventa o duplicación de códigos de acceso. El código QR final es <span className="text-congreso-dark border-b border-congreso-teal/40 pb-0.5">intransferible</span> y se escaneará en los accesos del Teatro Metropolitano de Orizaba para permitir el ingreso al recinto.
                  </p>
                </section>

                <hr className="border-congreso-teal/10" />

                {/* Sección 4 */}
                <section className="space-y-4">
                  <h2 className="text-xl font-bold text-congreso-dark flex items-center gap-3">
                    <span className="text-congreso-teal font-mono text-sm">04.</span>
                    Cupos y Asignación de Zonas
                  </h2>
                  <p className="text-congreso-dark/70">
                    La selección de zonas (Planta Baja, Primer Piso, Balcón) está sujeta a la capacidad física autorizada del teatro. La organización se reserva el derecho de cerrar el registro a secciones específicas una vez agotado su inventario en la base de datos, garantizando la seguridad del inmueble y el cumplimiento de las normativas de protección civil vigentes.
                  </p>
                </section>

              </div>
            </div>
          </div>

          {/* Nota al pie */}
          <div className="mt-8 text-center animate-fadeIn [animation-delay:400ms]">
            <p className="text-congreso-dark/30 text-xs font-mono uppercase tracking-widest">
              Fin del Documento Legal // IGE Congreso 2026
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-10">
        <Footer />
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 151, 167, 0.03);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 151, 167, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 151, 167, 0.4);
        }
      `}</style>
    </main>
  );
}