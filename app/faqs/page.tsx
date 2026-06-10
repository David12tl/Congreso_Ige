'use client';

import { useState } from 'react';
import Navbar from '../../src/components/ui/navbar';
import Footer from '../../src/components/ui/Footer';
import { FiChevronDown } from 'react-icons/fi';

const faqs = [
  {
    question: "¿Cómo me registro al Congreso IGE?",
    answer: "Puedes iniciar sesión rápidamente con tu cuenta de Google, completar tu perfil seleccionando tu Unidad Académica de Campus Zongolica (o la opción Externos) y enviar tu solicitud de ticket."
  },
  {
    question: "¿Cómo realizo el pago de mi boleto?",
    answer: "La plataforma no procesa pagos en línea. Debes acudir con el Encargado de tu Unidad Académica asignada, realizar el pago en físico (efectivo o transferencia según indique el staff) y él te proporcionará un Token de Acceso único."
  },
  {
    question: "¿Qué es el Token de Acceso y cómo lo uso?",
    answer: "Es un código físico/alfanumérico que valida que tu pago fue recibido. Debes ingresarlo en tu panel de usuario para activar automáticamente tu Boleto Digital con código QR."
  },
  {
    question: "¿El costo varía según el asiento en el Teatro Metropolitano?",
    answer: "No, todas las zonas del teatro tienen el mismo costo general. Sin embargo, debes seleccionar tu zona de interés (Planta Baja, Primer Piso o Balcón Superior) al registrarte para asegurar tu lugar, ya que el cupo por sección es limitado."
  },
  {
    question: "¿Qué pasa si pierdo mi código QR el día del evento?",
    answer: "No te preocupes, tu boleto digital está resguardado de forma segura en tu cuenta. Solo debes iniciar sesión desde tu teléfono en la entrada del teatro para que el staff lo escanee."
  }
];

export default function FAQsPage() {
  return (
    <main className="min-h-screen bg-congreso-whiteSmoke text-congreso-dark selection:bg-congreso-teal/30 font-sans overflow-x-hidden">
      <div className="relative z-50">
        <Navbar />
      </div>
      
      <div className="relative pt-40 pb-24 px-4 min-h-[calc(100vh-80px)]">
        {/* Luces de Fondo (Glow) */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-congreso-teal/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-congreso-blue/5 rounded-full blur-[120px] pointer-events-none" />
        
        {/* Grid de fondo sutil */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="max-w-3xl mx-auto relative z-10">
          <header className="text-center mb-16 animate-fadeIn">
            <span className="inline-block px-3 py-1 mb-4 text-[10px] font-bold tracking-[0.3em] text-congreso-teal uppercase border border-congreso-teal/30 rounded-full bg-congreso-teal/5 backdrop-blur-sm">
              Soporte & Ayuda
            </span>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-congreso-dark mb-6 uppercase leading-tight">
              Preguntas <span className="text-transparent bg-clip-text bg-gradient-to-r from-congreso-dark via-congreso-blue to-congreso-teal">Frecuentes</span>
            </h1>
            <p className="text-congreso-dark/60 text-lg max-w-xl mx-auto leading-relaxed">
              Resolvemos tus dudas sobre el proceso de registro, pagos y acceso al evento tecnológico del año.
            </p>
          </header>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <FAQItem key={index} faq={faq} index={index} />
            ))}
          </div>

          {/* Call to action sutil */}
          <div className="mt-20 text-center p-8 rounded-2xl bg-white border border-congreso-teal/10 backdrop-blur-sm animate-fadeIn opacity-0 [animation-fill-mode:forwards] [animation-delay:600ms]">
            <p className="text-congreso-dark/60 mb-4">¿Aún tienes dudas?</p>
            <a 
              href="mailto:soporte@congresoige.com" 
              className="text-congreso-teal font-bold hover:text-congreso-blue transition-colors underline underline-offset-4"
            >
              Contacta con nuestro equipo de soporte
            </a>
          </div>
        </div>
      </div>

      <div className="relative z-10">
        <Footer />
      </div>
    </main>
  );
}

function FAQItem({ faq, index }: { faq: typeof faqs[0], index: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className={`group bg-white backdrop-blur-md border transition-all duration-500 rounded-2xl overflow-hidden animate-fadeIn opacity-0 [animation-fill-mode:forwards] ${
        isOpen 
          ? 'border-congreso-teal/50 shadow-[0_0_30px_rgba(0,151,167,0.1)]' 
          : 'border-congreso-teal/10 hover:border-congreso-teal/30'
      }`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-6 flex items-center justify-between text-left focus:outline-none cursor-pointer"
      >
        <span className={`text-lg font-bold tracking-tight transition-colors duration-300 ${isOpen ? 'text-congreso-teal' : 'text-congreso-dark group-hover:text-congreso-dark'}`}>
          {faq.question}
        </span>
        <div className={`flex-shrink-0 ml-4 w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300 ${
          isOpen ? 'bg-congreso-teal/20 border-congreso-teal/50 text-congreso-teal rotate-180' : 'bg-white/5 border-congreso-teal/20 text-congreso-dark/40'
        }`}>
          <FiChevronDown className="w-5 h-5" />
        </div>
      </button>
      
      <div 
        className={`transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden ${
          isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-6 pb-8 text-congreso-dark/70 leading-relaxed text-base border-t border-congreso-teal/10 pt-6 bg-gradient-to-b from-transparent to-congreso-teal/[0.02]">
          {faq.answer}
        </div>
      </div>
    </div>
  );
}