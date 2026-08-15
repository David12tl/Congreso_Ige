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
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-600 tracking-wider">
            <tr>
              <th className="px-6 py-4">Código Token</th>
              <th className="px-6 py-4">Cliente Asignado</th>
              <th className="px-6 py-4">Estado Canje</th>
              <th className="px-6 py-4">Estado Pago</th>
              <th className="px-6 py-4">Monto Abonado</th>
              <th className="px-6 py-4">Creado El</th>
              <th className="px-6 py-4 text-right">Acción</th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredTokens.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                  No se encontraron registros coincidentes.
                </td>
              </tr>
            ) : (
              filteredTokens.map((token: TokenCanje) => (
                <tr key={token.id} className="hover:bg-gray-50 transition-colors">
                  {/* Código en fuente Mono */}
                  <td className="px-6 py-4 font-mono font-bold text-gray-900 select-all">
                    {token.token_code}
                  </td>
                  
                  {/* Cliente que usó el token */}
                  <td className="px-6 py-4">
                    {token.cliente_nombre && token.cliente_nombre.trim() !== "" ? (
                      <div>
                        <div className="font-medium text-gray-900 uppercase text-xs tracking-wider">
                          {token.cliente_nombre}
                        </div>
                        {token.cliente_correo && (
                          <div className="text-xs text-gray-500 font-mono mt-0.5">
                            {token.cliente_correo}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 italic text-xs">Disponible / Sin usar</span>
                    )}
                  </td>
                  
                  {/* Badge de Estado Canje */}
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                      token.status === 'disponible' ? 'bg-green-100 text-green-800' :
                      token.status === 'usado' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {token.status}
                    </span>
                  </td>
                  
                  {/* Badge de Estado de Pago */}
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                      token.estado_pago === 'completado' ? 'bg-emerald-100 text-emerald-800' :
                      token.estado_pago === 'faltante' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {token.estado_pago}
                    </span>
                  </td>
                  
                  {/* Monto formateado a moneda */}
                  <td className="px-6 py-4 font-medium text-gray-700">
                    ${Number(token.total_abonado).toFixed(2)}
                  </td>
                  
                  {/* Fecha de Creación */}
                  <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
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