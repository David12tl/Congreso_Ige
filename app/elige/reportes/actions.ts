'use server'

import { createClient } from '@/lib/supabase/server'

export interface UAMetrica {
  nombre: string
  totalTickets: number
  totalPagados: number
  totalApartados: number
  porcentaje: number
  totalAlumnos: number
  totalEmpresas: number
  totalDocentes: number
  ingresos: number
}

export interface ZonaMetrica {
  nombre: string
  boletos: number
  ingresos: number
}

export interface TicketDetalle {
  id: string
  identificador: string
  cliente: string
  correo: string
  unidad_academica: string
  escolaridad: string
  zona: string
  docente: string
  estado_pago: string
  total_abono: string
  fecha_venta: string
}

export interface ResumenGlobal {
  totalTickets: number
  totalAlumnos: number
  totalEmpresas: number
  totalDocentes: number
  porcentajeAlumnos: number
  porcentajeEmpresas: number
  porcentajeDocentes: number
  ingresosTotales: number
  ingresosPorInvestigacion: number
  asistenciasDia1: number
  asistenciasDia2: number
  totalAsistencias: number
  articulosAceptados: number
  articulosPendientes: number
  totalArticulos: number
  zonaTop: string
  zonaTopTickets: number
  totalPagados: number
  totalApartados: number
  totalPendientes: number
}

interface ArticuloInvestigacion {
  estatus_pago: string
}

interface RawRecord {
  [key: string]: unknown
}

interface QueryResult {
  data: unknown[] | null
  error: { message: string } | null
}

interface QueryBuilder extends PromiseLike<QueryResult> {
  range(from: number, to: number): PromiseLike<QueryResult>
}

interface UntypedSupabaseClient {
  from(relation: string): {
    select(columns: string): QueryBuilder
  }
}

interface TicketMetricas {
  detalle: TicketDetalle
  tipo: string
}

function createEmptyReportesData(): {
  uas: UAMetrica[]
  zonas: ZonaMetrica[]
  global: ResumenGlobal
  tickets: TicketDetalle[]
} {
  return {
    uas: [],
    zonas: [],
    tickets: [],
    global: {
      totalTickets: 0,
      totalAlumnos: 0,
      totalEmpresas: 0,
      totalDocentes: 0,
      porcentajeAlumnos: 0,
      porcentajeEmpresas: 0,
      porcentajeDocentes: 0,
      ingresosTotales: 0,
      ingresosPorInvestigacion: 0,
      asistenciasDia1: 0,
      asistenciasDia2: 0,
      totalAsistencias: 0,
      articulosAceptados: 0,
      articulosPendientes: 0,
      totalArticulos: 0,
      zonaTop: '',
      zonaTopTickets: 0,
      totalPagados: 0,
      totalApartados: 0,
      totalPendientes: 0,
    },
  }
}

function isRecord(value: unknown): value is RawRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function stringValue(value: unknown): string {
  return String(value || '')
}

function toAmount(value: string): number {
  const amount = Number(value)
  return Number.isFinite(amount) ? amount : 0
}

function percentage(value: number, total: number): number {
  return total > 0 ? Math.round((value / total) * 100) : 0
}

export async function getReportesData(): Promise<{
  uas: UAMetrica[]
  zonas: ZonaMetrica[]
  global: ResumenGlobal
  tickets: TicketDetalle[]
}> {
  try {
    const supabase = await createClient()
    const viewClient = supabase as unknown as UntypedSupabaseClient
    const ticketsResult = await viewClient
      .from('vista_reporte_ventas_tickets')
      .select('*')
      .range(0, 2000)

    if (ticketsResult.error) {
      throw new Error(
        `Error al consultar vista_reporte_ventas_tickets: ${ticketsResult.error.message}`,
      )
    }

    const rawTickets = (ticketsResult.data ?? []).filter(isRecord)
    const ticketsLista: TicketMetricas[] = rawTickets.map((t) => ({
      detalle: {
        id: stringValue(t.id),
        identificador: stringValue(t.identificador),
        cliente: stringValue(t.cliente),
        correo: stringValue(t.correo),
        unidad_academica: stringValue(t.unidad_academica),
        escolaridad: String(t.escolaridad || 'N/A'),
        zona: stringValue(t.zona),
        docente: stringValue(t.docente),
        estado_pago: stringValue(t.estado_pago || t.estatus_pago),
        total_abono: stringValue(t.total_abono),
        fecha_venta: stringValue(t.fecha_venta),
      },
      tipo: stringValue(t.tipo_ticket || t.type || 'alumno'),
    }))
    const tickets = ticketsLista.map(({ detalle }) => detalle)

    let articulos: ArticuloInvestigacion[] = []
    try {
      const articulosResult = await viewClient
        .from('articulos_investigacion')
        .select('*')

      if (articulosResult.error) {
        throw new Error(articulosResult.error.message)
      }

      articulos = (articulosResult.data ?? [])
        .filter(isRecord)
        .map((articulo) => ({
          estatus_pago: stringValue(articulo.estatus_pago),
        }))
    } catch (error) {
      console.error('Error al consultar articulos_investigacion:', error)
      articulos = []
    }

    const uaCounts = new Map<
      string,
      {
        totalTickets: number
        totalPagados: number
        totalApartados: number
        totalAlumnos: number
        totalEmpresas: number
        totalDocentes: number
        ingresos: number
      }
    >()
    const zonaCounts = new Map<string, { boletos: number; ingresos: number }>()

    let totalPagados = 0
    let totalApartados = 0
    let totalAlumnos = 0
    let totalEmpresas = 0
    let totalDocentes = 0
    let ingresosTickets = 0

    for (const { detalle: ticket, tipo } of ticketsLista) {
      const estado = ticket.estado_pago.trim().toLowerCase()
      const esPagado = estado === 'pagado' || estado === 'completed'
      const esApartado = estado === 'apartado'

      if (!esPagado && !esApartado) continue

      const abono = toAmount(ticket.total_abono)
      const unidad = ticket.unidad_academica.trim() || 'No especificada'
      const zona = ticket.zona.trim() || 'Sin zona'
      const tipoNormalizado = tipo.trim().toLowerCase()
      const ua = uaCounts.get(unidad) ?? {
        totalTickets: 0,
        totalPagados: 0,
        totalApartados: 0,
        totalAlumnos: 0,
        totalEmpresas: 0,
        totalDocentes: 0,
        ingresos: 0,
      }
      const zonaMetric = zonaCounts.get(zona) ?? { boletos: 0, ingresos: 0 }

      ua.totalTickets++
      ua.totalPagados += Number(esPagado)
      ua.totalApartados += Number(esApartado)
      ua.ingresos += abono
      zonaMetric.boletos++
      zonaMetric.ingresos += abono
      ingresosTickets += abono
      totalPagados += Number(esPagado)
      totalApartados += Number(esApartado)

      if (tipoNormalizado === 'alumno') {
        totalAlumnos++
        ua.totalAlumnos++
      } else if (tipoNormalizado === 'empresa') {
        totalEmpresas++
        ua.totalEmpresas++
      } else if (tipoNormalizado === 'docente') {
        totalDocentes++
        ua.totalDocentes++
      }

      uaCounts.set(unidad, ua)
      zonaCounts.set(zona, zonaMetric)
    }

    let articulosAceptados = 0
    let articulosPendientes = 0
    let ingresosPorInvestigacion = 0

    for (const articulo of articulos) {
      const estado = articulo.estatus_pago.trim().toLowerCase()
      if (estado === 'completed' || estado === 'pagado') {
        articulosAceptados++
        ingresosPorInvestigacion += 1500
      } else {
        articulosPendientes++
      }
    }

    const totalActivos = totalPagados + totalApartados
    const uas: UAMetrica[] = Array.from(uaCounts, ([nombre, metricas]) => ({
      nombre,
      totalTickets: metricas.totalTickets,
      totalPagados: metricas.totalPagados,
      totalApartados: metricas.totalApartados,
      porcentaje: percentage(metricas.totalTickets, totalActivos),
      totalAlumnos: metricas.totalAlumnos,
      totalEmpresas: metricas.totalEmpresas,
      totalDocentes: metricas.totalDocentes,
      ingresos: metricas.ingresos,
    })).sort((a, b) => b.totalTickets - a.totalTickets)

    const zonas: ZonaMetrica[] = Array.from(
      zonaCounts,
      ([nombre, metricas]) => ({
        nombre,
        boletos: metricas.boletos,
        ingresos: metricas.ingresos,
      }),
    ).sort((a, b) => b.boletos - a.boletos)
    const zonaTop = zonas[0]

    return {
      uas,
      zonas,
      tickets,
      global: {
        totalTickets: totalActivos,
        totalAlumnos,
        totalEmpresas,
        totalDocentes,
        porcentajeAlumnos: percentage(totalAlumnos, totalActivos),
        porcentajeEmpresas: percentage(totalEmpresas, totalActivos),
        porcentajeDocentes: percentage(totalDocentes, totalActivos),
        ingresosTotales: ingresosTickets + ingresosPorInvestigacion,
        ingresosPorInvestigacion,
        asistenciasDia1: 0,
        asistenciasDia2: 0,
        totalAsistencias: 0,
        articulosAceptados,
        articulosPendientes,
        totalArticulos: articulos.length,
        zonaTop: zonaTop?.nombre ?? 'Ninguna',
        zonaTopTickets: zonaTop?.boletos ?? 0,
        totalPagados,
        totalApartados,
        totalPendientes: rawTickets.length - totalActivos,
      },
    }
  } catch (error) {
    console.error('Error inesperado en getReportesData:', error)
    return createEmptyReportesData()
  }
}
