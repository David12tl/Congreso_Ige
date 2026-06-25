'use client';

import React from 'react';
import Image from 'next/image';
import { InfiniteSliderBasic as InfiniteSlider } from "@/components/ui/infinite-slider";

interface Partner {
  id: number;
  nombre: string;
  categoria: 'institucional';
  logoUrl: string;
  url?: string;
}

export default function AliadosYPatrocinadores() {
  const aliados: Partner[] = [
    { id: 1, nombre: 'Institución Aliada 1', categoria: 'institucional', logoUrl: "/patriots/institucional/Escolar-1.webp" },
    { id: 2, nombre: 'Institución Aliada 2', categoria: 'institucional', logoUrl: "/patriots/institucional/Escolar-2.webp" },
    { id: 3, nombre: 'Institución Aliada 3', categoria: 'institucional', logoUrl: "/patriots/institucional/Escolar-3.webp" },
    { id: 4, nombre: 'Institución Aliada 4', categoria: 'institucional', logoUrl: "/patriots/institucional/Escolar-4.webp" },
    { id: 5, nombre: 'Institución Aliada 5', categoria: 'institucional', logoUrl: "/patriots/institucional/Escolar-5.webp" },
    { id: 6, nombre: 'Institución Aliada 6', categoria: 'institucional', logoUrl: "/patriots/institucional/Escolar-6.webp" },
    { id: 7, nombre: 'Institución Aliada 7', categoria: 'institucional', logoUrl: "/patriots/institucional/Escolar-7.jpg" },
    { id: 8, nombre: 'Institución Aliada 8', categoria: 'institucional', logoUrl: "/patriots/institucional/Escolar-8.webp" }
  ];

  return (
    <section className="w-full py-20 relative bg-white text-gray-800" style={{ borderTop: '1px solid var(--border-componentes)' }}>
      
      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* ENCABEZADO DE SECCIÓN SERIA */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[11px] font-mono tracking-[0.4em] text-gray-500 uppercase block mb-2">
            Respaldando el Ecosistema
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Alianzas Estratégicas
          </h2>
          <div className="w-12 h-[1px] mx-auto mb-4" style={{ backgroundColor: 'var(--border-componentes)' }} />
          <p className="text-xs sm:text-sm leading-relaxed font-light text-gray-600">
            Gracias al compromiso mutuo con la innovación, la educación y el desarrollo tecnológico, 
            estas destacadas organizaciones hacen posible este magno encuentro de talento nacional.
          </p>
        </div>

        {/* CONTENEDOR DE ALIADOS INSTITUCIONALES */}
        <div className="mb-16 px-4 md:px-8">
          <h3 className="text-center text-xs font-semibold tracking-[0.2em] uppercase mb-8 text-gray-500">
            Aliados Institucionales
          </h3>
          
          {/* Rejilla responsiva para los logos */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 md:gap-x-6 gap-y-8 md:gap-y-12">
            {aliados.map((aliado) => (
              <div
                key={aliado.id}
                className="h-28 rounded-xl flex items-center justify-center p-4 transition-all duration-300 filter grayscale opacity-60 hover:grayscale-0 hover:opacity-100 group cursor-pointer hover:-translate-y-1 bg-white"
                style={{ border: '1px solid var(--border-componentes)'}}
              >
                <Image
                  src={aliado.logoUrl}
                  alt={`Logo de ${aliado.nombre}`}
                  width={150}
                  height={50}
                  loading="lazy"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                  className="object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* CONTENEDOR DE PATROCINADORES PRINCIPALES (GOLD) - AHORA A PANTALLA COMPLETA */}
      <div className="w-full text-center mt-24">
        <h3 className="text-center text-xs font-semibold tracking-[0.2em] uppercase mb-8 text-gray-500">
          Patrocinadores Principales
        </h3>
        <InfiniteSlider />
      </div>
    </section>
  );
}