'use client';

import React, { useState } from 'react';

// Geometría del Bloque Superior: 17 filas que van progresivamente de 9 a 13 asientos
// Suma total: 9 + 9 + 9 + 10 + 10 + 10 + 11 + 11 + 11 + 11 + 12 + 12 + 12 + 12 + 13 + 13 + 13 = 180 asientos
const BLOCK_TOP_ROWS = [9, 9, 9, 10, 10, 10, 10, 11, 11, 11, 12, 12, 12, 13, 13, 13, 13];

// Geometría del Bloque Inferior: 15 filas (de 14 asientos mayormente) para dar 208 asientos exactos
// Suma total: (13 filas × 14) + (2 filas × 13) = 182 + 26 = 208 asientos
const BLOCK_BOTTOM_ROWS = [14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14];

/**
 * Genera etiquetas de filas estilo abecedario (A...Z, AA, AB, AC, etc.)
 */
function getRowLabel(index: number): string {
  if (index < 26) {
    return String.fromCharCode(65 + index);
  }
  const secondChar = String.fromCharCode(65 + (index - 26));
  return `A${secondChar}`;
}

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

export default function Zona1({ onSeatSelect, occupiedSeats = [] }: SeatMapProps) {
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);

  const handleSelect = (seatId: string, seatInfo: SeatSelectionInfo) => {
    if (occupiedSeats.includes(seatId)) return;
    setSelectedSeat(seatId);
    if (onSeatSelect) onSeatSelect(seatId, seatInfo);
  };

  const renderBlock = (rows: number[], startRowIndex: number, blockName: string) => {
    return (
      <div className="flex flex-col items-center gap-2">
        {rows.map((seatCount, rowIndex) => {
          const absoluteRowIndex = startRowIndex + rowIndex;
          const rowLetter = getRowLabel(absoluteRowIndex);
          
          return (
            <div key={`${blockName}-row-${rowIndex}`} className="flex items-center gap-1.5 justify-center">
              {/* Etiqueta de Fila Izquierda */}
              <span className="w-6 text-right font-mono text-xs font-bold text-slate-400 select-none mr-1">
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
                      title={`Zona 1 - Asiento ${seatId}`}
                      className={`
                        w-6 h-6 sm:w-7 sm:h-7 rounded-t-md text-[10px] font-bold transition-all duration-150
                        flex items-center justify-center border
                        ${isOccupied 
                          ? 'bg-slate-300 border-slate-400 text-slate-500 cursor-not-allowed' 
                          : isSelected
                            ? 'bg-[#00a354] text-white border-[#00a354] scale-110 shadow-md ring-2 ring-[#00a354]/30'
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
              <span className="w-6 text-left font-mono text-xs font-bold text-[#7D7D7D] select-none ml-1">
                {rowLetter}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  // Cálculos dinámicos de los totales por bloque
  const totalTopSeats = BLOCK_TOP_ROWS.reduce((acc, count) => acc + count, 0);
  const totalBottomSeats = BLOCK_BOTTOM_ROWS.reduce((acc, count) => acc + count, 0);

  return (
    <div className="w-full flex flex-col items-center bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
      
      {/* Escenario / Pantalla principal */}
      <div className="w-64 sm:w-80 h-3 bg-[#1E2A39] rounded-b-xl mb-8 shadow-sm flex items-center justify-center">
        <span className="text-[9px] font-black uppercase tracking-widest text-white/80">Escenario</span>
      </div>

      <div className="flex flex-col items-center gap-8 min-w-max">
        
        {/* BLOQUE SUPERIOR (180 Asientos - 17 Filas: A a Q) */}
        <div className="relative p-6 rounded-2xl bg-slate-200/50 border border-slate-300/60 flex flex-col items-center">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1E2A39] text-white text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow-sm">
            Bloque Superior ({totalTopSeats})
          </div>
          {renderBlock(BLOCK_TOP_ROWS, 0, 'top')} {/* Inicia en 'A' */}
        </div>

        {/* Pasillo central de separación */}
        <div className="w-full border-b border-dashed border-slate-300 relative my-1">
          <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-slate-50 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Pasillo Central
          </span>
        </div>

        {/* BLOQUE INFERIOR (208 Asientos - 15 Filas: R a AF) */}
        <div className="relative p-6 rounded-2xl bg-slate-200/50 border border-slate-300/60 flex flex-col items-center">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1E2A39] text-white text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow-sm">
            Bloque Inferior ({totalBottomSeats})
          </div>
          {renderBlock(BLOCK_BOTTOM_ROWS, BLOCK_TOP_ROWS.length, 'bottom')} {/* Continúa desde 'R' */}
        </div>

      </div>

      {/* Leyenda de estados */}
      <div className="flex items-center gap-6 mt-8 text-xs font-medium text-slate-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-white border border-slate-300"></div>
          <span>Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#00a354]"></div>
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