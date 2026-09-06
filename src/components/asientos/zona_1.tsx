'use client';

import React, { useState } from 'react';

const TOP_ROWS = [27,27,28,30,30,31,32,33,33,34,36,37,37,38,40,40,40];
const BOTTOM_ROWS = [43,43,43,43,43,43,43,43,43,43,43,42,42,42,42];

const ACCENT = "#7c3aed";

function getRowLabel(i:number):string{return i<26?String.fromCharCode(65+i):"A"+String.fromCharCode(65+i-26)}

export interface SeatSelectionInfo {label:string;bloque:string;fila:string;numero:number}
interface SeatMapProps {onSeatSelect?:(id:string,info:SeatSelectionInfo)=>void;occupiedSeats?:string[]}

export default function Zona1({onSeatSelect,occupiedSeats=[]}:SeatMapProps){
  const [sel,setSel]=useState<string|null>(null);
  const [show,setShow]=useState<boolean>(false);
  const pick=(id:string,info:SeatSelectionInfo)=>{if(occupiedSeats.includes(id))return;setSel(id);onSeatSelect?.(id,info)};
  const totalTop=TOP_ROWS.reduce((a,c)=>a+c,0);
  const totalBot=BOTTOM_ROWS.reduce((a,c)=>a+c,0);
  const renderBlock=(rows:number[],start:number,name:string)=>(
    <div className="flex flex-col items-center gap-2">
      {rows.map((cnt,ri)=>{
        const row=getRowLabel(start+ri);
        return <div key={name+"-"+ri} className="flex items-center gap-1.5 justify-center">
          <span className="w-6 text-right font-mono text-xs font-bold text-slate-400 select-none mr-1">{row}</span>
          <div className="flex gap-1.5 justify-center">
            {Array.from({length:cnt}).map((_,si)=>{
              const num=si+1;const id=row+"-"+num;
              const info:SeatSelectionInfo={label:id,bloque:name,fila:row,numero:num};
              const occ=occupiedSeats.includes(id);const isSel=sel===id;
              return <button key={id} onClick={()=>pick(id,info)} disabled={occ}
                className={"w-6 h-6 sm:w-7 sm:h-7 rounded-t-md text-[10px] font-bold transition-all duration-150 flex items-center justify-center border "+(occ?"bg-slate-300 border-slate-400 text-slate-500 cursor-not-allowed":isSel?"bg-violet-600 text-white border-violet-600 scale-110 shadow-md ring-2 ring-violet-500/30":"bg-white border-slate-300 text-slate-700 hover:border-violet-500 hover:bg-violet-50")}
                title={"Zona 1 (TEH - TEQ - CUI) - Asiento "+id}>{num}</button>
            })}</div>
          <span className="w-6 text-left font-mono text-xs font-bold text-slate-400 select-none ml-1">{row}</span>
        </div>
      })}</div>
  );
  return <div className="w-full flex flex-col items-center bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
    <div className="w-64 sm:w-80 h-3 bg-slate-800 rounded-b-xl mb-6 flex items-center justify-center"><span className="text-[9px] font-black uppercase tracking-widest text-white/80">Escenario</span></div>
    <button onClick={()=>setShow(s=>!s)} className={"px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-150 border-2 shadow-sm mb-6 "+(show?"bg-violet-600 text-white border-violet-600 scale-105 shadow-md ring-2 ring-violet-500/30":"bg-white text-slate-700 border-slate-300 hover:border-violet-500 hover:bg-violet-50")}>{show?"Ocultar TEH - TEQ - CUI":"Ver TEH - TEQ - CUI"}</button>
    {show&&<>
      <div className="flex flex-col items-center gap-8 min-w-max">
        <div className="relative p-6 rounded-2xl bg-slate-200/50 border border-slate-300/60 flex flex-col items-center">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow-sm">TEH - TEQ - CUI &mdash; Bloque Superior ({totalTop})</div>
          {renderBlock(TOP_ROWS,0,"top")}</div>
        <div className="w-full border-b border-dashed border-slate-300 relative my-1"><span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-slate-50 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pasillo Central</span></div>
        <div className="relative p-6 rounded-2xl bg-slate-200/50 border border-slate-300/60 flex flex-col items-center">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow-sm">TEH - TEQ - CUI &mdash; Bloque Inferior ({totalBot})</div>
          {renderBlock(BOTTOM_ROWS,TOP_ROWS.length,"bottom")}</div>
      </div>
    </>}
    <div className="flex items-center gap-6 mt-8 text-xs font-medium text-slate-600">
      <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-white border border-slate-300"></div><span>Disponible</span></div>
      <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-violet-600"></div><span>Seleccionado</span></div>
      <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-slate-300 border border-slate-400"></div><span>Ocupado</span></div>
    </div>
  </div>
}