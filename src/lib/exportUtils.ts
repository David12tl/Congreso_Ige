import type { TicketDetalle } from '@/../app/elige/reportes/actions'

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

const MOJIBAKE_REPLACEMENTS: Record<string, string> = {
  'ÃƒÂ¡': 'á',
  'ÃƒÂ©': 'é',
  'ÃƒÂ­': 'í',
  'ÃƒÂ³': 'ó',
  'ÃƒÂº': 'ú',
  'ÃƒÂ±': 'ñ',
  'ÃƒÂ¼': 'ü',
  'ÃƒÂ': 'Á',
  'ÃƒÂ‰': 'É',
  'ÃƒÂ': 'Í',
  'ÃƒÂ“': 'Ó',
  'ÃƒÂš': 'Ú',
  'Ãƒâ€˜': 'Ñ',
  'Ã¡': 'á',
  'Ã©': 'é',
  'Ã­': 'í',
  'Ã³': 'ó',
  'Ãº': 'ú',
  'Ã±': 'ñ',
  'Ã¼': 'ü',
  'Ã': 'Á',
  'Ã‰': 'É',
  'Ã': 'Í',
  'Ã“': 'Ó',
  'Ãš': 'Ú',
  'Ã‘': 'Ñ',
  'Â¡': '¡',
  'Â¿': '¿',
  'â€™': '’',
  'â€œ': '“',
  'â€\u009d': '”',
  'â€“': '–',
  'â€”': '—',
}

function fixUtf8Encoding(value: string): string {
  return Object.entries(MOJIBAKE_REPLACEMENTS).reduce(
    (result, [broken, corrected]) => result.replaceAll(broken, corrected),
    value,
  )
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function cell(value: string, backgroundColor: string): string {
  return `<td style="background-color:${backgroundColor};border:1px solid #000000;padding:4px;mso-number-format:\\@">${escapeHtml(value)}</td>`
}

export function exportarReporteExcel(tickets: TicketDetalle[]): void {
  const headers = [
    'id',
    'identificador',
    'cliente',
    'correo',
    'unidad_academica',
    'escolaridad',
    'zona',
    'docente',
    'estado_pago',
    'total_abono',
    'fecha_venta',
  ]
  const headerCells = headers
    .map(
      (header) =>
        `<th style="background-color:#FFFF00;border:1px solid #000000;padding:5px;font-weight:bold;text-align:center">${header}</th>`,
    )
    .join('')
  const ticketRows = tickets
    .map((ticket) => {
      const cells = [
        cell(ticket.id, '#FFF2CC'),
        cell(ticket.identificador, '#FFF2CC'),
        cell(fixUtf8Encoding(ticket.cliente), '#9BC2E6'),
        cell(ticket.correo, '#FCE4D6'),
        cell(fixUtf8Encoding(ticket.unidad_academica), '#FFF2CC'),
        cell(fixUtf8Encoding(ticket.escolaridad), '#E2EFDA'),
        cell(ticket.zona, '#FFFFFF'),
        cell(fixUtf8Encoding(ticket.docente), '#FFFFFF'),
        cell(ticket.estado_pago, '#FFF2CC'),
        cell(ticket.total_abono, '#FFF2CC'),
        cell(ticket.fecha_venta, '#FFFFFF'),
      ]

      return `<tr>${cells.join('')}</tr>`
    })
    .join('')
  const fechaActual = new Date().toLocaleDateString('en-US')
  const html = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="UTF-8">
  <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Venta de tickets</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
  <style>table{border-collapse:collapse;font-family:Arial,sans-serif;font-size:10pt}td,th{border:1px solid #000000}.title{text-align:center;font-weight:bold;font-size:14pt}</style>
</head>
<body>
  <table>
    <tr><td></td><td class="title" colspan="6">REPORTE DE VENTA DE TICKETS</td><td style="font-weight:bold">Fecha: ${fechaActual}</td></tr>
    <tr><td colspan="11">&nbsp;</td></tr>
    <tr>${headerCells}</tr>
    ${ticketRows}
  </table>
</body>
</html>`
  const blob = new Blob([`\uFEFF${html}`], {
    type: 'application/vnd.ms-excel;charset=utf-8;',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `Reporte_Venta_Tickets_IGE_2026_${Date.now()}.xls`
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}
