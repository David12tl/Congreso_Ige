'use client';

import React from 'react';
import RegisterForm from '../../src/components/auth/RegisterForm';
import Footer from '@/components/ui/Footer';
import Image from 'next/image';

export default function RegisterPage() {
  return (
    <main className="min-h-screen w-full bg-[#FCFCFD] flex flex-col justify-between relative overflow-hidden text-[#1E293B]">
      
      {/* Sutil patrón de fondo claro para dar textura sin saturar */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-50 pointer-events-none" />
      
      {/* Suaves destellos de color corporativo en el fondo */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#800020]/5 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#b91c1c]/3 blur-[130px] rounded-full pointer-events-none" />

      {/* Header Minimalista con Logo */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Image src="/IMAGOTIPO.png" alt="Logo" width={250} height={200} />
        </div>
        <a 
          href="./" 
          className="text-sm font-semibold text-[#4a5568] hover:text-[#800020] transition-colors"
        >
          Volver al Inicio
        </a>
      </header>

      {/* Contenedor de Dos Columnas */}
      <div className="relative z-10 max-w-7xl w-full mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center my-auto py-8">
        
        {/* Columna Izquierda: Información y Beneficios */}
        <div className="lg:col-span-5 space-y-8 pr-0 lg:pr-8">
          
          {/* Badge del Evento */}
          <span className="inline-block px-3 py-1 rounded-full bg-[#f8d7da] text-[#721c24] text-xs font-bold uppercase tracking-wider">
            ELIGE 2026
          </span>
          
          {/* Título Principal */}
          <h1 className="text-4xl lg:text-5xl font-extrabold text-[#0F172A] tracking-tight leading-tight">
            Potencia tu visión con liderazgo empresarial.
          </h1>
          
          {/* Subtítulo */}
          <p className="text-base text-[#64748B] leading-relaxed">
            Únete a más de 1,000 líderes y profesionales en el Congreso de Gestión Empresarial más influyente de la región. Tres días de sinergia, estrategia y networking de alto nivel.
          </p>
          
          {/* Listado de Beneficios con iconos en color Vino */}
          <div className="space-y-6 pt-4">
            
            {/* Beneficio 1 */}
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-lg bg-[#f8d7da]/50 flex items-center justify-center text-[#800020] flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.63 8.41m5.96 5.96a14.96 14.96 0 01-12.12 6.16m12.12-6.16a14.96 14.96 0 00-5.96-5.96m0 0V2.25L4.18 4.18M9.63 8.41a6 6 0 00-7.38 5.84h4.8m2.58-5.84a14.96 14.96 0 005.96 5.96m-5.96-5.96L4.18 19.82"></path>
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-[#0F172A]">Acelera tu Crecimiento</h4>
                <p className="text-sm text-[#64748B]">Acceso directo a metodologías y estrategias utilizadas por grandes corporativos.</p>
              </div>
            </div>

            {/* Beneficio 2 */}
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-lg bg-[#f8d7da]/50 flex items-center justify-center text-[#800020] flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a3 3 0 110-3.44m0 3.44a3 3 0 100-3.44m0 3.44L12 15m6-1.72L12 11M6 16.28a3 3 0 100-3.44m0 3.44L12 15m-6-1.72L12 11m0 4V9.72M12 9.72a3 3 0 110-3.44m0 3.44a3 3 0 100-3.44"></path>
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-[#0F172A]">Networking Estratégico</h4>
                <p className="text-sm text-[#64748B]">Espacios interactivos diseñados para entablar alianzas comerciales y profesionales de valor.</p>
              </div>
            </div>

            {/* Beneficio 3 */}
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-lg bg-[#f8d7da]/50 flex items-center justify-center text-[#800020] flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0110 21a3.745 3.745 0 01-3.111-1.593 3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"></path>
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-[#0F172A]">Talleres Prácticos Certificados</h4>
                <p className="text-sm text-[#64748B]">Consigue valor curricular participando activamente en nuestras conferencias magistrales.</p>
              </div>
            </div>

          </div>

          {/* Testimonial o Prueba Social */}
          <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <div className="flex text-[#b91c1c] gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-sm italic text-[#334155] mb-4">
              El nivel de los ponentes y la organización del congreso anterior fue impecable. Es una inversión invaluable para cualquier directivo u organización.
            </p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150')" }}></div>
              <div>
                <p className="text-xs font-bold text-[#0F172A]">Mtra. Adriana Torres</p>
                <p className="text-[11px] text-[#64748B]">Directora de Innovación y Estrategia</p>
              </div>
            </div>
          </div>

        </div>

        {/* Columna Derecha: Tarjeta Blanca Autónoma para el Formulario */}
        <div className="lg:col-span-7 flex justify-center lg:justify-end w-full">
          <div className="bg-white p-8 md:p-10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 w-full max-w-xl relative">
            {/* Decoración sutil superior */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[3px] bg-gradient-to-r from-[#800020] to-[#b91c1c] rounded-b-full"></div>
            
            {/* Componente dinámico de autenticación */}
            <RegisterForm />
          </div>
        </div>

      </div>

      {/* Footer Minimalista */}
      <Footer />

    </main>
  );
}