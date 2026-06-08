'use client'

import React, { useState, useEffect, useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { HiOutlineQrcode, HiOutlineExclamationCircle, HiOutlineDownload, HiOutlineArrowRight } from 'react-icons/hi'
import { obtenerQRData, type DatosTicketParaQR } from './actions'

function GlassCard({ children, className = '', glowColor = 'purple' }: {
  children: React.ReactNode
  className?: string
  glowColor?: 'blue' | 'purple' | 'amber' | 'cyan' | 'emerald'
}) {
  const glowStyles: Record<string, string> = {
    blue: 'border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.15)]',
    purple: 'border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.15)]',
    amber: 'border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.15)]',
    cyan: 'border-cyan-500/30 shadow-[0_0_20px_rgba(34,211,238,0.15)]',
    emerald: 'border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.15)]',
  }

  return (
    <div className={`relative rounded-2xl border bg-slate-900/40 backdrop-blur-xl overflow-hidden transition-all duration-300 ${glowStyles[glowColor]} ${className}`}>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      {children}
    </div>
  )
}

export default function GenerarQRPage() {
  const [loading, setLoading] = useState(true)
  const [ticket, setTicket] = useState<DatosTicketParaQR | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [hasToken, setHasToken] = useState<boolean | null>(null)
  const qrRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function cargarQR() {
      setLoading(true)
      const resultado = await obtenerQRData()

      if (resultado.success && resultado.ticket) {
        setTicket(resultado.ticket)
        setHasToken(true)
        setErrorMessage(null)
      } else {
        setHasToken(false)
        setErrorMessage(resultado.message)
        setTicket(null)
      }

      setLoading(false)
    }

    cargarQR()
  }, [])

  const handleDownloadPDF = () => {
    if (!ticket || !qrRef.current) return

    const canvas = qrRef.current.querySelector('canvas')
    if (!canvas) return

    const qrDataUrl = canvas.toDataURL('image/png')

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
            border: 2px solid #a855f7;
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
          h1 { font-size: 18px; font-weight: 900; text-transform: uppercase; color: #a855f7; letter-spacing: 2px; margin: 0 0 4px; }
          .evento { font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 12px; }
          .qr-container { background: white; padding: 8px; border-radius: 12px; margin-bottom: 12px; }
          .qr-container img { display: block; width: 140px; height: 140px; }
          .nombre { font-size: 16px; font-weight: 700; color: #f1f5f9; margin-bottom: 4px; }
          .email { font-size: 10px; color: #94a3b8; margin-bottom: 8px; }
          .info-grid { width: 100%; display: flex; flex-direction: column; gap: 4px; margin-bottom: 8px; }
          .info-row { display: flex; justify-content: space-between; font-size: 9px; padding: 3px 8px; background: #1e293b; border-radius: 6px; }
          .label { color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
          .value { color: #e2e8f0; font-weight: 600; }
          .asiento { background: #a855f7; border-radius: 8px; padding: 8px; color: #0f172a; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; width: 100%; margin-bottom: 8px; }
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
            ${ticket.matricula ? `<div class="info-row"><span class="label">Matr&iacute;cula</span><span class="value">${ticket.matricula}</span></div>` : ''}
            ${ticket.carrera ? `<div class="info-row"><span class="label">Carrera</span><span class="value">${ticket.carrera}</span></div>` : ''}
            ${ticket.semestre ? `<div class="info-row"><span class="label">Semestre</span><span class="value">${ticket.semestre}°</span></div>` : ''}
            ${ticket.unidadAcademica ? `<div class="info-row"><span class="label">Unidad</span><span class="value">${ticket.unidadAcademica}</span></div>` : ''}
            ${ticket.tipo ? `<div class="info-row"><span class="label">Tipo</span><span class="value">${ticket.tipo === 'alumno' ? 'Alumno' : 'Empresa/Externo'}</span></div>` : ''}
          </div>
          <p class="footer">Instituto Tecnol&oacute;gico de Nogales</p>
        </div>
      </body>
      </html>
    `

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

  // ─── Estado de carga ───────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-4 relative overflow-hidden animate-fadeIn text-white w-full max-w-7xl mx-auto">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />
        <GlassCard className="p-10 max-w-lg mx-auto text-center" glowColor="purple">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full border border-purple-500/30 bg-purple-500/10 flex items-center justify-center">
              <HiOutlineQrcode className="w-8 h-8 text-purple-400 animate-pulse" />
            </div>
            <p className="text-slate-400 text-sm">Verificando tu pase de acceso...</p>
            <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          </div>
        </GlassCard>
      </div>
    )
  }

  // ─── Estado: Token no canjeado / Bloqueado ─────────────────────
  if (hasToken === false) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-4 relative overflow-hidden animate-fadeIn text-white w-full max-w-7xl mx-auto space-y-8">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase">
              <HiOutlineQrcode className="inline-block w-8 h-8 mr-3 text-amber-400" />
              Acceso{' '}
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                Digital
              </span>
            </h1>
            <p className="text-gray-500 text-sm font-mono mt-1">USUARIO // ESTADO_DE_TICKET</p>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-full">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">Token pendiente</span>
          </div>
        </header>

        <div className="max-w-2xl mx-auto w-full">
          <GlassCard className="p-8" glowColor="amber">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                <HiOutlineExclamationCircle className="w-10 h-10 text-amber-400" />
              </div>

              <h2 className="text-2xl font-bold text-white mb-3">Pase no activado</h2>
              <p className="text-gray-400 text-sm max-w-md mb-6 leading-relaxed">
                {errorMessage}
              </p>

              <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl max-w-sm w-full">
                <p className="text-amber-400 text-xs font-mono leading-relaxed">
                  Si ya ingresaste tu token y este mensaje persiste, contacta al encargado de tu unidad acad&eacute;mica para verificar el estado de tu registro.
                </p>
              </div>

              <a
                href="/dashboard/ingresar-token"
                className="mt-6 w-full flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-4 text-sm font-black uppercase tracking-widest text-white transition hover:from-amber-500 hover:to-orange-500 shadow-lg"
              >
                <HiOutlineArrowRight className="h-5 w-5" />
                Ir a Ingresar Token
              </a>
            </div>
          </GlassCard>
        </div>
      </div>
    )
  }

  // ─── Estado: Error inesperado (conexión, etc.) ────────────────
  if (!ticket) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-4 relative overflow-hidden animate-fadeIn text-white w-full max-w-7xl mx-auto">
        <GlassCard className="p-10 max-w-lg mx-auto text-center" glowColor="amber">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full border border-red-500/30 bg-red-500/10 flex items-center justify-center">
              <HiOutlineExclamationCircle className="w-8 h-8 text-red-400" />
            </div>
            <p className="text-red-400 font-bold">Error inesperado</p>
            <p className="text-slate-400 text-sm">{errorMessage}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold uppercase tracking-widest text-sm hover:from-purple-500 hover:to-pink-500 transition-all"
            >
              Reintentar
            </button>
          </div>
        </GlassCard>
      </div>
    )
  }

  // ─── Estado: Ticket listo con QR ──────────────────────────────
  const asientoStr = [
    ticket.asientoZona,
    ticket.asientoBloque,
    ticket.asientoFila ? `Fila ${ticket.asientoFila}` : null,
    ticket.asientoNumero ? `Asiento ${ticket.asientoNumero}` : null,
  ].filter(Boolean).join(' / ')

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto p-4 md:p-0">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase">
            <HiOutlineQrcode className="inline-block w-8 h-8 mr-3 text-purple-400" />
            Acceso{' '}
            <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              Digital
            </span>
          </h1>
          <p className="text-gray-500 text-sm font-mono mt-1">USUARIO // ESTADO_DE_TICKET</p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">Ticket activo</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto">
        <GlassCard className="p-8" glowColor="purple">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="relative mb-6">
              <div className="absolute -inset-4 bg-purple-500/20 rounded-3xl blur-xl animate-pulse" />

              {/* Contenedor del QR Real */}
              <div className="relative p-4 bg-white border-2 border-purple-500/50 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.2)]" ref={qrRef}>
                <QRCodeSVG
                  value={ticket.qrData}
                  size={180}
                  bgColor="#FFFFFF"
                  fgColor="#020617"
                />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-1">Tu Código QR</h2>

            {/* Información del asiento */}
            {asientoStr && (
              <div className="mb-4 px-3 py-1 bg-purple-500/20 border border-purple-500/40 rounded text-xs font-mono font-bold text-purple-300 uppercase tracking-wider">
                {asientoStr}
              </div>
            )}

            <p className="text-gray-400 text-sm max-w-md mb-6">
              Este código QR es tu pase de acceso personal al evento.
              Pres&eacute;ntalo al encargado en la entrada del teatro.
            </p>

            {/* Datos del ticket */}
            <div className="w-full mb-6 rounded-xl border border-white/10 bg-white/[0.03] p-5 text-left space-y-2">
              <div className="space-y-1.5 text-sm">
                {ticket.nombre && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-xs uppercase tracking-wider">Nombre</span>
                    <span className="text-white font-medium">{ticket.nombre}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500 text-xs uppercase tracking-wider">Correo</span>
                  <span className="text-purple-300 font-mono text-xs">{ticket.email}</span>
                </div>
                {ticket.matricula && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-xs uppercase tracking-wider">Matr&iacute;cula</span>
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

            <button
              onClick={handleDownloadPDF}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl uppercase tracking-widest flex items-center justify-center gap-2 hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg"
            >
              <HiOutlineDownload className="w-5 h-5" />
              Descargar Pase
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}