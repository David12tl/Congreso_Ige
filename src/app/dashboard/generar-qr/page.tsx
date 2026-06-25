'use client'

import React, { useEffect, useState, useRef } from 'react'
import { HiOutlineDownload, HiOutlineTicket } from 'react-icons/hi'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { QRCodeCanvas } from 'qrcode.react'
import { obtenerQRData, type DatosTicketParaQR } from './actions'

export default function GenerarQRPage() {
  const [ticket, setTicket] = useState<DatosTicketParaQR | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [descargando, setDescargando] = useState(false)
  
  const boletoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function cargarDatos() {
      try {
        const respuesta = await obtenerQRData()
        if (respuesta.success && respuesta.ticket) {
          setTicket(respuesta.ticket as DatosTicketParaQR)
        } else {
          setError(respuesta.message || 'Error al obtener los datos del ticket')
        }
      } catch (err) {
        console.error("❌ ERROR CRÍTICO EN EFECTO:", err)
        setError('Error crítico al conectar con el servidor.')
      } finally {
        setLoading(false)
      }
    }
    cargarDatos()
  }, [])

  const descargarPDF = async () => {
    if (!boletoRef.current) return
    setDescargando(true)

    try {
      const elemento = boletoRef.current
      // Pequeña espera para asegurar renderizado correcto
      await new Promise((resolve) => setTimeout(resolve, 150))

      const canvas = await html2canvas(elemento, {
        scale: 3, // Calidad alta para impresión nítida y lectura del QR
        useCORS: true, 
        logging: false,
        backgroundColor: '#111827', // Forzamos fondo hex plano compatible con html2canvas
        removeContainer: true,
      })

      const imgData = canvas.toDataURL('image/png')
      
      // Dimensiones exactas de un Gafet ejecutivo vertical estándar: 85mm x 120mm
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [85, 120]
      })

      pdf.addImage(imgData, 'PNG', 0, 0, 85, 120)
      pdf.save(`Gafet_${ticket?.nombre.replace(/\s+/g, '_') || 'Asistente'}.pdf`)
    } catch (err) {
      console.error('Error generando PDF:', err)
      alert('Hubo un problema al generar tu Gafet en PDF. Verifica la consola del navegador.')
    } finally {
      setDescargando(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-white font-mono">
        Cargando las credenciales de tu Gafet...
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 max-w-md mx-auto my-10 bg-red-900 border border-red-800 rounded-2xl text-center text-red-200 font-sans">
        <p className="font-bold mb-2">Aviso del Sistema</p>
        <p className="text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div className="p-4 text-white max-w-sm mx-auto font-sans space-y-6">
      <div>
        <h1 className="text-xl font-black mb-4 uppercase tracking-wider text-center flex items-center justify-center gap-2 text-white">
          <HiOutlineTicket className="text-cyan-400 w-6 h-6" />
          Credencial Digital Congreso
        </h1>
        
        {ticket && (
          <div className="space-y-5">
            
            {/* GAFET ESTÁNDAR COMPATIBLE (85mm x 120mm Proporcional) */}
            {/* Se removieron los gradientes y clases de color complejas propensas al bug de color 'lab' */}
            <div 
              ref={boletoRef}
              id="tarjeta-boleto-captura"
              className="p-5 rounded-xl border text-center overflow-hidden flex flex-col justify-between"
              style={{ 
                backgroundColor: '#111827', 
                borderColor: '#374151',
                color: '#ffffff',
                width: '100%',
                aspectRatio: '85/120',
                boxShadow: 'none' 
              }} 
            >
              {/* Encabezado del Gafet */}
              <div className="pb-3" style={{ borderBottom: '1px solid #374151' }}>
                <p className="text-[10px] uppercase font-mono tracking-widest font-bold" style={{ color: '#22d3ee' }}>CONGRESO INTERNACIONAL</p>
                <p className="text-base font-black tracking-tight" style={{ color: '#ffffff' }}>ELIGE 2026</p>
              </div>

              {/* Información Personal */}
              <div className="my-2 space-y-0.5">
                <p className="text-lg font-black leading-tight" style={{ color: '#22d3ee' }}>{ticket.nombre}</p>
                <p className="text-[11px] font-medium tracking-wide break-all" style={{ color: '#d1d5db' }}>{ticket.email}</p>
                <p className="text-[10px] font-mono uppercase tracking-wider" style={{ color: '#9ca3af' }}>
                  Tipo: <span style={{ color: '#facc15', fontWeight: 'bold' }}>{ticket.tipo}</span>
                </p>
              </div>
              
              {/* Código QR */}
              <div className="p-3 inline-block rounded-lg mx-auto" style={{ backgroundColor: '#ffffff' }}>
                <QRCodeCanvas 
                  value={ticket.qrData} 
                  size={135}            
                  level="H"             
                  includeMargin={false}
                  fgColor="#000000"
                  bgColor="#ffffff"
                />
              </div>

              {/* Detalles de Auditoría Académica y Coordenadas del Asiento */}
              <div className="text-left pt-3 space-y-1 font-mono text-[10px]" style={{ borderTop: '1px solid #374151' }}>
                <div className="flex flex-wrap justify-between" style={{ color: '#9ca3af' }}>
                  <div className="w-[48%]">MATRÍCULA: <span style={{ color: '#ffffff', fontWeight: 'bold', letterSpacing: 'normal', whiteSpace: 'nowrap' }}>{ticket.matricula || '-'}</span></div>
                  <div className="w-[48%]">CARRERA: <span style={{ color: '#ffffff', fontWeight: 'bold', letterSpacing: 'normal', whiteSpace: 'nowrap' }}>{ticket.carrera || '-'}</span></div>
                </div>
                
                <div className="flex flex-wrap justify-between pt-0.5" style={{ color: '#9ca3af' }}>
                  <div className="w-[48%]">SEMESTRE: <span style={{ color: '#ffffff', fontWeight: 'bold', letterSpacing: 'normal', whiteSpace: 'nowrap' }}>{ticket.semestre || '-'}</span></div>
                  <div className="w-[48%]">UNIDAD ACAD.: <span style={{ color: '#ffffff', fontWeight: 'bold', letterSpacing: 'normal', whiteSpace: 'nowrap' }}>{ticket.unidadAcademica || '-'}</span></div>
                </div>

                {/* Grid de Coordenadas con colores CSS Web Seguros */}
                <div className="flex justify-between mt-2 pt-2 text-center p-1.5 rounded-md" style={{ backgroundColor: '#030712', border: '1px solid #1f2937', fontSize: '9px' }}>
                  <div className="w-[23%]">
                    <span className="text-[8px]" style={{ color: '#6b7280', display: 'block' }}>ZONA</span>
                    <span className="text-white font-black uppercase" style={{ letterSpacing: 'normal', whiteSpace: 'nowrap' }}>{ticket.asientoZona || 'Gral'}</span>
                  </div>
                  <div className="w-[23%]">
                    <span className="text-[8px]" style={{ color: '#6b7280', display: 'block' }}>BLOQUE</span>
                    <span className="text-white font-black uppercase" style={{ letterSpacing: 'normal', whiteSpace: 'nowrap' }}>{ticket.asientoBloque || 'Único'}</span>
                  </div>
                  <div className="w-[23%]">
                    <span className="text-[8px]" style={{ color: '#6b7280', display: 'block' }}>FILA</span>
                    <span className="text-white font-black uppercase" style={{ letterSpacing: 'normal', whiteSpace: 'nowrap' }}>{ticket.asientoFila || 'N/A'}</span>
                  </div>
                  <div className="w-[23%]">
                    <span className="text-[8px]" style={{ color: '#6b7280', display: 'block' }}>ASIENTO</span>
                    <span className="font-black" style={{ color: '#22d3ee', letterSpacing: 'normal', whiteSpace: 'nowrap' }}>{ticket.asientoNumero !== null ? ticket.asientoNumero : 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Botón para Imprimir Gafet */}
            <button
              onClick={descargarPDF}
              disabled={descargando}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider disabled:opacity-50"
            >
              <HiOutlineDownload className="w-4 h-4" />
              {descargando ? 'Estructurando Gafet PDF...' : 'Descargar Gafet listo para Imprimir'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}