'use client';

import React, { useState } from 'react';

const TEH_TOP_ROWS = [9,9,9,10,10,10,10,11,11,11,12,12,12,13,13,13,13];
const TEH_BOTTOM_ROWS = [14,14,14,14,14,14,14,14,14,14,14,14,14,14,14];
const TEQ_TOP_ROWS = [8,8,9,9,9,10,10,10,11,11,11,12,12,12,13,13,13];
const TEQ_BOTTOM_ROWS = [14,14,14,14,14,14,14,14,14,14,14,13,13,13,13];
const CUI_TOP_ROWS = [10,10,10,11,11,11,12,12,12,12,13,13,13,13,14,14,14];
const CUI_BOTTOM_ROWS = [15,15,15,15,15,15,15,15,15,15,15,15,15,15,15];

type Zona1View = 'TEH' | 'TEQ' | 'CUI';

const ZONA1_BUTTONS: { key: Zona1View; label: string; accent: string }[] = [
  { key: 'TEH', label: 'TEH', accent: '#059669' },
  { key: 'TEQ', label: 'TEQ', accent: '#0891b2' },
  { key: 'CUI', label: 'CUI', accent: '#d97706' },
];

function getRowLabel(index: number): string {
  if (index < 26) return String.fromCharCode(65 + index);
  return 'A' + String.fromCharCode(65 + (index - 26));
}

export interface SeatSelectionInfo {
  label: string; bloque: string; fila: string; numero: number;
}

interface SeatMapProps {
  onSeatSelect?: (seatId: string, seatInfo: SeatSelectionInfo) => void;
  occupiedSeats?: string[];
}

export default function Zona1({ onSeatSelect, occupiedSeats = [] }: SeatMapProps) {
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<Zona1View>('TEH');

  const handleSelect = (seatId: string, seatInfo: SeatSelectionInfo) => {
    if (occupiedSeats.includes(seatId)) return;
    setSelectedSeat(seatId);
    if (onSeatSelect) onSeatSelect(seatId, seatInfo);
  };
  const renderBlock = (rows: number[], startRowIndex: number, blockName: string, accentColor: string) => {
    return (
      <div className="flex flex-col items-center gap-2">
        {rows.map((seatCount, rowIndex) => {
          const absoluteRowIndex = startRowIndex + rowIndex;
          const rowLetter = getRowLabel(absoluteRowIndex);
          return (
            <div key={blockName + "-row-" + rowIndex} className="flex items-center gap-1.5 justify-center">
              <span className="w-6 text-right font-mono text-xs font-bold text-slate-400 select-none mr-1">{rowLetter}</span>
              <div className="flex gap-1.5 justify-center">
                {Array.from({ length: seatCount }).map((_, seatIdx) => {
                  const seatNumber = seatIdx + 1;
                  const seatId = rowLetter + "-" + seatNumber;
                  const seatInfo: SeatSelectionInfo = { label: seatId, bloque: blockName, fila: rowLetter, numero: seatNumber };
                  const isOccupied = occupiedSeats.includes(seatId);
                  const isSelected = selectedSeat === seatId;
                  return (
                    <button
                      key={seatId}
                      onClick={() => handleSelect(seatId, seatInfo)}
                      disabled={isOccupied}
                      title={"Zona 1 (" + activeView + ") - Asiento " + seatId}
                      className={"w-6 h-6 sm:w-7 sm:h-7 rounded-t-md text-[10px] font-bold transition-all duration-150 flex items-center justify-center border " + (isOccupied ? "bg-slate-300 border-slate-400 text-slate-500 cursor-not-allowed" : isSelected ? "text-white scale-110 shadow-md ring-2" : "bg-white border-slate-300 text-slate-700 hover:bg-slate-100")}
                      style={isSelected ? { backgroundColor: accentColor, borderColor: accentColor } : undefined}
                    >
                      {seatNumber}
                    </button>
                  );
                })}
              </div>
              <span className="w-6 text-left font-mono text-xs font-bold text-[#7D7D7D] select-none ml-1">{rowLetter}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const currentAccent = ZONA1_BUTTONS.find(b => b.key === activeView)?.accent ?? "#059669";
  const topRows = activeView === "TEH" ? TEH_TOP_ROWS : activeView === "TEQ" ? TEQ_TOP_ROWS : CUI_TOP_ROWS;
  const bottomRows = activeView === "TEH" ? TEH_BOTTOM_ROWS : activeView === "TEQ" ? TEQ_BOTTOM_ROWS : CUI_BOTTOM_ROWS;
  const totalTopSeats = topRows.reduce((acc, count) => acc + count, 0);
  const totalBottomSeats = bottomRows.reduce((acc, count) => acc + count, 0);

  return (
    <div className="w-full flex flex-col items-center bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
      <div className="w-64 sm:w-80 h-3 bg-[#1E2A39] rounded-b-xl mb-6 shadow-sm flex items-center justify-center">
        <span className="text-[9px] font-black uppercase tracking-widest text-white/80">Escenario</span>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
        {ZONA1_BUTTONS.map((btn) => (
          <button
            key={btn.key}
            onClick={() => { setActiveView(btn.key); setSelectedSeat(null); }}
            className={"px-5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-150 border-2 shadow-sm " + (activeView === btn.key ? "text-white scale-105 shadow-md ring-2" : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50")}
            style={activeView === btn.key ? { backgroundColor: btn.accent, borderColor: btn.accent } : undefined}
            onMouseEnter={(e) => { if (activeView !== btn.key) (e.currentTarget as HTMLElement).style.borderColor = btn.accent; }}
            onMouseLeave={(e) => { if (activeView !== btn.key) (e.currentTarget as HTMLElement).style.borderColor = ""; }}
          >
            {btn.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col items-center gap-8 min-w-max">
        <div className="relative p-6 rounded-2xl bg-slate-200/50 border border-slate-300/60 flex flex-col items-center">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-white text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow-sm" style={{ backgroundColor: currentAccent }}>
            {activeView} — Bloque Superior ({totalTopSeats})
          </div>
          {renderBlock(topRows, 0, "top", currentAccent)}
        </div>

        <div className="w-full border-b border-dashed border-slate-300 relative my-1">
          <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-slate-50 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pasillo Central</span>
        </div>

        <div className="relative p-6 rounded-2xl bg-slate-200/50 border border-slate-300/60 flex flex-col items-center">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-white text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow-sm" style={{ backgroundColor: currentAccent }}>
            {activeView} — Bloque Inferior ({totalBottomSeats})
          </div>
          {renderBlock(bottomRows, topRows.length, "bottom", currentAccent)}
        </div>
      </div>

      <div className="flex items-center gap-6 mt-8 text-xs font-medium text-slate-600">
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-white border border-slate-300"></div><span>Disponible</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded" style={{ backgroundColor: currentAccent }}></div><span>Seleccionado</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-slate-300 border border-slate-400"></div><span>Ocupado</span></div>
      </div>
    </div>
  );
}