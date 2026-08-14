'use client';

import React from 'react';
import Image from 'next/image';

export interface Speaker {
  id: number;
  nombre: string;
  puesto: string;
  compania: string;
  conferencia?: string;
  tipo: 'magistral' | 'mesa_redonda';
  subtipo?: 'MODERADOR' | 'PANELISTA';
  avatarUrl?: string;
  bio?: string[];
  fecha?: string;
  hora?: string;
  lugar?: string;
  organiza?: string;
  theme: {
    container: string;
    onContainer: string;
    badgeBg: string;
    badgeText: string;
  };
}

interface SpeakerModalProps {
  speaker: Speaker | null;
  onClose: () => void;
}

export default function SpeakerModal({ speaker, onClose }: SpeakerModalProps) {
  if (!speaker) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-['Montserrat',sans-serif]">
      {/* Fondo del Scrim con desenfoque de cristal */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" 
        onClick={onClose} 
      />
      
      {/* Ventana contenedora del Modal */}
      <div className="relative bg-white w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-[32px] shadow-2xl z-10 animate-[zoomIn_0.3s_cubic-bezier(0.2,0.8,0.2,1)]">
        
        {/* Barra superior pegajosa de cierre */}
        <div className="sticky top-0 bg-white/90 backdrop-blur-md z-20 p-6 flex justify-between items-center border-b border-slate-100">
          <h2 className="text-xs font-bold tracking-widest text-slate-400 uppercase">Ficha del Ponente</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors flex items-center justify-center"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Cuerpo del Modal */}
        <div className="p-6 md:p-8 pt-4">
          {/* Bloque Identificador Principal */}
          <div className="flex flex-col sm:flex-row gap-6 mb-8 items-start">
            <div 
              style={{ backgroundColor: speaker.theme.container }} 
              className="w-32 h-32 rounded-[24px] relative flex-shrink-0 overflow-hidden shadow-inner border border-white/20"
            >
              {speaker.avatarUrl ? (
                <Image src={speaker.avatarUrl} alt={speaker.nombre} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span style={{ color: speaker.theme.onContainer }} className="text-2xl font-bold opacity-40">
                    {speaker.nombre.split(' ').filter(Boolean).map(n => n[0]).join('').substring(0, 3).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#1E2A39] mb-1.5 leading-tight">{speaker.nombre}</h1>
              <p className="text-sm font-medium text-[#8B1E23] mb-3.5">{speaker.puesto}</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">domain</span> {speaker.compania}
                </span>
                <span style={{ backgroundColor: speaker.theme.badgeBg, color: speaker.theme.badgeText }} className="px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">verified</span> {speaker.tipo === 'magistral' ? 'Magistral' : 'Mesa Redonda'}
                </span>
              </div>
            </div>
          </div>

          {/* Título y Contenedor de la Ponencia */}
          {speaker.conferencia && (
            <div style={{ backgroundColor: speaker.theme.container }} className="p-5 rounded-[24px] mb-6 border border-white/50">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-wider">Tema de Exposición</h3>
<p className="text-lg font-bold text-[#1E2A39] leading-snug">&#34;{speaker.conferencia}&#34;</p>
            </div>
          )}

          {/* Grid Metadatos del Evento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-3.5 p-4 border border-slate-100 rounded-2xl bg-slate-50/50">
              <span className="material-symbols-outlined p-2 bg-blue-50 text-blue-600 rounded-xl">calendar_month</span>
              <div>
                <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wide">Fecha y Horario</p>
                <p className="text-xs font-bold text-slate-700">{speaker.fecha || 'Por confirmar'}</p>
                <p className="text-[11px] text-slate-500">{speaker.hora || '--:-- hrs'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3.5 p-4 border border-slate-100 rounded-2xl bg-slate-50/50">
              <span className="material-symbols-outlined p-2 bg-red-50 text-red-600 rounded-xl">location_on</span>
              <div>
                <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wide">Ubicación / Aula</p>
                <p className="text-xs font-bold text-slate-700">{speaker.lugar || 'Auditorio Principal'}</p>
              </div>
            </div>
          </div>

          {/* Sección de Trayectoria Profesional o Descripción */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-[#1E2A39] uppercase tracking-wider mb-4 flex items-center gap-2 text-slate-400">
              <span className="material-symbols-outlined text-lg">history_edu</span> Reseña Curricular
            </h3>
            <div className="space-y-3.5">
              {speaker.bio && speaker.bio.length > 0 ? (
                speaker.bio.map((item, index) => (
                  <div key={index} className="flex gap-3 items-start">
                    <span style={{ backgroundColor: speaker.theme.onContainer }} className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 opacity-60" />
                    <p className="text-xs md:text-sm text-[#7D7D7D] leading-relaxed font-normal">{item}</p>
                  </div>
                ))
              ) : (
                <div className="flex gap-3 items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 flex-shrink-0" />
                  <p className="text-xs md:text-sm text-[#7D7D7D] leading-relaxed italic">
                    &#34;Un espacio internacional de aprendizaje, inspiración y conexión para transformar ideas en soluciones que generen valor y desarrollo sostenible.&#34;
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sección Inferior de Cierre y Llamado a la Acción */}
          <div className="border-t border-slate-100 pt-6 mt-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-[11px] text-slate-400 text-center sm:text-left">
                <p>Organizado por:</p>
                <p className="font-bold text-slate-600">{speaker.organiza || 'Academia en Gestión Empresarial'}</p>
              </div>
              <button 
                style={{ backgroundColor: speaker.theme.onContainer }}
                className="w-full sm:w-auto px-8 py-3 text-white rounded-full font-bold text-sm shadow-sm hover:opacity-90 active:scale-95 transition-all"
              >
                Registrarme al Congreso
              </button>
            </div>
            <p style={{ color: speaker.theme.onContainer }} className="text-center text-[10px] font-bold mt-8 uppercase tracking-[0.2em] opacity-90">
              ¡Sé parte del futuro, emprende, lidera e innova!
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}