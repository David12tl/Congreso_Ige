import ExcelJS from 'exceljs'
import type { ReporteVentaTicket } from '@/../app/elige/reportes/actions'

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

export async function exportarReporteExcel(
  tickets: ReporteVentaTicket[],
): Promise<void> {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Ventas de tickets')
  const columns: {
    key: keyof ReporteVentaTicket
    header: string
    width: number
  }[] = [
    { key: 'ticket_id', header: 'ticket_id', width: 38 },
    { key: 'asistente', header: 'asistente', width: 28 },
    { key: 'email', header: 'email', width: 32 },
    { key: 'matricula', header: 'matricula', width: 18 },
    { key: 'tipo_asistente', header: 'tipo_asistente', width: 20 },
    { key: 'modalidad', header: 'modalidad', width: 18 },
    { key: 'unidad_academica', header: 'unidad_academica', width: 28 },
    {
      key: 'docente_generador',
      header: 'Docente Generador',
      width: 28,
    },
    { key: 'asiento_zona', header: 'asiento_zona', width: 18 },
    { key: 'asiento_bloque', header: 'asiento_bloque', width: 18 },
    { key: 'asiento_fila', header: 'asiento_fila', width: 16 },
    { key: 'asiento_numero', header: 'asiento_numero', width: 18 },
    { key: 'estatus_pago', header: 'estatus_pago', width: 18 },
    { key: 'codigo_token', header: 'codigo_token', width: 24 },
    { key: 'estado_token', header: 'estado_token', width: 18 },
    { key: 'monto_abonado', header: 'monto_abonado', width: 18 },
    { key: 'fecha_registro', header: 'fecha_registro', width: 24 },
  ]

  worksheet.columns = columns.map(({ key, header, width }) => ({
    header,
    key,
    width,
  }))
  worksheet.addRows(tickets)
  worksheet.views = [{ state: 'frozen', ySplit: 1 }]

  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFA6A6A6' } },
        left: { style: 'thin', color: { argb: 'FFA6A6A6' } },
        bottom: { style: 'thin', color: { argb: 'FFA6A6A6' } },
        right: { style: 'thin', color: { argb: 'FFA6A6A6' } },
      }

      if (rowNumber === 1) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF1F4E78' },
        }
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
      }
    })

    if (rowNumber > 1) {
      const tokenCell = row.getCell(15)
      tokenCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
          argb: tokenCell.value === 'Asignado' ? 'FFE2EFDA' : 'FFFCE4D6',
        },
      }
      row.getCell(16).numFmt = '$#,##0.00'
    }
  })

  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `Reporte_Ventas_Tickets_${new Date().toISOString().slice(0, 10)}.xlsx`
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}
