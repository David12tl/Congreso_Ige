import { NextResponse } from 'next/server'
import React from 'react'
import { renderToBuffer } from '@react-pdf/renderer'
import { ReportePDF } from '../../elige/reportes/ReportePDF'
import { getReportesData } from '../../elige/reportes/actions'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { global, uas } = await getReportesData()
    const fechaGeneracion = new Date().toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

    const pdfBuffer = await renderToBuffer(
      React.createElement(ReportePDF, {
        global,
        uas,
        fechaGeneracion,
      }) as any
    )

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="Reporte_Congreso_IGE_${Date.now()}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error generando PDF:', error)
    return NextResponse.json(
      { error: 'Error al generar el reporte PDF' },
      { status: 500 }
    )
  }
}
