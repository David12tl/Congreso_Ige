'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { obtenerAsientosOcupados, apartarAsientosEnBD } from './actions'; 

interface TeatroMapProps {
  color: string;
  asientosSeleccionados: string[];
  setAsientosSeleccionados: React.Dispatch<React.SetStateAction<string[]>>;
  eventId: string; // 🌟 Prop obligatoria para inyectar el evento desde el padre
}

interface Asiento {
  id: string;
  fila: string;
  numero: number;
  estado: 'disponible' | 'ocupado';
}

export default function TeatroMap({ color, asientosSeleccionados, setAsientosSeleccionados, eventId }: TeatroMapProps) {
  const [seccionSeleccionada, setSeccionSeleccionada] = useState<string | null>(null);
  const [asientosZona, setAsientosZona] = useState<Asiento[]>([]);
  const [isPending, startTransition] = useTransition();

  // Escucha cambios en la sección y jala datos reales en vivo
  useEffect(() => {
    if (!seccionSeleccionada) return;

    async function cargarSeccion() {
      // Usamos '!' para asegurarle a TS que el flujo ya validó que no es nulo
      const asientosOcupadosEnBD = await obtenerAsientosOcupados(seccionSeleccionada!);

      const filas = ['A', 'B', 'C', 'D', 'E'];
      const asientosEstructurados: Asiento[] = [];
      
      filas.forEach((fila) => {
        for (let i = 1; i <= 14; i++) {
          const idAsiento = `${seccionSeleccionada}-${fila}-${i}`;
          const yaEstaOcupado = asientosOcupadosEnBD.includes(idAsiento);

          asientosEstructurados.push({
            id: idAsiento,
            fila,
            numero: i,
            estado: yaEstaOcupado ? 'ocupado' : 'disponible',
          });
        }
      });

      setAsientosZona(asientosEstructurados);
    }

    cargarSeccion();
  }, [seccionSeleccionada, asientosSeleccionados]); 

  const manejarClickSeccion = (idSeccion: string) => {
    setSeccionSeleccionada(idSeccion);
  };

  const seleccionarAsiento = (asientoId: string, estado: string) => {
    if (estado === 'ocupado') return;
    setAsientosSeleccionados((prev) =>
      prev.includes(asientoId) ? prev.filter((id) => id !== asientoId) : [...prev, asientoId]
    );
  };

  const finalizarReserva = () => {
    if (asientosSeleccionados.length === 0) return;

    startTransition(async () => {
      // Enviamos la petición relacional con el ID dinámico
      const res = await apartarAsientosEnBD(asientosSeleccionados, eventId);
      
      if (res.success) {
        alert(res.message);
        setAsientosSeleccionados([]); 
        const seccionActual = seccionSeleccionada;
        setSeccionSeleccionada(null);
        setTimeout(() => setSeccionSeleccionada(seccionActual), 50);
      } else {
        alert(res.message);
      }
    });
  };

  return (
    <div className="w-full bg-[#0d0e12] text-white p-6 rounded-2xl border border-gray-900 font-sans">
      <div className="w-full mx-auto">
        
        <header className="text-center mb-8">
          <h2 className="text-2xl font-bold tracking-wider uppercase" style={{ color: color }}>
            Auditorio Metropolitano Orizaba
          </h2>
          <p className="text-xs text-gray-400 mt-1">Selección de Asientos en Tiempo Real</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 bg-[#14161d] p-6 rounded-xl border border-gray-800 flex flex-col items-center">
            <div 
              className="w-full max-w-md h-7 rounded-t-full text-center text-[10px] font-bold text-black pt-1"
              style={{ 
                background: `linear-gradient(to bottom, ${color}, transparent)`,
                boxShadow: `0 4px 20px ${color}55`
              }}
            >
              ESCENARIO
            </div>

            <p className="text-[11px] text-gray-500 my-4">Haz clic en una sección para ver los lugares disponibles</p>

            <div className="w-full flex flex-col gap-3 items-center">
              <div className="w-full border border-dashed border-gray-800 p-3 rounded-lg text-center">
                <span className="text-[10px] font-semibold tracking-widest text-gray-500 block mb-2">PLATEA BAJA</span>
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    type="button"
                    onClick={() => manejarClickSeccion('Platea Izquierda')}
                    style={seccionSeleccionada === 'Platea Izquierda' ? { backgroundColor: color, color: '#000' } : {}}
                    className={`p-3 rounded font-bold text-xs transition-all ${seccionSeleccionada === 'Platea Izquierda' ? '' : 'bg-gray-800 hover:bg-gray-700'}`}>
                    Izq.
                  </button>
                  <button 
                    type="button"
                    onClick={() => manejarClickSeccion('Platea Central')}
                    style={seccionSeleccionada === 'Platea Central' ? { backgroundColor: color, color: '#000' } : { borderColor: `${color}44`, color: color }}
                    className={`p-3 rounded font-bold text-xs transition-all border ${seccionSeleccionada === 'Platea Central' ? '' : 'bg-transparent hover:bg-gray-800/40'}`}>
                    CENTRAL ⭐
                  </button>
                  <button 
                    type="button"
                    onClick={() => manejarClickSeccion('Platea Derecha')}
                    style={seccionSeleccionada === 'Platea Derecha' ? { backgroundColor: color, color: '#000' } : {}}
                    className={`p-3 rounded font-bold text-xs transition-all ${seccionSeleccionada === 'Platea Derecha' ? '' : 'bg-gray-800 hover:bg-gray-700'}`}>
                    Der.
                  </button>
                </div>
              </div>

              <div className="w-full grid grid-cols-2 gap-2">
                <button 
                  type="button"
                  onClick={() => manejarClickSeccion('Primer Piso Izq')}
                  style={seccionSeleccionada === 'Primer Piso Izq' ? { backgroundColor: color, color: '#000' } : {}}
                  className={`p-2.5 rounded font-semibold text-xs transition-all ${seccionSeleccionada === 'Primer Piso Izq' ? '' : 'bg-gray-800/50 border border-gray-700 hover:bg-gray-700'}`}>
                  1er Piso - Balcón Izq.
                </button>
                <button 
                  type="button"
                  onClick={() => manejarClickSeccion('Primer Piso Der')}
                  style={seccionSeleccionada === 'Primer Piso Der' ? { backgroundColor: color, color: '#000' } : {}}
                  className={`p-2.5 rounded font-semibold text-xs transition-all ${seccionSeleccionada === 'Primer Piso Der' ? '' : 'bg-gray-700 hover:bg-gray-700'}`}>
                  1er Piso - Balcón Der.
                </button>
              </div>

              <button 
                type="button"
                onClick={() => manejarClickSeccion('Segundo Piso')}
                style={seccionSeleccionada === 'Segundo Piso' ? { backgroundColor: color, color: '#000' } : {}}
                className={`w-full p-2.5 rounded font-semibold text-xs tracking-wide transition-all ${seccionSeleccionada === 'Segundo Piso' ? '' : 'bg-gray-900 border border-gray-800 hover:bg-gray-800'}`}>
                2do Piso - General
              </button>
            </div>

            {seccionSeleccionada && (
              <div className="w-full mt-6 pt-5 border-t border-gray-800 text-center">
                <h4 className="text-xs font-bold text-gray-400 mb-3">
                  Sección activa: <span className="uppercase" style={{ color: color }}>{seccionSeleccionada}</span>
                </h4>
                
                <div className="grid grid-cols-14 gap-1 max-w-lg mx-auto justify-center bg-black/30 p-3 rounded-xl">
                  {asientosZona.map((asiento) => {
                    const estaSeleccionado = asientosSeleccionados.includes(asiento.id);
                    return (
                      <button
                        key={asiento.id}
                        type="button"
                        disabled={asiento.estado === 'ocupado'}
                        onClick={() => seleccionarAsiento(asiento.id, asiento.estado)}
                        style={estaSeleccionado ? { backgroundColor: color, color: '#000' } : {}}
                        title={`Fila ${asiento.fila} - Asiento ${asiento.numero}`}
                        className={`h-5 w-full rounded-t-sm text-[8px] font-medium flex items-center justify-center transition-all
                          ${asiento.estado === 'ocupado' ? 'bg-gray-800/40 text-gray-500/70 cursor-not-allowed line-through' : ''}
                          ${asiento.estado === 'disponible' && !estaSeleccionado ? 'bg-emerald-600/80 hover:bg-emerald-500 text-white' : ''}
                          ${estaSeleccionado ? 'font-bold scale-110 ring-1 ring-white' : ''}
                        `}>
                        {asiento.numero}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="bg-[#14161d] p-5 rounded-xl border border-gray-800 flex flex-col justify-between h-auto">
            <div>
              <h3 className="text-base font-bold border-b border-gray-800 pb-2 mb-3">Reservación</h3>
              {(!asientosSeleccionados || asientosSeleccionados.length === 0) ? (
                <p className="text-xs text-gray-500 italic">No hay asientos apartados.</p>
              ) : (
                <div className="flex flex-col gap-1.5 max-h-60 overflow-y-auto pr-1">
                  {asientosSeleccionados.map((id) => {
                    const partes = id.split('-');
                    const num = partes.pop();
                    const fila = partes.pop();
                    const seccion = partes.join(' ');
                    return (
                      <div key={id} className="flex justify-between items-center bg-black/40 p-2 rounded text-[11px]">
                        <div>
                          <span className="font-bold block" style={{ color: color }}>{seccion}</span>
                          <span className="text-gray-400">Fila {fila} • Asiento {num}</span>
                        </div>
                        <button 
                          type="button"
                          onClick={() => seleccionarAsiento(id, 'disponible')}
                          className="text-red-400 hover:text-red-300 font-bold px-1">✕</button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-6 border-t border-gray-800 pt-3 space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">Lugares seleccionados:</span>
                <span className="font-bold text-sm text-white">{(asientosSeleccionados || []).length}</span>
              </div>

              {asientosSeleccionados.length > 0 && (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={finalizarReserva}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-gray-800 text-black font-black text-xs rounded-lg uppercase tracking-wider transition-all shadow-md"
                >
                  {isPending ? 'Guardando en Supabase...' : 'Confirmar y Apartar Lugares'}
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}