'use client';

import React, { useState } from 'react';

// Estructura matemática exacta para formar la geometría de la imagen
const BLOCK_TOP_ROWS = [10, 11, 12, 13, 14, 15, 15, 14]; // Suma: 104 asientos
const BLOCK_BOTTOM_ROWS = [15, 16, 16, 17, 17, 18, 18]; // Suma: 117 asientos

/**
 * Información estructural del asiento seleccionado.
 * `label`  : etiqueta legible (ej. "A-5").
 * `bloque` : identificador del bloque dentro del mapa (ej. "top" / "bottom").
 * `fila`   : letra de la fila (ej. "A").
 * `numero` : número del asiento dentro de la fila.
 */
export interface SeatSelectionInfo {
  label: string;
  bloque: string;
  fila: string;
  numero: number;
}

interface SeatMapProps {
  onSeatSelect?: (seatId: string, seatInfo: SeatSelectionInfo) => void;
  occupiedSeats?: string[];
}

export default function SeatMap({ onSeatSelect, occupiedSeats = [] }: SeatMapProps) {
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);

  const handleSelect = (seatId: string, seatInfo: SeatSelectionInfo) => {
    if (occupiedSeats.includes(seatId)) return;
    setSelectedSeat(seatId);
    if (onSeatSelect) onSeatSelect(seatId, seatInfo);
  };

  const renderBlock = (rows: number[], startRowLetterCode: number, blockName: string) => {

    return (
      <div className="flex flex-col items-center gap-2">
        {rows.map((seatCount, rowIndex) => {
          const rowLetter = String.fromCharCode(startRowLetterCode + rowIndex);
          
          return (
            <div key={`${blockName}-row-${rowIndex}`} className="flex items-center gap-1.5 justify-center">
              {/* Etiqueta de Fila Izquierda */}
              <span className="w-5 text-right font-mono text-xs font-bold text-slate-400 select-none mr-1">
                {rowLetter}
              </span>

              {/* Contenedor de Asientos por Fila */}
              <div className="flex gap-1.5 justify-center">
                {Array.from({ length: seatCount }).map((_, seatIdx) => {
                  const seatNumber = seatIdx + 1;
                  const seatId = `${rowLetter}-${seatNumber}`;
                  const seatInfo: SeatSelectionInfo = {
                    label: seatId,
                    bloque: blockName,
                    fila: rowLetter,
                    numero: seatNumber,
                  };
                  const isOccupied = occupiedSeats.includes(seatId);
                  const isSelected = selectedSeat === seatId;

                  return (
                    <button
                      key={seatId}
                      onClick={() => handleSelect(seatId, seatInfo)}
                      disabled={isOccupied}
                      title={`Asiento ${seatId}`}
                      className={`
                        w-6 h-6 sm:w-7 sm:h-7 rounded-t-md text-[10px] font-bold transition-all duration-150
                        flex items-center justify-center border
                        ${isOccupied 
                          ? 'bg-slate-300 border-slate-400 text-slate-500 cursor-not-allowed' 
                          : isSelected
                            ? 'bg-[#8B1E23] text-white border-[#8B1E23] scale-110 shadow-md ring-2 ring-[#8B1E23]/30'
                            : 'bg-white border-slate-300 text-slate-700 hover:border-[#1E2A39] hover:bg-slate-100'
                        }
                      `}
                    >
                      {seatNumber}
                    </button>
                  );
                })}
              </div>

              {/* Etiqueta de Fila Derecha */}
              <span className="w-5 text-left font-mono text-xs font-bold text-[#7D7D7D] select-none ml-1">
                {rowLetter}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col items-center bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
      
      {/* Escenario / Pantalla principal */}
      <div className="w-64 sm:w-80 h-3 bg-[#1E2A39] rounded-b-xl mb-8 shadow-sm flex items-center justify-center">
        <span className="text-[9px] font-black uppercase tracking-widest text-white/80">Escenario</span>
      </div>

      <div className="flex flex-col items-center gap-8 min-w-max">
        
        {/* BLOQUE SUPERIOR (104 Asientos) */}
        <div className="relative p-6 rounded-2xl bg-slate-200/50 border border-slate-300/60 flex flex-col items-center">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1E2A39] text-white text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full">
            Bloque Superior (104)
          </div>
          {renderBlock(BLOCK_TOP_ROWS, 65, 'top')} {/* Inicia en fila 'A' */}
        </div>

        {/* Pasillo central de separación */}
        <div className="w-full border-b border-dashed border-slate-300 relative my-1">
          <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-slate-50 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Pasillo Central
          </span>
        </div>

        {/* BLOQUE INFERIOR (117 Asientos) */}
        <div className="relative p-6 rounded-2xl bg-slate-200/50 border border-slate-300/60 flex flex-col items-center">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1E2A39] text-white text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full">
            Bloque Inferior (117)
          </div>
          {renderBlock(BLOCK_BOTTOM_ROWS, 73, 'bottom')} {/* Inicia en fila 'I' */}
        </div>

      </div>

      {/* Leyenda de estados */}
      <div className="flex items-center gap-6 mt-8 text-xs font-medium text-slate-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-white border border-slate-300"></div>
          <span>Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#8B1E23]"></div>
          <span>Seleccionado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-slate-300 border border-slate-400"></div>
          <span>Ocupado</span>
        </div>
      </div>

    </div>
  );
}