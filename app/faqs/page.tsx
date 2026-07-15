'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/ui/navbar';
import Footer from '@/components/ui/Footer';

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
  
  useEffect(() => {
    // Inyección dinámica de tipografía Sora y Material Symbols
    const linkSora = document.createElement('link');
    linkSora.href = 'https://fonts.googleapis.com/css2?family=Sora:wght@100..800&display=swap';
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

  return (
    <div className="bg-white text-[#1E2A39] font-['Montserrat'] overflow-x-hidden min-h-screen antialiased flex flex-col justify-between">
      <Navbar />
      
      {/* Ajuste de pt-32 para evitar colisiones con el Navbar */}
      <main className="max-w-3xl mx-auto px-6 w-full pt-32 pb-24 flex-grow relative z-10">
        
        {/* ─── HEADER DE LA PÁGINA ─── */}
        <header className="text-center mb-12 animate-on-scroll">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-xs font-bold tracking-wider text-[#8B1E23] uppercase border border-[#E6E6E6] rounded-full bg-white shadow-sm">
            Soporte & Ayuda
          </span>
          <h1 style={{ color: '#1E2A39' }} className="text-3xl md:text-5xl font-extrabold tracking-tighter uppercase mb-4 leading-tight">
            Preguntas <span style={{ color: '#8B1E23' }}>Frecuentes</span>
          </h1>
          <p className="text-[#7D7D7D] text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Resolvemos tus dudas sobre el proceso de registro, validación de pagos físicos y acceso al evento empresarial.
          </p>
        </header>

        {/* ─── LISTA DE ACORDEONES CORREGIDA ─── */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <FAQItem key={index} faq={faq} />
          ))}
        </div>

        {/* ─── CALL TO ACTION TONAL ─── */}
        <div className="mt-16 text-center p-8 rounded-2xl bg-white border border-slate-200 shadow-sm animate-on-scroll">
          <p className="text-sm font-semibold text-[#7D7D7D] mb-2">¿Aún tienes dudas técnicas o administrativas?</p>
          <a 
            href="mailto:soporte@congresoige.com" 
            style={{ color: '#1E2A39' }}
            className="inline-flex items-center gap-2 font-bold hover:opacity-80 transition-all underline underline-offset-4 text-sm md:text-base"
          >
            Contacta con nuestro equipo de soporte
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function FAQItem({ faq }: { faq: typeof faqs[0] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
        className={`animate-on-scroll bg-white border transition-all duration-300 rounded-2xl overflow-hidden shadow-sm ${
          isOpen 
            ? 'border-[#8B1E23] shadow-md shadow-[#8B1E23]/5' 
            : 'border-[#E6E6E6] hover:border-[#7D7D7D]'
        }`}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none cursor-pointer bg-white"
        >
          <span className={`text-base font-bold tracking-tight transition-colors duration-300 ${isOpen ? 'text-[#8B1E23]' : 'text-[#1E2A39]'}`}>
            {faq.question}
          </span>
          <div className={`flex-shrink-0 ml-4 w-8 h-8 rounded-lg border flex items-center justify-center transition-all duration-300 ${
            isOpen ? 'bg-[#8B1E23]/10 border-transparent text-[#8B1E23]' : 'bg-white border-[#E6E6E6] text-[#7D7D7D]'
          }`}>
          <span 
            className="material-symbols-outlined text-xl transition-transform duration-300"
            style={{ 
              fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
            }}
          >
            keyboard_arrow_down
          </span>
        </div>
      </button>
      
      {/* Contenedor colapsable optimizado con max-h controlado para transiciones sin saltos */}
      <div 
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
          <div className="px-6 pb-6 text-[#7D7D7D] text-sm md:text-base leading-relaxed text-justify border-t border-[#E6E6E6] pt-4 bg-[#E6E6E6]/40">
          {faq.answer}
        </div>
      </div>
    </div>
  );
}