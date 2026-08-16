'use client'

import React, { useEffect, useState } from 'react'
import { HiOutlineQrcode, HiOutlineDownload, HiOutlineRefresh, HiOutlineExclamationCircle } from 'react-icons/hi'
import type { DatosTicketParaQR } from './actions'
import { GlassCard } from '@/components/ui/GlassCard'
import { obtenerQRData, descargarTicketPDF, descargarGafeteDocentePDF } from './actions'
// 1. IMPORTAR LA LIBRERÍA INSTALADA
import { QRCodeSVG } from 'qrcode.react'

export default function GenerarQRPage() {
  const [qrData, setQrData] = useState<string | null>(null)
  const [ticketInfo, setTicketInfo] = useState<DatosTicketParaQR | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [descargando, setDescargando] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadQR() {
      try {
        const result = await obtenerQRData()
        if (isMounted) {
          if (result.success && result.ticket) {
            setQrData(result.ticket.qrData)
            setTicketInfo(result.ticket)
          } else {
            setError(result.message)
          }
        }
      } catch {
        if (isMounted) {
          setError('No se pudo generar el código QR. Asegúrate de tener un ticket activo.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadQR()

    return () => {
      isMounted = false
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-cyan-200 border-t-cyan-500 animate-spin" />
        <p className="text-slate-500 dark:text-slate-400 font-light text-xs uppercase tracking-widest">Generando código QR...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto p-4 md:p-0">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-black tracking-tight text-[#0f172a] dark:text-white text-2xl md:text-3xl">
            <HiOutlineQrcode className="inline-block w-8 h-8 mr-3 text-cyan-700" />
            Generar{' '}
            <span className="text-cyan-700">
              QR
            </span>
          </h1>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-cyan-50 border border-cyan-200 rounded-full">
          <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
          <span className="text-cyan-700 text-xs font-bold uppercase tracking-widest">Listo para escanear</span>
        </div>
      </header>

      {/* QR Display */}
      <GlassCard className="p-8 flex flex-col items-center justify-center text-center" glowColor="cyan">
        {error ? (
          <div className="space-y-4">
            <HiOutlineExclamationCircle className="w-16 h-16 text-amber-700 mx-auto" />
            <p className="text-amber-700 font-light text-sm">{error}</p>
            <a 
              href="/elige/ingresar-token"
              className="inline-block px-4 py-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-amber-100 transition-all"
            >
              Ingresar Token Primero
            </a>
          </div>
        ) : qrData ? (
          <div className="space-y-6">
            <div className="relative">
              <div className="absolute -inset-4 bg-cyan-100 rounded-full blur-2xl animate-pulse" />
              <div className="relative w-48 h-48 bg-white dark:bg-[#2a2a2f] border-2 border-cyan-200 rounded-[24px] flex items-center justify-center p-4">
                
                {/* 2. REEMPLAZO DE LA IMAGEN ROTA POR EL VECTOR SVG AUTOGENERADO */}
              <QRCodeSVG 
                value={qrData} 
                size={160}
                bgColor="#ffffff"       // Color de fondo plano (blanco)
                fgColor="#0f172a"       // Color del QR plano (azul oscuro de tu tema)
                className="w-full h-full"
                level="H"
              />

              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-[#0f172a] dark:text-white">Tu Código de Acceso</h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-light">Presenta este código en los puntos de control del evento</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={async () => {
                  setDescargando(true)
                  try {
                    const esDocente = ticketInfo?.tipo === 'docente'
                    const resultado = esDocente
                      ? await descargarGafeteDocentePDF()
                      : await descargarTicketPDF()

                    if (resultado.success && resultado.pdfBase64) {
                      const byteCharacters = atob(resultado.pdfBase64)
                      const byteNumbers = new Array(byteCharacters.length)
                      const fileName = esDocente
                        ? `gafete-organizador-${Date.now()}.pdf`
                        : `ticket-congreso-ige-${Date.now()}.pdf`

                      for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i)
                      }
                      const byteArray = new Uint8Array(byteNumbers)
                      const blob = new Blob([byteArray], { type: 'application/pdf' })
                      const url = URL.createObjectURL(blob)
                      const link = document.createElement('a')
                      link.href = url;
                      link.download = fileName
                      document.body.appendChild(link)
                      link.click()
                      document.body.removeChild(link)
                      URL.revokeObjectURL(url)
                    } else {
                      alert(resultado.error || 'No se pudo generar el PDF')
                    }
                  } catch {
                    alert('Error al descargar el ticket')
                  } finally {
                    setDescargando(false)
                  }
                }}
                disabled={descargando}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-cyan-500 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <HiOutlineDownload className="w-4 h-4" />
                {descargando ? 'Generando...' : ticketInfo?.tipo === 'docente' ? 'Descargar Gafete' : 'Descargar Ticket'}
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                <HiOutlineRefresh className="w-4 h-4" />
                Refrescar
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <HiOutlineQrcode className="w-16 h-16 text-slate-300 dark:text-slate-400 mx-auto" />
            <p className="text-slate-500 dark:text-slate-400 font-light text-sm">No tienes un ticket activo. Ingresa tu token primero.</p>
          </div>
        )}
      </GlassCard>
    </div>
  )
}