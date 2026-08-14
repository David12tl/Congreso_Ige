'use client'

import React, { useEffect, useState, useRef } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { HiOutlineCamera, HiCheckCircle, HiXCircle, HiRefresh, HiOutlineShieldCheck } from 'react-icons/hi'
import { validarCodigoQR, type ResultadoValidacionQR } from '../generar-qr/actions'

export default function EscanearQRPage() {
  const [scanResult, setScanResult] = useState<ResultadoValidacionQR | null>(null)
  const [isScanning, setIsScanning] = useState(true)
  const [loading, setLoading] = useState(false)
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)

  // Callback exitoso de escaneo
  async function onScanSuccess(decodedText: string) {
    if (scannerRef.current) {
      try {
        await scannerRef.current.clear()
        scannerRef.current = null
      } catch (err) {
        console.error('Error al limpiar el hardware de la cámara:', err)
      }
    }
    setIsScanning(false)
    setLoading(true)

    try {
      const respuesta = await validarCodigoQR(decodedText)
      setScanResult(respuesta)
    } catch (err) {
      console.error('Error crítico en el canal de comunicación:', err)
      setScanResult({ success: false, message: 'Fallo crítico de comunicación con el servidor.' })
    } finally {
      setLoading(false)
    }
  }

  function onScanFailure() {
    // Rastreo silencioso mientras busca patrones de contraste
  }

  useEffect(() => {
    let yaInicializado = false

    if (isScanning && !yaInicializado) {
      const contenedor = document.getElementById('reader')
      if (contenedor) {
        contenedor.innerHTML = ''
      }

      const scanner = new Html5QrcodeScanner(
        'reader',
        { 
          fps: 15, 
          qrbox: { width: 250, height: 250 },
          rememberLastUsedCamera: true
        },
        /* verbose= */ false
      )

      scannerRef.current = scanner
      scanner.render(onScanSuccess, onScanFailure)
      yaInicializado = true
    }

    return () => {
      yaInicializado = true
      if (scannerRef.current) {
        scannerRef.current.clear()
          .then(() => {
            scannerRef.current = null
          })
          .catch((err) => console.error('Error apagando cámara en desmontaje:', err))
      }
    }
  }, [isScanning])

  const reiniciarEscaner = () => {
    setScanResult(null)
    setIsScanning(true)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 text-white">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tighter uppercase flex items-center gap-2">
          <HiOutlineCamera className="text-purple-500 w-8 h-8" />
          Control de <span className="text-purple-500">Acceso QR</span>
        </h1>
        <p className="text-slate-400 dark:text-slate-500 text-sm">Escanea las credenciales de los asistentes para validar su entrada al evento.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[400px]">
        
        {/* Lector de Cámara */}
        <div className="md:col-span-2 bg-[#0f172a] border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden ring-1 ring-white/5">
          {isScanning ? (
            <div className="w-full max-w-md bg-white dark:bg-[#2a2a2f] rounded-xl overflow-hidden p-2 text-slate-900 dark:text-slate-100" id="reader" />
          ) : loading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
              <p className="text-purple-400 font-bold uppercase tracking-widest text-xs">Consultando base de datos...</p>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-slate-400 dark:text-slate-500 text-sm">Escáner en pausa</p>
              <button 
                onClick={reiniciarEscaner}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold uppercase tracking-wider text-xs flex items-center gap-2 mx-auto transition-all"
              >
                <HiRefresh className="w-4 h-4" /> Activar Cámara de Nuevo
              </button>
            </div>
          )}
        </div>

        {/* Panel Lateral e Indicadores */}
        <div className="space-y-4 flex flex-col justify-start">
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <HiOutlineShieldCheck className="w-4 h-4 text-purple-400" /> Estado del Punto
            </h3>
            <div className="space-y-3">
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-xs text-slate-400 dark:text-slate-500">Personal de Entrada</span>
                <span className="text-xs font-bold text-purple-400 uppercase">Encargado</span>
              </div>
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-xs text-slate-400 dark:text-slate-500">Modo de Operación</span>
                <span className="text-xs font-bold text-emerald-400 uppercase">En Línea</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL EMERGENTE: Resultado del Escaneo */}
      {scanResult && (
        <div className="fixed inset-0 bg-[#020617]/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-3xl border p-8 text-center shadow-2xl relative bg-[#0f172a] animate-in zoom-in-95 duration-200 ${
            scanResult.success ? 'border-emerald-500/50 shadow-emerald-500/10' : 'border-rose-500/50 shadow-rose-500/10'
          }`}>
            
            <div className="flex justify-center mb-4">
              {scanResult.success ? (
                <HiCheckCircle className="w-20 h-20 text-emerald-500" />
              ) : (
                <HiXCircle className="w-20 h-20 text-rose-500" />
              )}
            </div>

            <h2 className={`text-2xl font-black uppercase tracking-tight ${scanResult.success ? 'text-emerald-400' : 'text-rose-400'}`}>
              {scanResult.success ? 'Acceso Permitido' : 'Acceso Denegado'}
            </h2>
            <p className="text-slate-300 dark:text-slate-400 text-sm mt-1 mb-6 font-medium">{scanResult.message}</p>

            {scanResult.asistente && (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-left space-y-2 mb-6">
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-500 dark:text-slate-400">Nombre del Alumno</span>
                  <p className="text-white text-sm font-bold uppercase truncate">{scanResult.asistente.nombre}</p>
                </div>
                {scanResult.asistente.matricula && (
                  <div>
                    <span className="text-[10px] uppercase font-mono text-slate-500 dark:text-slate-400">No. Control</span>
                    <p className="text-slate-300 dark:text-slate-400 text-xs font-mono">{scanResult.asistente.matricula}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-900">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-slate-500 dark:text-slate-400">Asiento</span>
                    <p className="text-purple-400 text-xs font-bold uppercase truncate">{scanResult.asistente.asiento}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono text-slate-500 dark:text-slate-400">Categoría</span>
                    <p className="text-slate-300 dark:text-slate-400 text-xs font-bold uppercase">{scanResult.asistente.tipo}</p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={reiniciarEscaner}
              className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-sm text-white transition-all shadow-lg ${
                scanResult.success ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20' : 'bg-rose-600 hover:bg-rose-500 shadow-rose-900/20'
              }`}
            >
              Siguiente Asistente
            </button>
          </div>
        </div>
      )}
    </div>
  )
}