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
  id: string | number
  identificador: string | null
  cliente: string | null
  correo: string | null
  unidad_academica: string | null
  zona: string | null
  docente: string | null
  estado_pago: string | null
  total_abono: number | string | null
  fecha_venta: string | null
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
  id: string | number
  estatus_pago: string | null
}

function toAmount(value: number | string | null): number {
  const amount = Number(value ?? 0)
  return Number.isFinite(amount) ? amount : 0
}

export async function getReportesData(): Promise<{
  uas: UAMetrica[]
  zonas: ZonaMetrica[]
  global: ResumenGlobal
  tickets: TicketDetalle[]
}> {
  const supabase = await createClient()

  const viewClient = supabase as unknown as {
    from: (relation: string) => {
      select: (columns: string) => {
        range: (
          from: number,
          to: number,
        ) => PromiseLike<{
          data: TicketDetalle[] | null
          error: { message: string } | null
        }>
      }
    }
  }
  const articlesClient = supabase as unknown as {
    from: (relation: string) => {
      select: (columns: string) => PromiseLike<{
        data: ArticuloInvestigacion[] | null
        error: { message: string } | null
      }>
    }
  }

  const [ticketsResult, articulosResult] = await Promise.all([
    viewClient
      .from('vista_reporte_ventas_tickets')
      .select(
        'id, identificador, cliente, correo, unidad_academica, zona, docente, estado_pago, total_abono, fecha_venta',
      )
      .range(0, 5000),
    articlesClient
      .from('articulos_investigacion')
      .select('id, estatus_pago'),
  ])

  if (ticketsResult.error) {
    throw new Error(
      `Error al consultar vista_reporte_ventas_tickets: ${ticketsResult.error.message}`,
    )
  }
  if (articulosResult.error) {
    throw new Error(
      `Error al consultar articulos_investigacion: ${articulosResult.error.message}`,
    )
  }

  const tickets = ticketsResult.data ?? []
  const articulos = articulosResult.data ?? []
  const uaCounts = new Map<
    string,
    {
      totalTickets: number
      totalPagados: number
      totalApartados: number
      ingresos: number
    }
  >()
  const zonaCounts = new Map<string, { boletos: number; ingresos: number }>()

  let totalPagados = 0
  let totalApartados = 0
  let ingresosTickets = 0

  for (const ticket of tickets) {
    const estado = (ticket.estado_pago ?? '').trim().toLowerCase()
    const esPagado = estado === 'pagado' || estado === 'completed'
    const esApartado = estado === 'apartado'

    if (!esPagado && !esApartado) continue

    const abono = toAmount(ticket.total_abono)
    const unidad = ticket.unidad_academica?.trim() || 'No especificada'
    const zona = ticket.zona?.trim() || 'Sin zona'
    const ua = uaCounts.get(unidad) ?? {
      totalTickets: 0,
      totalPagados: 0,
      totalApartados: 0,
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

    uaCounts.set(unidad, ua)
    zonaCounts.set(zona, zonaMetric)
  }

  let articulosAceptados = 0
  let articulosPendientes = 0
  let ingresosPorInvestigacion = 0

  for (const articulo of articulos) {
    const estado = (articulo.estatus_pago ?? '').trim().toLowerCase()
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
    porcentaje:
      totalActivos > 0
        ? Math.round((metricas.totalTickets / totalActivos) * 100)
        : 0,
    totalAlumnos: 0,
    totalEmpresas: 0,
    totalDocentes: 0,
    ingresos: metricas.ingresos,
  })).sort((a, b) => b.totalTickets - a.totalTickets)

  const zonas: ZonaMetrica[] = Array.from(zonaCounts, ([nombre, metricas]) => ({
    nombre,
    boletos: metricas.boletos,
    ingresos: metricas.ingresos,
  })).sort((a, b) => b.boletos - a.boletos)
  const zonaTop = zonas[0]

  return {
    uas,
    zonas,
    tickets,
    global: {
      totalTickets: totalActivos,
      totalAlumnos: 0,
      totalEmpresas: 0,
      totalDocentes: 0,
      porcentajeAlumnos: 0,
      porcentajeEmpresas: 0,
      porcentajeDocentes: 0,
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
      totalPendientes: tickets.length - totalActivos,
    },
  }
}
