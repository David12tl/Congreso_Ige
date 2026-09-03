import { ResumenGlobal, UAMetrica } from '@/../app/elige/reportes/actions'

export async function exportarReportePDF() {
  // Obtener el PDF generado en el servidor via API
  const response = await fetch('/api/reporte-pdf')
  
  if (!response.ok) {
    throw new Error('Error al generar el reporte PDF')
  }

  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `Reporte_Congreso_IGE_${Date.now()}.pdf`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function exportarReporteCSV(global: ResumenGlobal, uas: UAMetrica[]) {
  const lineas: string[] = []

  lineas.push('--- RESUMEN GLOBAL DEL CONGRESO ---')
  lineas.push('Métrica,Cantidad,Porcentaje')
  lineas.push(`Total Tickets,${global.totalTickets},100%`)
  lineas.push(`Alumnos,${global.totalAlumnos},${global.porcentajeAlumnos}%`)
  lineas.push(`Empresas,${global.totalEmpresas},${global.porcentajeEmpresas}%`)
  lineas.push('')
  lineas.push('--- RENDIMIENTO POR UNIDAD ACADÉMICA ---')
  lineas.push('Unidad Académica,Tickets Vendidos,Porcentaje del Total')

  uas.forEach((ua) => {
    lineas.push(`"${ua.nombre.replace(/"/g, '""')}",${ua.totalTickets},${ua.porcentaje}%`)
  })

  const csvContent = '\uFEFF' + lineas.join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `Reporte_Unidades_Academicas_${Date.now()}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
