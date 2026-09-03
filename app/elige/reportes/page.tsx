'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { exportarReporteCSV } from '@/lib/exportUtils'

// Importación dinámica completa del componente cliente con SSR desactivado
const ReporteViewerClient = dynamic(
  () => import('./ReporteViewerClient'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[700px] bg-slate-50 text-slate-400 font-medium text-sm rounded-xl border border-slate-200">
        Cargando visor PDF...
      </div>
    ),
  }
)

export default function ReportesPage() {
  const handleDescargarCSV = async () => {
    try {
      const { getReportesData } = await import('./actions')
      const data = await getReportesData()
      exportarReporteCSV(data.global, data.uas)
    } catch (err) {
      console.error('Error al exportar CSV:', err)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Reportes de Asistencia</h1>
          <p className="text-sm text-slate-500">
            Vista previa y descarga de métricas del Congreso IGE
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDescargarCSV}
            className="px-4 py-2 bg-slate-800 text-white font-medium text-sm rounded-lg hover:bg-slate-900 transition"
          >
            Descargar CSV
          </button>
        </div>
      </div>

      {/* Componente dinámico 100% cliente libre de SSR */}
      <ReporteViewerClient />
    </div>
  )
}
