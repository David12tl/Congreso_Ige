'use client'

import React from 'react'
import SeatMap from '@/components/asientos/zonaExternos'
import Zona1 from '@/components/asientos/zona_1'
import Zona2 from '@/components/asientos/zona_2'
import Zona3 from '@/components/asientos/zona_3'
import Zona4 from '@/components/asientos/zona_4'
import ZonaGrid from '@/components/asientos/ZonaGrid'
import { ApartadosPendientesPanel } from './ApartadosPendientesPanel'
import { PanelCobroLateral } from './PanelCobroLateral'
import { useTaquillaStore, ZONA_TABS } from './hooks/useTaquillaStore'
import { ZONE_UUIDS } from '@/config/auditorioConfig'
import type { TaquillaTokensViewProps } from './types'

// Re-exportar tipos para compatibilidad con componentes hijos
export type {
  ApartadoInfoLocal,
  TicketSelectResponse,
  ApartadoPendienteRow,
  ExtendedZoneConfig,
} from './types'

// ─── Componente principal ─────────────────────────────────────────────

export function TaquillaTokensView({
  assignmentContext,
  initialOccupiedSeatKeys,
  initialSeatStatusMap,
  initialStats,
}: TaquillaTokensViewProps) {
  const {
    zonaActiva,
    onZonaActivaChange,
    asientoSeleccionado,
    zonaActivaRow,
    zonaActivaOcupados,
    zonaActivaStatuses,
    selectedZone,
    apartadosFiltrados,
    totalPendientes,
    totalAdeudo,
    filtroNombre,
    onFiltroNombreChange,
    loadingApartados,
    errorApartados,
    isPending,
    errorMsg,
    tokenGenerado,
    modalMode,
    selectedSeat,
    selectedTicketId,
    infoApartado,
    loadingApartado,
    nombreAlumno,
    onNombreAlumnoChange,
    emailAlumno,
    onEmailAlumnoChange,
    metodoRegistro,
    onMetodoRegistroChange,
    montoApartado,
    onMontoApartadoChange,
    busqueda,
    onBusquedaChange,
    usuariosPendientes,
    usuarioSeleccionado,
    onSeleccionarUsuario,
    onDeseleccionarUsuario,
    onBuscarPreRegistro,
    onSeleccionarAsiento,
    onSeleccionarAsientoCuadro,
    onLiquidarDesdeTabla,
    onConfirmarNuevoCobro,
    onConfirmarLiquidacion,
    onCancelarNuevoCobro,
    onRegresarLiquidacion,
    onCerrarToken,
    tipoPagoLiquidacion,
    onTipoPagoLiquidacionChange,
    onRecargarApartados,
  } = useTaquillaStore({ assignmentContext, initialOccupiedSeatKeys, initialSeatStatusMap, initialStats })

  return (
    <div className="grid grid-cols-1 gap-8 xl:grid-cols-3 min-h-screen bg-white dark:bg-[#2a2a2f] text-[#1a1a1a] p-4">
      {/* Columna Izquierda: Mapa del Auditorio */}
      <div className="rounded-3xl border border-[#e5e5e5] bg-[#f5f5f5]/60 p-6 backdrop-blur-xl xl:col-span-2 shadow-sm">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black uppercase tracking-wider text-[#00a354]">
              Taquilla Física y Control de Asientos
            </h2>
            <p className="text-xs text-[#4a4a4a]">
              Haz clic en un asiento disponible para registrar una venta, apartado o cargar un pre-registro.
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className="inline-block rounded-md bg-white dark:bg-[#2a2a2f] border border-[#e5e5e5] px-3 py-1.5 text-xs text-[#4a4a4a] font-medium shadow-sm">
                Rol: <strong className="text-[#1a1a1a]">{assignmentContext.role}</strong> {assignmentContext.unidadAcademicaNombre && `(${assignmentContext.unidadAcademicaNombre})`}
              </span>

              <div className="flex flex-wrap items-center gap-2">
                {ZONA_TABS.map((tab: string) => {
                  const isActive = zonaActiva === tab
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => onZonaActivaChange(tab)}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all duration-150 ${
                        isActive
                          ? 'bg-[#00a354] border-[#00a354] text-white shadow-md'
                          : 'bg-white dark:bg-[#2a2a2f] border-[#e5e5e5] text-[#4a4a4a] hover:border-[#00a354] hover:text-[#00a354]'
                      }`}
                    >
                      {tab === 'EXTERNOS' ? 'Externos' : `Zona ${tab.replace('ZONA_', '')}`}
                    </button>
                  )
                })}
              </div>
            </div>

            {asientoSeleccionado && (
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-lg">
                <span>Asiento asignado:</span>
                <span className="font-mono text-sm bg-emerald-200/60 px-2 py-0.5 rounded text-emerald-950">
                  {asientoSeleccionado}
                </span>
              </div>
            )}
          </div>
        </div>

        <div
          id="taquilla-zona-interaccion"
          className="rounded-2xl bg-white dark:bg-[#2a2a2f] p-4 border border-[#e5e5e5] shadow-inner"
        >
          {zonaActiva === 'EXTERNOS' ? (
            <SeatMap
              occupiedSeats={zonaActivaOcupados}
              onSeatSelect={onSeleccionarAsiento}
            />
          ) : zonaActiva === 'TEQUI,CUI,TESO' ? (
            <Zona1
              occupiedSeats={zonaActivaOcupados}
              onSeatSelect={(seatId, info) =>
                onSeleccionarAsientoCuadro('ZONA_1', zonaActivaRow?.id ?? ZONE_UUIDS.zona1, seatId, info)
              }
            />
          ) : zonaActiva === 'ZONGOLICA' ? (
            <Zona2
              occupiedSeats={zonaActivaOcupados}
              onSeatSelect={(seatId, info) =>
                onSeleccionarAsientoCuadro('ZONA_2', zonaActivaRow?.id ?? ZONE_UUIDS.zona2, seatId, info)
              }
            />
          ) : zonaActiva === 'NOGALES' ? (
            <Zona3
              occupiedSeats={zonaActivaOcupados}
              onSeatSelect={(seatId, info) =>
                onSeleccionarAsientoCuadro('ZONA_3', zonaActivaRow?.id ?? ZONE_UUIDS.zona3, seatId, info)
              }
            />
          ) : zonaActiva === 'NOGALES' ? (
            <Zona4
              occupiedSeats={zonaActivaOcupados}
              onSeatSelect={(seatId, info) =>
                onSeleccionarAsientoCuadro('ZONA_4', zonaActivaRow?.id ?? ZONE_UUIDS.zona4, seatId, info)
              }
            />
          ) : zonaActivaRow ? (
            <ZonaGrid
              zoneCode={zonaActiva}
              zoneName={zonaActivaRow.name}
              capacity={zonaActivaRow.capacity}
              occupiedSeats={zonaActivaOcupados}
              seatStatuses={zonaActivaStatuses}
              onSeatSelect={(seatId, info) =>
                onSeleccionarAsientoCuadro(zonaActiva, zonaActivaRow.id, seatId, info)
              }
            />
          ) : (
            <div className="py-12 text-center text-sm text-[#4a4a4a]">
              No se encontró la zona <strong>{zonaActiva}</strong> en la tabla{' '}
              <code>zones</code> de Supabase. Verifica su nombre y capacidad.
            </div>
          )}
        </div>

        <ApartadosPendientesPanel
          apartadosFiltrados={apartadosFiltrados}
          totalPendientes={totalPendientes}
          totalAdeudo={totalAdeudo}
          filtroNombre={filtroNombre}
          onFiltroNombreChange={onFiltroNombreChange}
          loadingApartados={loadingApartados}
          errorApartados={errorApartados}
          isPending={isPending}
          onRecargar={() => void onRecargarApartados()}
          onLiquidar={(row) => void onLiquidarDesdeTabla(row)}
        />

      {/* Columna Derecha: Panel de Control Dinámico */}
      <PanelCobroLateral
        tokenGenerado={tokenGenerado}
        modalMode={modalMode}
        selectedSeat={selectedSeat}
        selectedTicketId={selectedTicketId}
        selectedZone={selectedZone}
        infoApartado={infoApartado}
        loadingApartado={loadingApartado}
        errorMsg={errorMsg}
        isPending={isPending}
        nombreAlumno={nombreAlumno}
        onNombreAlumnoChange={onNombreAlumnoChange}
        emailAlumno={emailAlumno}
        onEmailAlumnoChange={onEmailAlumnoChange}
        metodoRegistro={metodoRegistro}
        onMetodoRegistroChange={onMetodoRegistroChange}
        montoApartado={montoApartado}
        onMontoApartadoChange={onMontoApartadoChange}
        busqueda={busqueda}
        onBusquedaChange={onBusquedaChange}
        usuariosPendientes={usuariosPendientes}
        usuarioSeleccionado={usuarioSeleccionado}
        onSeleccionarUsuario={onSeleccionarUsuario}
        onDeseleccionarUsuario={onDeseleccionarUsuario}
        onBuscarPreRegistro={() => void onBuscarPreRegistro()}
        onConfirmarNuevoCobro={onConfirmarNuevoCobro}
        onCancelarNuevoCobro={onCancelarNuevoCobro}
        tipoPagoLiquidacion={tipoPagoLiquidacion}
        onTipoPagoLiquidacionChange={onTipoPagoLiquidacionChange}
        onConfirmarLiquidacion={onConfirmarLiquidacion}
        onRegresarLiquidacion={onRegresarLiquidacion}
        onCerrarToken={onCerrarToken}
      />
      </div>
    </div>
  )
}
