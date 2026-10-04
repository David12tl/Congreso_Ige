"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  HiSearch,
  HiChevronLeft,
  HiChevronRight,
  HiChevronDoubleLeft,
  HiChevronDoubleRight,
  HiClipboardCopy,
  HiCheck,
  HiRefresh,
  HiFilter
} from 'react-icons/hi';

export interface TokenGeneralItem {
  token_code: string;
  status: string;
  estado_pago: string;
  total_abonado: number;
  nombre: string;
  email: string;
  matricula: string;
}

// Función auxiliar para normalizar texto (elimina diacríticos / tildes y pasa a minúsculas)
const normalizeText = (text: string = ''): string => {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
};

export const TokensGeneralTable: React.FC = () => {
  const [tokens, setTokens] = useState<TokenGeneralItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Estados de filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [soloCompletados, setSoloCompletados] = useState<boolean>(false);

  // Paginación
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Estado visual para retroalimentación al copiar
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  /**
   * Consulta a Supabase equivalente a:
   * SELECT v.token_code, v.status, v.estado_pago, v.total_abonado,
   *        t.nombre, t.email, t.matricula
   * FROM vista_tokens_detalles v
   * JOIN tickets t ON v.ticket_id = t.id;
   */
  const fetchTodosLosTokens = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const supabase = createClient();

      // 1. Intentamos ejecutar con el JOIN relacional a tickets según convención Supabase PostgREST
      const { data: relData, error: relError } = await (supabase
        .from('vista_tokens_detalles' as unknown as 'tokens_canje')
        .select(`
          token_code,
          status,
          estado_pago,
          total_abonado,
          tickets (
            nombre,
            email,
            matricula
          )
        `) as unknown as Promise<{
          data: Array<{
            token_code: string | null;
            status: string | null;
            estado_pago: string | null;
            total_abonado: number | string | null;
            tickets?: {
              nombre?: string | null;
              email?: string | null;
              matricula?: string | null;
            } | Array<{
              nombre?: string | null;
              email?: string | null;
              matricula?: string | null;
            }> | null;
            nombre?: string | null;
            email?: string | null;
            matricula?: string | null;
            cliente_nombre?: string | null;
            cliente_correo?: string | null;
          }> | null;
          error: { message: string } | null;
        }>);

      if (!relError && relData) {
        const mappedTokens: TokenGeneralItem[] = relData.map((item) => {
          const ticketRel = Array.isArray(item.tickets) ? item.tickets[0] : item.tickets;
          const resolvedNombre = ticketRel?.nombre || item.nombre || item.cliente_nombre || '';
          const resolvedEmail = ticketRel?.email || item.email || item.cliente_correo || '';
          const resolvedMatricula = ticketRel?.matricula || item.matricula || '';

          return {
            token_code: item.token_code || '',
            status: item.status || 'desconocido',
            estado_pago: item.estado_pago || 'sin_pago',
            total_abonado: Number(item.total_abonado) || 0,
            nombre: resolvedNombre,
            email: resolvedEmail,
            matricula: resolvedMatricula,
          };
        });

        setTokens(mappedTokens);
        return;
      }

      // 2. Si la vista ya proyecta directamente nombre, email y matrícula (o si no existe la FK en el schema cache de PostgREST)
      const { data: directData, error: directError } = await (supabase
        .from('vista_tokens_detalles' as unknown as 'tokens_canje')
        .select('token_code, status, estado_pago, total_abonado, nombre, email, matricula') as unknown as Promise<{
          data: Array<{
            token_code: string | null;
            status: string | null;
            estado_pago: string | null;
            total_abonado: number | string | null;
            nombre?: string | null;
            email?: string | null;
            matricula?: string | null;
            cliente_nombre?: string | null;
            cliente_correo?: string | null;
          }> | null;
          error: { message: string } | null;
        }>);

      if (!directError && directData) {
        const mappedTokens: TokenGeneralItem[] = directData.map((item) => ({
          token_code: item.token_code || '',
          status: item.status || 'desconocido',
          estado_pago: item.estado_pago || 'sin_pago',
          total_abonado: Number(item.total_abonado) || 0,
          nombre: item.nombre || item.cliente_nombre || '',
          email: item.email || item.cliente_correo || '',
          matricula: item.matricula || '',
        }));

        setTokens(mappedTokens);
        return;
      }

      // 3. Fallback con '*' en caso de variaciones de nombres de columnas
      const { data: allData, error: allError } = await (supabase
        .from('vista_tokens_detalles' as unknown as 'tokens_canje')
        .select('*') as unknown as Promise<{
          data: Array<Record<string, unknown>> | null;
          error: { message: string } | null;
        }>);

      if (allError) {
        throw new Error(relError?.message || directError?.message || allError.message);
      }

      const mappedTokens: TokenGeneralItem[] = (allData || []).map((row) => ({
        token_code: String(row.token_code || ''),
        status: String(row.status || 'desconocido'),
        estado_pago: String(row.estado_pago || 'sin_pago'),
        total_abonado: Number(row.total_abonado) || 0,
        nombre: String(row.nombre || row.cliente_nombre || row.Cliente_Nombre || ''),
        email: String(row.email || row.cliente_correo || row.Cliente_Correo || ''),
        matricula: String(row.matricula || row.Matricula || ''),
      }));

      setTokens(mappedTokens);
    } catch (err: unknown) {
      console.error('Error al consultar tokens generales:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Error desconocido al consultar los tokens.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Carga automática al montar el componente
  useEffect(() => {
    fetchTodosLosTokens();
  }, [fetchTodosLosTokens]);

  // Manejo de copiado al portapapeles con feedback temporal
  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Error al copiar código:', err);
    }
  };

  // Filtrado reactivo en memoria: Búsqueda, Estado de Canje y Filtro de Pago Completado
  const filteredTokens = useMemo(() => {
    const term = normalizeText(searchTerm.trim());
    const filterStatus = normalizeText(statusFilter);

    return tokens.filter((token) => {
      // 1. Filtro de búsqueda global (token_code, nombre, email, matricula)
      const matchesSearch =
        term === '' ||
        normalizeText(token.token_code).includes(term) ||
        normalizeText(token.nombre).includes(term) ||
        normalizeText(token.email).includes(term) ||
        normalizeText(token.matricula).includes(term);

      // 2. Filtro por status ('disponible', 'usado', 'expirado')
      const matchesStatus =
        statusFilter === 'todos' || normalizeText(token.status) === filterStatus;

      // 3. Filtro por pago completado
      const matchesPago =
        !soloCompletados || normalizeText(token.estado_pago) === 'completado';

      return matchesSearch && matchesStatus && matchesPago;
    });
  }, [tokens, searchTerm, statusFilter, soloCompletados]);

  // Reiniciar a la página 1 cuando cambien los criterios de búsqueda o filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, soloCompletados, itemsPerPage]);

  // Cálculos de Paginación
  const totalPages = Math.max(1, Math.ceil(filteredTokens.length / itemsPerPage));
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginatedTokens = useMemo(() => {
    const startIndex = (validCurrentPage - 1) * itemsPerPage;
    return filteredTokens.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTokens, validCurrentPage, itemsPerPage]);

  const startRecord = filteredTokens.length === 0 ? 0 : (validCurrentPage - 1) * itemsPerPage + 1;
  const endRecord = Math.min(validCurrentPage * itemsPerPage, filteredTokens.length);

  // Clases dinámicas para badges de estado de canje
  const getStatusBadge = (status: string) => {
    const norm = normalizeText(status);
    if (norm === 'disponible') {
      return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20';
    }
    if (norm === 'usado') {
      return 'bg-blue-50 text-blue-700 ring-blue-700/20';
    }
    if (norm === 'expirado') {
      return 'bg-amber-50 text-amber-700 ring-amber-600/20';
    }
    return 'bg-slate-50 text-slate-700 ring-slate-600/20';
  };

  // Clases dinámicas para badges de estado de pago
  const getPaymentBadge = (estadoPago: string) => {
    const norm = normalizeText(estadoPago);
    if (norm === 'completado') {
      return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20';
    }
    if (norm === 'faltante') {
      return 'bg-amber-50 text-amber-700 ring-amber-600/20';
    }
    if (norm === 'sin_pago') {
      return 'bg-rose-50 text-rose-700 ring-rose-600/20';
    }
    return 'bg-slate-50 text-slate-700 ring-slate-600/20';
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 space-y-6">
      {/* Encabezado y resumen */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Tokens Generales de Alumnos
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
              {tokens.length} registros
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Visualización general de tokens asociados a alumnos con estatus de canje y pagos.
          </p>
        </div>

        {/* Botón de Recargar Datos */}
        <button
          type="button"
          onClick={() => fetchTodosLosTokens()}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-lg transition disabled:opacity-50 cursor-pointer self-start md:self-auto"
          title="Recargar datos de la base de datos"
        >
          <HiRefresh className={`w-4 h-4 text-slate-600 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
        {/* Input de Búsqueda Global */}
        <div className="relative sm:col-span-2 lg:col-span-5">
          <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar por token, alumno, email o matrícula..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 bg-slate-50/70 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          />
        </div>

        {/* Selector de Estado de Canje */}
        <div className="lg:col-span-3">
          <div className="relative">
            <HiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-sm text-slate-800 bg-slate-50/70 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer transition"
            >
              <option value="todos">Todos los estados</option>
              <option value="disponible">Disponibles</option>
              <option value="usado">Usados</option>
              <option value="expirado">Expirados</option>
            </select>
          </div>
        </div>

        {/* Toggle para Pagos Completados */}
        <div className="lg:col-span-4 flex items-center justify-between sm:justify-start gap-3">
          <label className="inline-flex items-center gap-2.5 cursor-pointer select-none text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg hover:bg-slate-100 transition">
            <input
              type="checkbox"
              checked={soloCompletados}
              onChange={(e) => setSoloCompletados(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
            />
            <span>Solo pagos completados</span>
          </label>

          {/* Selector de registros por página */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 ml-auto">
            <span>Mostrar:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="py-1 px-2 text-xs border border-slate-200 rounded-md bg-white text-slate-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Manejo de Error */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between gap-3">
          <div>
            <p className="font-semibold">Ocurrió un error al cargar los tokens</p>
            <p className="text-xs text-rose-600 mt-0.5">{errorMsg}</p>
          </div>
          <button
            type="button"
            onClick={() => fetchTodosLosTokens()}
            className="px-3 py-1.5 text-xs font-medium bg-rose-600 hover:bg-rose-700 text-white rounded-md transition cursor-pointer"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Estado de Carga con Spinner */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
          <div className="relative">
            <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
          <p className="mt-3 text-sm font-medium text-slate-600">Cargando tokens de alumnos...</p>
          <p className="text-xs text-slate-400">Consultando vista_tokens_detalles en Supabase</p>
        </div>
      ) : (
        /* Estructura de la Tabla */
        <div className="w-full overflow-x-auto rounded-xl border border-slate-200 shadow-xs">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200">
                <th scope="col" className="px-5 py-3.5">Código Token</th>
                <th scope="col" className="px-5 py-3.5">Cliente / Alumno</th>
                <th scope="col" className="px-5 py-3.5">Matrícula</th>
                <th scope="col" className="px-5 py-3.5">Estado Canje</th>
                <th scope="col" className="px-5 py-3.5">Estado Pago</th>
                <th scope="col" className="px-5 py-3.5">Monto Abonado</th>
                <th scope="col" className="px-5 py-3.5 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {paginatedTokens.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <p className="font-semibold text-slate-600 text-sm">No se encontraron tokens</p>
                      <p className="text-xs text-slate-400">
                        {searchTerm || statusFilter !== 'todos' || soloCompletados
                          ? 'Intenta ajustar los filtros o el término de búsqueda.'
                          : 'No existen registros registrados en la vista.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedTokens.map((item, index) => {
                  const isCopied = copiedCode === item.token_code;

                  return (
                    <tr
                      key={`${item.token_code}-${index}`}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      {/* Código Token */}
                      <td className="px-5 py-3.5">
                        <span className="font-mono font-bold text-xs text-indigo-900 bg-indigo-50/70 border border-indigo-100 px-2 py-1 rounded select-all">
                          {item.token_code || '—'}
                        </span>
                      </td>

                      {/* Cliente / Alumno */}
                      <td className="px-5 py-3.5">
                        <div className="flex flex-col">
                          {item.nombre && item.nombre.trim() !== '' ? (
                            <span className="font-semibold text-slate-800 text-xs uppercase tracking-tight">
                              {item.nombre}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic text-xs">
                              Sin nombre asignado
                            </span>
                          )}
                          {item.email && item.email.trim() !== '' && (
                            <span className="text-[11px] text-slate-500 font-mono">
                              {item.email}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Matrícula */}
                      <td className="px-5 py-3.5 font-mono text-xs text-slate-600">
                        {item.matricula && item.matricula.trim() !== '' ? (
                          <span className="inline-block bg-slate-100 px-2 py-0.5 rounded font-medium text-slate-700">
                            {item.matricula}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">—</span>
                        )}
                      </td>

                      {/* Estado Canje */}
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold uppercase ring-1 ring-inset ${getStatusBadge(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                      </td>

                      {/* Estado Pago */}
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold uppercase ring-1 ring-inset ${getPaymentBadge(
                            item.estado_pago
                          )}`}
                        >
                          {item.estado_pago}
                        </span>
                      </td>

                      {/* Monto Abonado */}
                      <td className="px-5 py-3.5 font-semibold text-slate-900 text-xs">
                        ${item.total_abonado.toFixed(2)}
                      </td>

                      {/* Acción: Copiar Código */}
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleCopyCode(item.token_code)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                            isCopied
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
                          }`}
                          title="Copiar código del token al portapapeles"
                        >
                          {isCopied ? (
                            <>
                              <HiCheck className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Copiado</span>
                            </>
                          ) : (
                            <>
                              <HiClipboardCopy className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Copiar Código</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Controles de Navegación y Paginación */}
      {!isLoading && filteredTokens.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 text-xs text-slate-600 border-t border-slate-100">
          <div>
            Mostrando <span className="font-semibold text-slate-800">{startRecord}</span> -{' '}
            <span className="font-semibold text-slate-800">{endRecord}</span> de{' '}
            <span className="font-semibold text-slate-800">{filteredTokens.length}</span> registros
            {filteredTokens.length !== tokens.length && (
              <span className="text-slate-400 ml-1">
                (filtrados de un total de {tokens.length})
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <span className="mr-2 text-slate-500">
              Página <span className="font-semibold text-slate-700">{validCurrentPage}</span> de{' '}
              <span className="font-semibold text-slate-700">{totalPages}</span>
            </span>

            {/* Ir al inicio */}
            <button
              type="button"
              onClick={() => setCurrentPage(1)}
              disabled={validCurrentPage === 1}
              className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
              title="Primera página"
            >
              <HiChevronDoubleLeft className="w-4 h-4" />
            </button>

            {/* Anterior */}
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={validCurrentPage === 1}
              className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
              title="Página anterior"
            >
              <HiChevronLeft className="w-4 h-4" />
            </button>

            {/* Siguiente */}
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={validCurrentPage === totalPages}
              className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
              title="Página siguiente"
            >
              <HiChevronRight className="w-4 h-4" />
            </button>

            {/* Ir al final */}
            <button
              type="button"
              onClick={() => setCurrentPage(totalPages)}
              disabled={validCurrentPage === totalPages}
              className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
              title="Última página"
            >
              <HiChevronDoubleRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TokensGeneralTable;
