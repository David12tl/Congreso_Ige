'use client'

import React from 'react'
import Link from 'next/link'
import { InvestigacionArticleUpload } from '@/components/investigacion/InvestigacionArticleUpload'

export default function InvestigacionPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc] py-10 px-4">
      <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto text-[#1e293b]">
        {/* Botón Volver al Inicio */}
        <div>
          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#cbd5e1] hover:border-[#8B1E23] hover:text-[#8B1E23] text-[#1e293b] text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm"
          >
            ← Volver al Inicio
          </Link>
        </div>

        {/* Encabezado Autónomo */}
        <header className="text-center space-y-2 border-b border-slate-200 pb-6">
          <h1 className="font-black tracking-tight text-[#0f172a] text-3xl md:text-4xl flex items-center justify-center gap-3">
            Portal de Investigación
          </h1>
          <p className="text-sm text-[#475569] font-light max-w-xl mx-auto">
            Plataforma independiente para la recepción, revisión y registro de artículos de investigación para el Congreso ELIGE 2026.
          </p>
        </header>

        
        <InvestigacionArticleUpload userEmail="" userId="guest"/>
      </div>
    </main>
  )
}