'use client';

import React, { useState } from 'react';

const TEH_TOP_ROWS = [9,9,9,10,10,10,10,11,11,11,12,12,12,13,13,13,13];
const TEH_BOTTOM_ROWS = [14,14,14,14,14,14,14,14,14,14,14,14,14,14,14];
const TEQ_TOP_ROWS = [8,8,9,9,9,10,10,10,11,11,11,12,12,12,13,13,13];
const TEQ_BOTTOM_ROWS = [14,14,14,14,14,14,14,14,14,14,14,13,13,13,13];
const CUI_TOP_ROWS = [10,10,10,11,11,11,12,12,12,12,13,13,13,13,14,14,14];
const CUI_BOTTOM_ROWS = [15,15,15,15,15,15,15,15,15,15,15,15,15,15,15];

const BTN_CLASSES = {
  TEH: { key: "TEH", label: "TEH", accent: "#059669", selected: "bg-emerald-600 text-white border-emerald-600" },
  TEQ: { key: "TEQ", label: "TEQ", accent: "#0891b2", selected: "bg-cyan-600 text-white border-cyan-600" },
  CUI: { key: "CUI", label: "CUI", accent: "#d97706", selected: "bg-amber-600 text-white border-amber-600" },
} as const;
type ViewKey = keyof typeof BTN_CLASSES;

function getRowLabel(i:number):string{return i<26?String.fromCharCode(65+i):"A"+String.fromCharCode(65+i-26)}

export interface SeatSelectionInfo {label:string;bloque:string;fila:string;numero:number}
interface SeatMapProps {onSeatSelect?:(id:string,info:SeatSelectionInfo)=>void;occupiedSeats?:string[]}

export default function Zona1({onSeatSelect,occupiedSeats=[]}:SeatMapProps){
  const [sel,setSel]=useState<string|null>(null);
  const [view,setView]=useState<ViewKey>("TEH");
  const pick=(id:string,info:SeatSelectionInfo)=>{if(occupiedSeats.includes(id))return;setSel(id);onSeatSelect?.(id,info)};
  const accent=BTN_CLASSES[view].accent;
  const topRows=view==="TEH"?TEH_TOP_ROWS:view==="TEQ"?TEQ_TOP_ROWS:CUI_TOP_ROWS;
  const botRows=view==="TEH"?TEH_BOTTOM_ROWS:view==="TEQ"?TEQ_BOTTOM_ROWS:CUI_BOTTOM_ROWS;
  const totalTop=topRows.reduce((a,c)=>a+c,0);
  const totalBot=botRows.reduce((a,c)=>a+c,0);
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
                className={"w-6 h-6 sm:w-7 sm:h-7 rounded-t-md text-[10px] font-bold transition-all duration-150 flex items-center justify-center border "+(occ?"bg-slate-300 border-slate-400 text-slate-500 cursor-not-allowed":isSel?"text-white scale-110 shadow-md ring-2":"bg-white border-slate-300 text-slate-700 hover:bg-slate-100")}
                style={isSel?{backgroundColor:accent,borderColor:accent}:{}}
                title={"Zona 1 ("+view+") - Asiento "+id}>{num}</button>
            })}</div>
          <span className="w-6 text-left font-mono text-xs font-bold text-slate-400 select-none ml-1">{row}</span>
        </div>
      })}</div>
  );
  return <div className="w-full flex flex-col items-center bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
    <div className="w-64 sm:w-80 h-3 bg-slate-800 rounded-b-xl mb-6 flex items-center justify-center"><span className="text-[9px] font-black uppercase tracking-widest text-white/80">Escenario</span></div>
    <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
      {(Object.keys(BTN_CLASSES) as ViewKey[]).map(k=>{const b=BTN_CLASSES[k];return <button key={k} onClick={()=>{setView(k);setSel(null)}}
        className={"px-5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-150 border-2 shadow-sm "+(view===k?b.selected+" scale-105 ring-2":"bg-white text-slate-700 border-slate-300 hover:bg-slate-50")}
        style={view===k?{borderColor:b.accent}:{}}>
        {b.label}</button>
      })}</div>
    <div className="flex flex-col items-center gap-8 min-w-max">
      <div className="relative p-6 rounded-2xl bg-slate-200/50 border border-slate-300/60 flex flex-col items-center">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-white text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow-sm" style={{backgroundColor:accent}}>{view} &mdash; Bloque Superior ({totalTop})</div>
        {renderBlock(topRows,0,"top")}</div>
      <div className="w-full border-b border-dashed border-slate-300 relative my-1"><span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-slate-50 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pasillo Central</span></div>
      <div className="relative p-6 rounded-2xl bg-slate-200/50 border border-slate-300/60 flex flex-col items-center">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-white text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow-sm" style={{backgroundColor:accent}}>{view} &mdash; Bloque Inferior ({totalBot})</div>
        {renderBlock(botRows,topRows.length,"bottom")}</div>
    </div>
    <div className="flex items-center gap-6 mt-8 text-xs font-medium text-slate-600">
      <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-white border border-slate-300"></div><span>Disponible</span></div>
      <div className="flex items-center gap-2"><div className="w-4 h-4 rounded" style={{backgroundColor:accent}}></div><span>Seleccionado</span></div>
      <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-slate-300 border border-slate-400"></div><span>Ocupado</span></div>
    </div>
  </div>
}