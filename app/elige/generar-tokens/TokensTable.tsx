"use client";

import React, { useState } from 'react';

// Tipos adaptados al 100% a tus datos reales de la BD
export type TokenStatus = 'disponible' | 'usado' | 'expirado';
export type EstadoPago = 'faltante' | 'completado' | string;

export interface TokenCanje {
  id: string;
  token_code: string;
  status: TokenStatus | string;
  estado_pago: EstadoPago;
  total_abonado: number | string;
  created_at: string;
  utilizado_el?: string | null;
  cliente_nombre?: string; 
  cliente_correo?: string;
}

// Interfaz interna para mapear de forma segura posibles variaciones de mayúsculas desde SQL sin usar 'any'
interface TokenConVariantes extends TokenCanje {
  Cliente_Nombre?: string;
  CLIENTE_NOMBRE?: string;
  Cliente_Correo?: string;
  CLIENTE_CORREO?: string;
}

interface TokensTableProps {
  tokens: TokenCanje[];
  isLoading?: boolean;
}

export const TokensTable: React.FC<TokensTableProps> = ({ tokens = [], isLoading = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  // Procesamos los tokens para asegurar que React encuentre las propiedades
  // sin importar variaciones de mayúsculas/minúsculas de la consulta SQL original
  const filteredTokens = (tokens as TokenConVariantes[]).map((t: TokenConVariantes): TokenCanje => {
    const nombre = t.cliente_nombre || t.Cliente_Nombre || t.CLIENTE_NOMBRE || '';
    const correo = t.cliente_correo || t.Cliente_Correo || t.CLIENTE_CORREO || '';
    
    return {
      id: t.id,
      token_code: t.token_code,
      status: t.status,
      estado_pago: t.estado_pago,
      total_abonado: t.total_abonado,
      created_at: t.created_at,
      utilizado_el: t.utilizado_el,
      cliente_nombre: nombre,
      cliente_correo: correo
    };
  }).filter((token: TokenCanje) => {
    const searchLower = searchTerm.toLowerCase();
    
    const matchesCode = token.token_code.toLowerCase().includes(searchLower);
    const matchesNombre = token.cliente_nombre?.toLowerCase().includes(searchLower) || false;
    const matchesCorreo = token.cliente_correo?.toLowerCase().includes(searchLower) || false;
    
    const matchesSearch = matchesCode || matchesNombre || matchesCorreo;
    const matchesStatus = statusFilter === 'todos' || token.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-2 text-gray-600">Cargando tokens...</span>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      {/* Encabezado y Herramientas */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Control de Tokens de Canje</h2>
          <p className="text-sm text-gray-500">Monitorea y asigna los tokens para clientes con pagos pendientes o completados.</p>
        </div>
        
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Buscar por código, nombre o correo..."
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="todos">Todos los estados</option>
            <option value="disponible">Disponibles</option>
            <option value="usado">Usados</option>
            <option value="expirado">Expirados</option>
          </select>
        </div>
      </div>

      {/* Tabla Principal */}
      <div className="w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full border-collapse text-left text-sm text-slate-500">
          <thead className="bg-[#1E2A39]/5 text-[11px] font-black uppercase tracking-widest text-[#1E2A39]">
            <tr>
              <th scope="col" className="px-6 py-4">Código Token</th>
              <th scope="col" className="px-6 py-4">Cliente Asignado</th>
              <th scope="col" className="px-6 py-4">Estado Canje</th>
              <th scope="col" className="px-6 py-4">Estado Pago</th>
              <th scope="col" className="px-6 py-4">Monto Abonado</th>
              <th scope="col" className="px-6 py-4">Creado El</th>
              <th scope="col" className="px-6 py-4 text-right">Acción</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 border-t border-slate-100 font-medium text-slate-900">
            {filteredTokens.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-slate-400 font-medium">
                  No se encontraron registros coincidentes.
                </td>
              </tr>
            ) : (
              filteredTokens.map((token: TokenCanje) => (
                <tr key={token.id} className="hover:bg-slate-50/50 transition-colors">
                  {/* Código en fuente Mono */}
                  <td className="px-6 py-4 font-mono font-bold text-[#1E2A39] select-all">
                    {token.token_code}
                  </td>

                  {/* Cliente que usó el token */}
                  <td className="px-6 py-4 text-[#7D7D7D]">
                    {token.cliente_nombre && token.cliente_nombre.trim() !== '' ? (
                      <div>
                        <div className="font-medium text-slate-900 uppercase text-xs tracking-wider">
                          {token.cliente_nombre}
                        </div>
                        {token.cliente_correo && (
                          <div className="text-xs text-slate-400 font-mono mt-0.5">
                            {token.cliente_correo}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400 italic text-xs">Usuario Registrado</span>
                    )}
                  </td>

                  {/* Badge de Estado Canje */}
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold uppercase ring-1 ring-inset ${
                      token.status === 'disponible' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/10' :
                      token.status === 'usado' ? 'bg-blue-50 text-blue-700 ring-blue-700/10' : 'bg-slate-50 text-slate-600 ring-slate-500/10'
                    }`}>
                      {token.status}
                    </span>
                  </td>

                  {/* Badge de Estado de Pago */}
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold uppercase ring-1 ring-inset ${
                      token.estado_pago === 'completado' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/10' :
                      token.estado_pago === 'faltante' ? 'bg-amber-50 text-amber-700 ring-amber-600/10' : 'bg-red-50 text-red-700 ring-red-600/10'
                    }`}>
                      {token.estado_pago}
                    </span>
                  </td>

                  {/* Monto formateado a moneda */}
                  <td className="px-6 py-4 font-semibold text-[#1E2A39]">
                    ${Number(token.total_abonado).toFixed(2)}
                  </td>

                  {/* Fecha de Creación */}
                  <td className="px-6 py-4 text-xs text-[#7D7D7D] whitespace-nowrap">
                    {new Date(token.created_at).toLocaleDateString('es-MX', {
                      day: '2-digit', month: 'short', year: 'numeric'
                    })}
                  </td>

                  {/* Acciones del renglón */}
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(token.token_code);
                        alert(`¡Código ${token.token_code} copiado!`);
                      }}
                      className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-md transition-colors"
                    >
                      Copiar Código
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Paginación / Resumen de conteos */}
      <div className="mt-4 text-xs text-gray-500 text-right">
        Mostrando {filteredTokens.length} de {tokens.length} tokens registrados.
      </div>
    </div>
  );
};