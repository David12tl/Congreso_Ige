'use client'

import React, { useState, useTransition, useRef } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import {
  HiOutlineKey,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineQrcode,
  HiOutlineDownload,
  HiOutlineArrowRight,
} from 'react-icons/hi'
import { canjearTokenPorCodigo, type DatosTicketCanjeado } from './actions'

function GlassCard({ children, className, glowColor }: {
  children: React.ReactNode
  className?: string
  glowColor?: 'emerald' | 'cyan' | 'purple'
}) {
  const glowMap: Record<string, string> = {
    emerald: 'border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.15)]',
    cyan: 'border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)]',
    purple: 'border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.15)]',
  }
  const glow = glowMap[glowColor ?? 'cyan'] || glowMap.cyan

  return (
    <div className={`relative z-10 w-full border bg-slate-900/40 backdrop-blur-xl rounded-2xl p-6 md:p-8 transition-all duration-300 ${glow} ${className}`}>
      {children}
    </div>
  )
}

export default function IngresarTokenPage() {
  const [isPending, startTransition] = useTransition()
  const [tokenInput, setTokenInput] = useState('')
  const [statusMessage, setStatusMessage] = useState<{ success: boolean; text: string } | null>(null)
  const [ticket, setTicket] = useState<DatosTicketCanjeado | null>(null)
  const qrRef = useRef<HTMLDivElement>(null)

  const handleCanjear = (e: React.FormEvent) => {
    e.preventDefault()

    const code = tokenInput.trim().toUpperCase()
    if (!code) {
      setStatusMessage({ success: false, text: 'Por favor, escribe el código del token.' })
      return
    }
    if (code.length < 6) {
      setStatusMessage({ success: false, text: 'El token debe tener al menos 6 caracteres.' })
      return
    }

    setStatusMessage(null)
    setTicket(null)

    startTransition(async () => {
      const resultado = await canjearTokenPorCodigo(code)

      if (resultado.success) {
        setStatusMessage({ success: true, text: resultado.message })
        if (resultado.ticket) {
          setTicket(resultado.ticket)
        }
        setTokenInput('')
      } else {
        setStatusMessage({ success: false, text: resultado.message })
      }
    })
  }

  const handleDownloadPDF = () => {
    if (!ticket || !qrRef.current) return

    // Obtener el canvas del QR
    const canvas = qrRef.current.querySelector('canvas')
    if (!canvas) return

    const qrDataUrl = canvas.toDataURL('image/png')

    // Construir un HTML simple para el PDF
    const asientoStr = [
      ticket.asientoZona,
      ticket.asientoBloque,
      ticket.asientoFila ? `Fila ${ticket.asientoFila}` : null,
      ticket.asientoNumero ? `Asiento ${ticket.asientoNumero}` : null,
    ].filter(Boolean).join(' / ')

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Pase - Congreso IGE</title>
        <style>
          @page { margin: 0; size: 396x612px; }
          body {
            margin: 0;
            padding: 24px;
            font-family: 'Segoe UI', Arial, sans-serif;
            background: #0f172a;
            color: #e2e8f0;
            width: 396px;
            height: 612px;
            box-sizing: border-box;
          }
          .ticket {
            border: 2px solid #06b6d4;
            border-radius: 16px;
            padding: 20px;
            background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
            height: 100%;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
          h1 { font-size: 18px; font-weight: 900; text-transform: uppercase; color: #06b6d4; letter-spacing: 2px; margin: 0 0 4px; }
          .evento { font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 12px; }
          .qr-container { background: white; padding: 8px; border-radius: 12px; margin-bottom: 12px; }
          .qr-container img { display: block; width: 140px; height: 140px; }
          .nombre { font-size: 16px; font-weight: 700; color: #f1f5f9; margin-bottom: 4px; }
          .email { font-size: 10px; color: #94a3b8; margin-bottom: 8px; }
          .info-grid { width: 100%; display: flex; flex-direction: column; gap: 4px; margin-bottom: 8px; }
          .info-row { display: flex; justify-content: space-between; font-size: 9px; padding: 3px 8px; background: #1e293b; border-radius: 6px; }
          .label { color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
          .value { color: #e2e8f0; font-weight: 600; }
          .asiento { background: #06b6d4; border-radius: 8px; padding: 8px; color: #0f172a; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; width: 100%; margin-bottom: 8px; }
          .footer { font-size: 7px; color: #475569; text-transform: uppercase; letter-spacing: 2px; margin-top: auto; }
        </style>
      </head>
      <body>
        <div class="ticket">
          <h1>Congreso IGE</h1>
          <p class="evento">Pase de Acceso</p>
          <div class="qr-container">
            <img src="${qrDataUrl}" alt="QR" />
          </div>
          <p class="nombre">${ticket.nombre || 'Sin nombre'}</p>
          <p class="email">${ticket.email}</p>
          <div class="asiento">${asientoStr || 'Sin asiento'}</div>
          <div class="info-grid">
            ${ticket.matricula ? `<div class="info-row"><span class="label">Matrícula</span><span class="value">${ticket.matricula}</span></div>` : ''}
            ${ticket.carrera ? `<div class="info-row"><span class="label">Carrera</span><span class="value">${ticket.carrera}</span></div>` : ''}
            ${ticket.semestre ? `<div class="info-row"><span class="label">Semestre</span><span class="value">${ticket.semestre}°</span></div>` : ''}
            ${ticket.unidadAcademica ? `<div class="info-row"><span class="label">Unidad</span><span class="value">${ticket.unidadAcademica}</span></div>` : ''}
            ${ticket.tipo ? `<div class="info-row"><span class="label">Tipo</span><span class="value">${ticket.tipo === 'alumno' ? 'Alumno' : 'Empresa/Externo'}</span></div>` : ''}
          </div>
          <p class="footer">Instituto Tecnológico de Nogales</p>
        </div>
      </body>
      </html>
    `

    // Usar Blob + URL.createObjectURL para descargar como HTML renderizable
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = window.document.createElement('a')
    a.href = url
    a.download = `pase-congreso-ige-${ticket.ticketId.slice(0, 8)}.html`
    window.document.body.appendChild(a)
    a.click()
    window.document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // ─── Estado de Éxito con QR y PDF ─────────────────────────────────
  if (ticket && statusMessage?.success) {
    const qrData = JSON.stringify({
      ticketId: ticket.ticketId,
      nombre: ticket.nombre,
      email: ticket.email,
      matricula: ticket.matricula,
      unidadAcademica: ticket.unidadAcademica,
      asiento: `${ticket.asientoZona || ''}/${ticket.asientoBloque || ''}/${ticket.asientoFila || ''}/${ticket.asientoNumero || ''}`,
    })

    const asientoStr = [
      ticket.asientoZona,
      ticket.asientoBloque,
      ticket.asientoFila ? `Fila ${ticket.asientoFila}` : null,
      ticket.asientoNumero ? `Asiento ${ticket.asientoNumero}` : null,
    ].filter(Boolean).join(' / ')

    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-4 relative overflow-hidden animate-fadeIn text-white w-full max-w-7xl mx-auto space-y-8">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

        <GlassCard className="max-w-lg mx-auto text-center" glowColor="emerald">
          {/* Check icon */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10">
            <HiOutlineCheckCircle className="h-12 w-12 text-emerald-400" />
          </div>

          <h2 className="text-2xl font-black uppercase tracking-tight text-white">
            ¡Pase activado!
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            {statusMessage.text}
          </p>

          {/* QR Code */}
          <div className="mx-auto mt-6" ref={qrRef}>
            <div className="inline-block rounded-xl border border-white/10 bg-white p-3 shadow-lg">
              <QRCodeCanvas
                value={qrData}
                size={180}
                bgColor="#ffffff"
                fgColor="#0f172a"
                level="H"
              />
            </div>
          </div>

          {/* Datos del ticket */}
          <div className="mx-auto mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-5 text-left space-y-2">
            <p className="text-center text-lg font-bold text-cyan-300 uppercase tracking-wider">{asientoStr || 'Asiento asignado'}</p>
            <div className="border-t border-white/5 my-2" />
            <div className="space-y-1.5 text-sm">
              {ticket.nombre && (
                <div className="flex justify-between">
                  <span className="text-gray-500 text-xs uppercase tracking-wider">Nombre</span>
                  <span className="text-white font-medium">{ticket.nombre}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500 text-xs uppercase tracking-wider">Correo</span>
                <span className="text-cyan-300 font-mono text-xs">{ticket.email}</span>
              </div>
              {ticket.matricula && (
                <div className="flex justify-between">
                  <span className="text-gray-500 text-xs uppercase tracking-wider">Matrícula</span>
                  <span className="text-white font-mono">{ticket.matricula}</span>
                </div>
              )}
              {ticket.unidadAcademica && (
                <div className="flex justify-between">
                  <span className="text-gray-500 text-xs uppercase tracking-wider">Unidad</span>
                  <span className="text-white">{ticket.unidadAcademica}</span>
                </div>
              )}
              {ticket.carrera && (
                <div className="flex justify-between">
                  <span className="text-gray-500 text-xs uppercase tracking-wider">Carrera</span>
                  <span className="text-white">{ticket.carrera}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500 text-xs uppercase tracking-wider">Tipo</span>
                <span className="text-white">{ticket.tipo === 'alumno' ? 'Alumno' : 'Externo / Empresa'}</span>
              </div>
            </div>
          </div>

          {/* Botón de descarga PDF */}
          <button
            type="button"
            onClick={handleDownloadPDF}
            className="mt-6 w-full flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4 text-sm font-black uppercase tracking-widest text-white transition hover:from-emerald-500 hover:to-emerald-600 shadow-lg"
          >
            <HiOutlineDownload className="h-5 w-5" />
            Descargar Pase (PDF)
          </button>

          {/* Botón para canjear otro token */}
          <button
            type="button"
            onClick={() => { setTicket(null); setStatusMessage(null); setTokenInput('') }}
            className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 px-6 py-3 text-sm font-bold text-slate-300 transition hover:bg-white/5"
          >
            <HiOutlineArrowRight className="h-4 w-4" />
            Canjear otro token
          </button>
        </GlassCard>
      </div>
    )
  }

  // ─── Formulario de ingreso de token ────────────────────────────────
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center p-4 relative overflow-hidden animate-fadeIn text-white w-full max-w-7xl mx-auto space-y-8">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

      <header className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4 relative z-10">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase flex items-center">
            <HiOutlineKey className="w-8 h-8 mr-3 text-cyan-400 shrink-0" />
            Ingresar{' '}
            <span className="ml-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Token
            </span>
          </h1>
          <p className="text-gray-400 text-xs font-mono uppercase tracking-widest">
            GATEWAY // CANJEAR_PASE_DE_ACCESO
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full self-start md:self-auto">
          <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
          <span className="text-cyan-400 text-xs font-bold uppercase tracking-widest">Módulo de Validación</span>
        </div>
      </header>

      <div className="w-full max-w-2xl mx-auto relative z-10">
        <GlassCard className="p-8" glowColor={statusMessage?.success ? 'emerald' : 'cyan'}>
          <form onSubmit={handleCanjear} className="space-y-6">
            <div className="flex flex-col items-center text-center mb-4">
              <div className={`w-20 h-20 rounded-2xl border flex items-center justify-center mb-6 transition-all duration-300 ${
                statusMessage?.success
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
              }`}>
                <HiOutlineKey className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Ingresa tu Token</h2>
              <p className="text-gray-400 text-sm max-w-md">
                Escribe el código de 8 dígitos que el encargado de tu Unidad
                Académica te proporcionó para activar tu pase.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-cyan-500 uppercase tracking-widest mb-2">
                  Código de Token
                </label>
                <input
                  type="text"
                  placeholder="Ej: 2ZYSPNQG"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  disabled={isPending}
                  maxLength={10}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-5 py-4 text-white font-mono text-2xl font-bold tracking-[0.2em] text-center focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-gray-600 uppercase"
                  autoFocus
                />
                <p className="mt-1 text-[10px] text-gray-600 font-mono text-center">
                  El código es proporcionado por el encargado de tu unidad académica
                </p>
              </div>

              {statusMessage && (
                <div className={`p-4 rounded-xl flex items-center gap-3 text-sm transition-all ${
                  statusMessage.success
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                    : 'bg-red-500/10 border border-red-500/20 text-red-400'
                }`}>
                  {statusMessage.success ? (
                    <HiOutlineCheckCircle className="w-5 h-5 shrink-0" />
                  ) : (
                    <HiOutlineExclamationCircle className="w-5 h-5 shrink-0" />
                  )}
                  <span>{statusMessage.text}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isPending || !tokenInput.trim()}
                className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-gray-500 text-white font-bold rounded-xl uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg"
              >
                <HiOutlineQrcode className="w-5 h-5" />
                {isPending ? 'Verificando en base de datos...' : 'Canjear Token'}
              </button>
            </div>
          </form>
        </GlassCard>
      </div>
    </div>
  )
}