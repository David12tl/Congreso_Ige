'use client'

import { useState } from 'react'

export default function ReporteViewerClient() {
  const [cargando, setCargando] = useState(true)

  const handleLoad = () => {
    setCargando(false)
  }

  const handleError = () => {
    setCargando(false)
  }

  const handleDescargar = () => {
    const link = document.createElement('a')
    link.href = '/api/reporte-pdf'
    link.download = `Reporte_Congreso_IGE_${Date.now()}.pdf`
    link.click()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={handleDescargar}
          className="px-4 py-2 bg-emerald-600 text-white font-medium text-sm rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Descargar PDF
        </button>
      </div>

      <div className="w-full h-[700px] bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shadow-inner flex items-center justify-center">
        {cargando && (
          <div className="flex flex-col items-center gap-2 text-slate-500 font-medium text-sm">
            <div className="w-7 h-7 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <span>Preparando vista previa del documento...</span>
          </div>
        )}
        <iframe
          src="/api/reporte-pdf"
          className="w-full h-full border-0"
          title="Vista previa del Reporte PDF"
          onLoad={handleLoad}
          onError={handleError}
        />
      </div>
    </div>
  )
}
