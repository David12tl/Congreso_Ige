'use client';

import React, { useState, useEffect } from 'react';
import SeatMap from './zonaExternos'; // Ajusta la ruta a tu componente de mapa de asientos
import { X, Armchair } from 'lucide-react'; // Puedes usar lucide-react o remplazar con tus SVG/Iconos

interface AsientosModalProps {
  onSeatSelect?: (seatId: string) => void;
  occupiedSeats?: string[];
}

export default function AsientosModal({ onSeatSelect, occupiedSeats = [] }: AsientosModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);

  // Cerrar al presionar la tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Bloquear scroll del fondo
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSeatSelect = (seatId: string) => {
    setSelectedSeat(seatId);
    if (onSeatSelect) onSeatSelect(seatId);
  };

  return (
    <>
      {/* BOTÓN REUTILIZABLE PARA ABRIR EL MAPA */}
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1E2A39] text-white font-semibold text-sm rounded-xl hover:bg-[#2a3b50] active:scale-95 transition-all shadow-md shadow-[#1E2A39]/10"
      >
        <Armchair className="w-4 h-4 text-[#8B1E23] stroke-[2.5]" />
        <span>Externo</span>
      </button>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1E2A39] text-white font-semibold text-sm rounded-xl hover:bg-[#2a3b50] active:scale-95 transition-all shadow-md shadow-[#1E2A39]/10"
      >
        <Armchair className="w-4 h-4 text-[#8B1E23] stroke-[2.5]" />
        <span>Zona 1</span>
      </button>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1E2A39] text-white font-semibold text-sm rounded-xl hover:bg-[#2a3b50] active:scale-95 transition-all shadow-md shadow-[#1E2A39]/10"
      >
        <Armchair className="w-4 h-4 text-[#8B1E23] stroke-[2.5]" />
        <span>Zona 2</span>
      </button>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1E2A39] text-white font-semibold text-sm rounded-xl hover:bg-[#2a3b50] active:scale-95 transition-all shadow-md shadow-[#1E2A39]/10"
      >
        <Armchair className="w-4 h-4 text-[#8B1E23] stroke-[2.5]" />
        <span>Zona 3</span>
      </button>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1E2A39] text-white font-semibold text-sm rounded-xl hover:bg-[#2a3b50] active:scale-95 transition-all shadow-md shadow-[#1E2A39]/10"
      >
        <Armchair className="w-4 h-4 text-[#8B1E23] stroke-[2.5]" />
        <span>Zona 4</span>
      </button>

      {/* MODAL / POPUP DE ASIENTOS */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          
          {/* Fondo oscuro traslúcido */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Ventana Modal */}
          <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] z-10 overflow-hidden">
            
            {/* Cabecera del Modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h3 className="text-lg font-extrabold text-[#1E2A39]">
                  Mapa de Asientos del Auditorio
                </h3>
                <p className="text-xs text-[#7D7D7D] font-medium">
                  {selectedSeat ? `Asiento seleccionado: ${selectedSeat}` : 'Haz clic en un asiento disponible para elegirlo'}
                </p>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cuerpo con Scroll para el Mapa */}
            <div className="p-6 overflow-y-auto flex-1 flex justify-center">
              <SeatMap 
                onSeatSelect={handleSeatSelect} 
                occupiedSeats={occupiedSeats} 
              />
            </div>

            {/* Pie del Modal con acciones */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
              <span className="text-xs font-semibold text-slate-500">
                {selectedSeat ? (
                  <span className="text-[#8B1E23] font-bold">Asiento seleccionado: {selectedSeat}</span>
                ) : (
                  'Ningún asiento seleccionado'
                )}
              </span>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200/50 rounded-lg transition-colors"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  disabled={!selectedSeat}
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#8B1E23] rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#a32329] transition-all shadow-sm"
                >
                  Confirmar Asiento
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}