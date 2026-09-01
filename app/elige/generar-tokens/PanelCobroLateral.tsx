'use client'

import React from 'react'
import { QRCodeSVG } from 'qrcode.react'
import {
  HiClock,
  HiExclamationCircle,
  HiInformationCircle,
  HiOutlineCheckCircle,
  HiSearch,
  HiTrash,
  HiUser,
} from 'react-icons/hi'
import type { SeatIdentity } from '@/config/auditorioConfig'
import type {
  ApartadoInfoLocal,
  ExtendedZoneConfig,
  TicketSelectResponse,
} from './TaquillaTokensView'

interface PanelCobroLateralProps {
  // Estado del panel
  tokenGenerado: string | null
  modalMode: 'nuevo' | 'liquidar' | null
  selectedSeat: SeatIdentity | null
  selectedTicketId: string | null
  selectedZone: ExtendedZoneConfig | null
  infoApartado: ApartadoInfoLocal | null
  loadingApartado: boolean
  errorMsg: string | null
  isPending: boolean

  // Formulario de nuevo cobro
  nombreAlumno: string
  onNombreAlumnoChange: (value: string) => void
  emailAlumno: string
  onEmailAlumnoChange: (value: string) => void
  metodoRegistro: 'pago' | 'apartado'
  onMetodoRegistroChange: (value: 'pago' | 'apartado') => void
  montoApartado: number
  onMontoApartadoChange: (value: number) => void

  // Buscador de pre-registros
  busqueda: string
  onBusquedaChange: (value: string) => void
  usuariosPendientes: TicketSelectResponse[]
  usuarioSeleccionado: TicketSelectResponse | null
  onSeleccionarUsuario: (usuario: TicketSelectResponse) => void
  onDeseleccionarUsuario: () => void
  onBuscarPreRegistro: () => void

  // Acciones
  onConfirmarNuevoCobro: (event: React.FormEvent) => void
  onCancelarNuevoCobro: () => void
  tipoPagoLiquidacion: 'efectivo' | 'transferencia'
  onTipoPagoLiquidacionChange: (value: 'efectivo' | 'transferencia') => void
  onConfirmarLiquidacion: () => void
  onRegresarLiquidacion: () => void
  onCerrarToken: () => void
}

export function PanelCobroLateral({
  tokenGenerado,
  modalMode,
  selectedSeat,
  selectedTicketId,
  selectedZone,
  infoApartado,
  loadingApartado,
  errorMsg,
  isPending,
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
  onConfirmarNuevoCobro,
  onCancelarNuevoCobro,
  tipoPagoLiquidacion,
  onTipoPagoLiquidacionChange,
  onConfirmarLiquidacion,
  onRegresarLiquidacion,
  onCerrarToken,
}: PanelCobroLateralProps) {
  return (
    <div className="space-y-6">
      {tokenGenerado ? (
        /* PANTALLA DE ÉXITO */
        <div className="rounded-3xl border border-[#00a354]/30 bg-white dark:bg-[#2a2a2f] p-6 text-center shadow-md animate-fadeIn">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#00a354]/10 text-[#00a354]">
            <HiOutlineCheckCircle className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-sm font-black uppercase tracking-wider text-[#00a354]">
            {metodoRegistro === 'apartado' && modalMode === 'nuevo' ? '¡Apartado Registrado!' : '¡Pago Procesado Exitosamente!'}
          </h3>
          <p className="mt-1 text-xs text-[#4a4a4a]">Proporciona este código de acceso al alumno:</p>

          <div className="mx-auto my-5 inline-block rounded-xl border border-[#00a354]/20 bg-[#00a354]/5 px-6 py-4">
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#00a354] mb-1">Token de Inscripción</p>
            <p className="text-4xl font-black tracking-wider text-[#1a1a1a]">
              {tokenGenerado}
            </p>
          </div>

          <div className="mx-auto my-5 inline-block rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <QRCodeSVG
              value={tokenGenerado}
              size={160}
              bgColor="#ffffff"
              fgColor="#0f172a"
              level="H"
            />
          </div>

          <button
            type="button"
            onClick={onCerrarToken}
            className="mt-5 w-full rounded-xl bg-[#1a1a1a] py-3 text-xs font-bold text-white hover:bg-[#4a4a4a] transition"
          >
            Cerrar Ventana
          </button>
        </div>
      ) : modalMode === 'nuevo' && selectedSeat && selectedZone ? (
        /* REGISTRAR UN NUEVO ASIENTO */
        <div className="rounded-3xl border border-[#e5e5e5] bg-[#f5f5f5]/60 p-6 backdrop-blur-xl shadow-sm animate-fadeIn">
          <div className="mb-4 border-b border-[#e5e5e5] pb-3">
            <span className="inline-block rounded-full bg-[#00a354]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#00a354]">
              Selección Activa
            </span>
            <h3 className="mt-1 text-sm font-black uppercase text-[#1a1a1a]">
              Zona {selectedZone.name} — Bloque {selectedSeat.bloque} Fila {selectedSeat.fila} Num {selectedSeat.numero}
            </h3>
            <p className="text-[11px] text-[#4a4a4a] mt-0.5">Precio Neto: <span className="text-[#00a354] font-bold">${selectedZone.price} MXN</span></p>
          </div>

          {errorMsg && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2 text-[11px] text-red-600">
              <HiExclamationCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* BUSCADOR DE PRE-REGISTROS */}
          <div className="mb-4 bg-white dark:bg-[#2a2a2f] p-3 rounded-xl border border-[#e5e5e5] shadow-sm">
            <label className="block text-[10px] font-black uppercase tracking-widest text-[#00a354] mb-1.5">
              ¿Tiene Pre-Registro? Buscar Usuario
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={busqueda}
                onChange={(e) => onBusquedaChange(e.target.value)}
                placeholder="Buscar por Correo o Nombre..."
                className="flex-1 bg-[#f5f5f5] border border-[#e5e5e5] rounded-lg px-3 py-1.5 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#00a354]"
              />
              <button
                type="button"
                onClick={onBuscarPreRegistro}
                className="bg-[#1a1a1a] text-white px-3 py-1.5 rounded-lg font-bold text-xs hover:bg-[#4a4a4a] transition flex items-center gap-1"
              >
                <HiSearch className="w-3 h-3" /> Buscar
              </button>
            </div>

            {usuariosPendientes.length > 0 && (
              <div className="mt-2 max-h-32 overflow-y-auto border border-[#e5e5e5] bg-white dark:bg-[#2a2a2f] rounded-lg divide-y divide-[#e5e5e5] text-[11px]">
                {usuariosPendientes.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => onSeleccionarUsuario(u)}
                    className="w-full text-left px-2.5 py-2 hover:bg-[#f5f5f5] transition flex justify-between items-center"
                  >
                    <div className="truncate pr-2">
                      <span className="font-bold text-[#1a1a1a] block truncate">{u.nombre}</span>
                      <span className="text-[#4a4a4a] font-mono text-[10px] block truncate">{u.email}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {usuarioSeleccionado && (
              <div className="mt-2 bg-[#00a354]/10 border border-[#00a354]/20 rounded-lg p-2 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 text-[#00a354] truncate">
                  <HiUser className="w-4 h-4 shrink-0" />
                  <p className="truncate">
                    Vinculado: <span className="font-bold text-[#1a1a1a]">{usuarioSeleccionado.nombre}</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onDeseleccionarUsuario}
                  className="text-red-600 hover:text-red-500 p-1"
                >
                  <HiTrash className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* FORMULARIO DE COBRO */}
          <form onSubmit={onConfirmarNuevoCobro} className="space-y-4 text-xs">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#4a4a4a] mb-1">Nombre del Asistente</label>
              <input
                type="text"
                required
                value={nombreAlumno}
                onChange={(e) => onNombreAlumnoChange(e.target.value)}
                className="w-full bg-white dark:bg-[#2a2a2f] border border-[#e5e5e5] rounded-xl px-4 py-2 text-[#1a1a1a] focus:outline-none focus:border-[#00a354]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#4a4a4a] mb-1">Correo Electrónico</label>
              <input
                type="email"
                required
                value={emailAlumno}
                onChange={(e) => onEmailAlumnoChange(e.target.value)}
                className="w-full bg-white dark:bg-[#2a2a2f] border border-[#e5e5e5] rounded-xl px-4 py-2 text-[#1a1a1a] focus:outline-none focus:border-[#00a354]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#4a4a4a] mb-1.5">Esquema de Adquisición</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onMetodoRegistroChange('pago')}
                  className={`p-2.5 rounded-xl font-bold border transition text-center ${metodoRegistro === 'pago' ? 'bg-[#00a354]/10 border-[#00a354] text-[#00a354]' : 'bg-white dark:bg-[#2a2a2f] border-[#e5e5e5] text-[#4a4a4a]'}`}
                >
                  Pago Total
                </button>
                <button
                  type="button"
                  onClick={() => onMetodoRegistroChange('apartado')}
                  className={`p-2.5 rounded-xl font-bold border transition text-center ${metodoRegistro === 'apartado' ? 'bg-amber-500/10 border-amber-500 text-amber-600' : 'bg-white dark:bg-[#2a2a2f] border-[#e5e5e5] text-[#4a4a4a]'}`}
                >
                  Dejar Apartado
                </button>
              </div>
            </div>

            {metodoRegistro === 'apartado' && (
              <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-3 space-y-2 animate-fadeIn">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-amber-600">Monto del Anticipo (MXN)</label>
                <input
                  type="number"
                  min={200}
                  max={(selectedZone.price ?? 650) - 50}
                  value={montoApartado}
                  onChange={(e) => onMontoApartadoChange(Number(e.target.value))}
                  className="w-full bg-white dark:bg-[#2a2a2f] border border-amber-300 rounded-lg px-3 py-1.5 text-[#1a1a1a] focus:outline-none"
                />
                <p className="text-[10px] text-[#4a4a4a]">Monto Restante: <span className="text-[#1a1a1a] font-bold">${(selectedZone.price ?? 650) - montoApartado} MXN</span></p>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onCancelarNuevoCobro}
                className="w-1/3 bg-[#f5f5f5] border border-[#e5e5e5] text-[#1a1a1a] rounded-xl font-bold py-3 hover:bg-[#e5e5e5] transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 bg-gradient-to-r from-[#00a354] to-[#00a34d] text-white font-black uppercase tracking-wider rounded-xl py-3 hover:opacity-90 disabled:opacity-50 transition"
              >
                {isPending ? 'Procesando...' : metodoRegistro === 'apartado' ? 'Registrar Apartado' : 'Completar Inscripción'}
              </button>
            </div>
          </form>
        </div>
      ) : modalMode === 'liquidar' && selectedSeat && selectedTicketId && infoApartado ? (
        /* LIQUIDACIÓN DE UN APARTADO EXISTENTE */
        <div className="rounded-3xl border border-amber-500/30 bg-[#f5f5f5]/60 p-6 backdrop-blur-xl shadow-sm animate-fadeIn">
          <div className="mb-4 border-b border-amber-500/20 pb-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-600">
              <HiClock className="w-3 h-3" /> Asiento Apartado
            </span>
            <h3 className="mt-1 text-sm font-black uppercase text-[#1a1a1a]">
              Bloque {selectedSeat.bloque} — Fila {selectedSeat.fila} Num {selectedSeat.numero}
            </h3>
          </div>

          <div className="bg-white dark:bg-[#2a2a2f] rounded-xl p-4 border border-[#e5e5e5] space-y-2.5 text-xs mb-4 shadow-sm">
            <div>
              <p className="text-[10px] text-[#4a4a4a] uppercase tracking-widest font-bold">Asistente</p>
              <p className="text-[#1a1a1a] font-bold text-sm">{infoApartado.nombre || '—'}</p>
              <p className="text-[#4a4a4a] font-mono text-[11px]">{infoApartado.email || '—'}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 border-t border-[#e5e5e5] pt-2 text-center">
              <div className="bg-[#f5f5f5] p-2 rounded-lg border border-[#e5e5e5]">
                <p className="text-[9px] text-[#4a4a4a] uppercase font-bold">Abonado</p>
                <p className="text-[#00a354] font-black text-sm">${infoApartado.totalAbonado} MXN</p>
              </div>
              <div className="bg-amber-500/5 p-2 rounded-lg border border-amber-500/20">
                <p className="text-[9px] text-amber-600 uppercase font-bold">Saldo Restante</p>
                <p className="text-[#1a1a1a] font-black text-sm">${infoApartado.montoRestante} MXN</p>
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 text-[11px] text-red-600 flex items-start gap-2">
              <HiExclamationCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#4a4a4a] mb-1.5">Método para Liquidar Saldo</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onTipoPagoLiquidacionChange('efectivo')}
                  className={`p-2 text-xs font-bold border transition text-center rounded-xl ${tipoPagoLiquidacion === 'efectivo' ? 'bg-[#00a354]/10 border-[#00a354] text-[#00a354]' : 'bg-white dark:bg-[#2a2a2f] border-[#e5e5e5] text-[#4a4a4a]'}`}
                >
                  Efectivo
                </button>
                <button
                  type="button"
                  onClick={() => onTipoPagoLiquidacionChange('transferencia')}
                  className={`p-2 text-xs font-bold border transition text-center rounded-xl ${tipoPagoLiquidacion === 'transferencia' ? 'bg-purple-50 border-purple-200 text-purple-600' : 'bg-white dark:bg-[#2a2a2f] border-[#e5e5e5] text-[#4a4a4a]'}`}
                >
                  Transferencia
                </button>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={onRegresarLiquidacion}
                className="w-1/3 bg-[#f5f5f5] border border-[#e5e5e5] text-[#1a1a1a] rounded-xl font-bold py-3 text-xs hover:bg-[#e5e5e5] transition"
              >
                Regresar
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={onConfirmarLiquidacion}
                className="flex-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-black uppercase tracking-wider text-xs rounded-xl py-3 hover:opacity-90 transition shadow-md"
              >
                {isPending ? 'Liquidando...' : `Liquidar $${infoApartado.montoRestante} MXN`}
              </button>
            </div>
          </div>
        </div>
      ) : loadingApartado ? (
        /* LOADING APARTADO */
        <div className="rounded-3xl border border-[#e5e5e5] bg-[#f5f5f5]/40 p-8 text-center backdrop-blur-xl">
          <div className="w-8 h-8 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin mx-auto mb-3" />
          <p className="text-xs text-[#4a4a4a] font-mono">Consultando historial de abonos y pre-registros...</p>
        </div>
      ) : (
        /* PANEL VACÍO */
        <div className="rounded-3xl border border-dashed border-[#e5e5e5] bg-[#f5f5f5]/10 p-8 text-center shadow-inner">
          {errorMsg && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 text-[11px] text-red-600 flex items-start gap-2 text-left">
              <HiExclamationCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}
          <HiInformationCircle className="mx-auto h-8 w-8 text-[#4a4a4a]/40 mb-2" />
          <p className="text-xs font-bold uppercase tracking-wider text-[#4a4a4a]">Monitoreo de Asientos</p>
          <p className="mt-1 text-[11px] text-[#4a4a4a]/70">Selecciona cualquier asiento en el mapa del teatro para desplegar los controles de taquilla física, buscador de pre-registros y cobro.</p>
        </div>
      )}
    </div>
  )
}