'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  Building2,
  CheckCircle2,
  Clock3,
  Download,
  DollarSign,
  MapPin,
  Ticket,
  Users,
} from 'lucide-react'
import { getReportesData, type TicketDetalle } from './actions'

interface ZonaMetrica {
  nombre: string
  boletos: number
  ingresos: number
}

interface UAMetrica {
  nombre: string
  totalTickets: number
  totalPagados: number
  totalApartados: number
}

interface ReportesData {
  global: {
    totalTickets: number
    ingresosTotales: number
    totalPagados: number
    totalApartados: number
    totalPendientes: number
  }
  uas: UAMetrica[]
  zonas: ZonaMetrica[]
  tickets: TicketDetalle[]
}

const ReporteViewerClient = dynamic(
  () => import('./ReporteViewerClient'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200/80 bg-white text-sm font-medium text-slate-500 shadow-sm sm:h-[500px]">
        Cargando visor PDF de reportes...
      </div>
    ),
  },
)

const STATUS_COLORS = {
  pagados: '#06b6d4',
  apartados: '#9333ea',
  pendientes: '#b91c1c',
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

function fixUtf8Encoding(value: string | null): string {
  if (!value) return ''

  return Object.entries(MOJIBAKE_REPLACEMENTS).reduce(
    (result, [broken, corrected]) => result.replaceAll(broken, corrected),
    value,
  )
}

function csvCell(value: string | number | null): string {
  let content = fixUtf8Encoding(value == null ? '' : String(value))
  if (/^[=+\-@\t\r]/.test(content)) content = `'${content}`
  return `"${content.replaceAll('"', '""')}"`
}

function exportarCSV(tickets: TicketDetalle[]): void {
  const headers = [
    'id',
    'identificador',
    'cliente',
    'correo',
    'unidad_academica',
    'zona',
    'docente',
    'estado_pago',
    'total_abono',
    'fecha_venta',
  ]
  const rows = [
    headers.map(csvCell).join(','),
    ...tickets.map((ticket) =>
      [
        ticket.id,
        ticket.identificador,
        ticket.cliente,
        ticket.correo,
        ticket.unidad_academica,
        ticket.zona,
        ticket.docente,
        ticket.estado_pago,
        ticket.total_abono,
        ticket.fecha_venta,
      ]
        .map(csvCell)
        .join(','),
    ),
  ]
  const csv = `\uFEFF${rows.join('\r\n')}`
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `Reporte_Tickets_IGE_2026_${Date.now()}.csv`
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}

function formatCurrency(value: number): string {
  return value.toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  })
}

export default function ReportesPage() {
  const [data, setData] = useState<ReportesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      try {
        const report = await getReportesData()
        if (isMounted) {
          setData({
            global: {
              totalTickets: report.global.totalTickets,
              ingresosTotales: report.global.ingresosTotales,
              totalPagados: report.global.totalPagados,
              totalApartados: report.global.totalApartados,
              totalPendientes: report.global.totalPendientes,
            },
            uas: report.uas.map((ua) => ({
              nombre: fixUtf8Encoding(ua.nombre),
              totalTickets: ua.totalTickets,
              totalPagados: ua.totalPagados,
              totalApartados: ua.totalApartados,
            })),
            zonas: report.zonas.map((zona) => ({
              ...zona,
              nombre: fixUtf8Encoding(zona.nombre),
            })),
            tickets: report.tickets,
          })
        }
      } catch (loadError) {
        console.error('Error al cargar métricas de reportes:', loadError)
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'No fue posible cargar el reporte.',
          )
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    void loadData()
    return () => {
      isMounted = false
    }
  }, [])

  const handleDescargarCSV = () => {
    if (data) exportarCSV(data.tickets)
  }

  const zonasData = data?.zonas ?? []
  const unidadesData = data?.uas ?? []
  const estatusData = [
    { name: 'Pagados', value: data?.global.totalPagados ?? 0, color: STATUS_COLORS.pagados },
    { name: 'Apartados', value: data?.global.totalApartados ?? 0, color: STATUS_COLORS.apartados },
    { name: 'Pendientes', value: data?.global.totalPendientes ?? 0, color: STATUS_COLORS.pendientes },
  ]

  const kpis = [
    {
      label: 'Boletos activos',
      value: loading ? '…' : (data?.global.totalTickets ?? 0).toLocaleString('es-MX'),
      note: 'Pagados y apartados',
      Icon: Ticket,
      accent: 'text-cyan-600',
      iconBg: 'bg-cyan-50',
    },
    {
      label: 'Recaudación total',
      value: loading ? '…' : formatCurrency(data?.global.ingresosTotales ?? 0),
      note: 'Abonos registrados y artículos',
      Icon: DollarSign,
      accent: 'text-purple-700',
      iconBg: 'bg-purple-50',
    },
    {
      label: 'Boletos pagados',
      value: loading ? '…' : (data?.global.totalPagados ?? 0).toLocaleString('es-MX'),
      note: 'Pagos liquidados',
      Icon: CheckCircle2,
      accent: 'text-emerald-700',
      iconBg: 'bg-emerald-50',
    },
    {
      label: 'Boletos apartados',
      value: loading ? '…' : (data?.global.totalApartados ?? 0).toLocaleString('es-MX'),
      note: 'Apartados con abonos registrados',
      Icon: Clock3,
      accent: 'text-red-700',
      iconBg: 'bg-red-50',
    },
  ]

  return (
    <main className="min-h-screen bg-slate-50/50 px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
      <div className="mx-auto w-full max-w-7xl space-y-6 sm:space-y-8">
        <header className="flex flex-col gap-5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6 lg:p-8">
          <div className="min-w-0">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan-700">
              Congreso IGE 2026
            </p>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Dashboard de <span className="text-red-700">reportes</span>
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Métricas de ventas, ocupación por zona y distribución por unidad académica.
            </p>
          </div>
          <div className="flex flex-col items-start gap-3 sm:items-end">
            <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Datos de reportes
              </span>
            </div>
            <button
              type="button"
              onClick={handleDescargarCSV}
              disabled={loading || !data}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-cyan-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Descargar CSV
              {data && <span className="font-medium">({data.tickets.length})</span>}
            </button>
          </div>
        </header>

        {error && (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            No se pudieron cargar las métricas: {error}
          </div>
        )}

        <section
          aria-label="Métricas principales"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {kpis.map(({ label, value, note, Icon, accent, iconBg }) => (
            <article
              key={label}
              className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <p className={`text-xs font-bold uppercase tracking-wider ${accent}`}>
                  {label}
                </p>
                <span className={`shrink-0 rounded-xl p-2.5 ${iconBg} ${accent}`}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
              </div>
              <p className="mt-3 break-words text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                {value}
              </p>
              <p className="mt-1 text-xs text-slate-500">{note}</p>
            </article>
          ))}
        </section>

        <section className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <article className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6 lg:col-span-2">
            <div className="mb-5">
              <h2 className="flex items-center gap-2 text-base font-bold text-slate-900 sm:text-lg">
                <MapPin className="h-5 w-5 text-cyan-600" aria-hidden="true" />
                Asientos por zona
              </h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Boletos pagados y apartados por zona asignada.
              </p>
            </div>
            {zonasData.length > 0 ? (
              <div className="h-64 w-full sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={zonasData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="nombre"
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      tickLine={false}
                      axisLine={{ stroke: '#cbd5e1' }}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#e2e8f0',
                        borderRadius: '0.75rem',
                        color: '#0f172a',
                      }}
                      cursor={{ fill: '#f1f5f9' }}
                    />
                    <Bar dataKey="boletos" name="Boletos" fill="#06b6d4" radius={[7, 7, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <ChartEmptyState loading={loading} />
            )}
          </article>

          <article className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6">
            <div>
              <h2 className="flex items-center gap-2 text-base font-bold text-slate-900 sm:text-lg">
                <Users className="h-5 w-5 text-purple-700" aria-hidden="true" />
                Estado de boletos
              </h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Distribución de boletos por estado de pago.
              </p>
            </div>
            {data ? (
              <>
                <div className="h-52 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={estatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={52}
                        outerRadius={78}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {estatusData.map((item) => (
                          <Cell key={item.name} fill={item.color} stroke="#ffffff" strokeWidth={3} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderColor: '#e2e8f0',
                          borderRadius: '0.75rem',
                          color: '#0f172a',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-center">
                  {estatusData.map((item) => (
                    <div key={item.name} className="min-w-0 rounded-xl bg-slate-50 p-2">
                      <span
                        className="mx-auto mb-1 block h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="block truncate text-[10px] text-slate-500 sm:text-xs">
                        {item.name}
                      </span>
                      <span className="text-sm font-bold text-slate-900">
                        {item.value.toLocaleString('es-MX')}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <ChartEmptyState loading={loading} />
            )}
          </article>
        </section>

        <article className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="flex items-center gap-2 text-base font-bold text-slate-900 sm:text-lg">
              <Building2 className="h-5 w-5 text-emerald-700" aria-hidden="true" />
              Ventas por unidad académica
            </h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Comparativo de boletos pagados y apartados en cada unidad académica.
            </p>
          </div>
          {unidadesData.length > 0 ? (
            <div className="h-72 w-full sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={unidadesData}
                  margin={{ top: 8, right: 8, left: -20, bottom: 36 }}
                >
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="nombre"
                    interval={0}
                    angle={-30}
                    textAnchor="end"
                    height={60}
                    tick={{ fill: '#64748b', fontSize: 10 }}
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '0.75rem',
                      color: '#0f172a',
                    }}
                    cursor={{ fill: '#f1f5f9' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '8px', fontSize: '12px' }} />
                  <Bar
                    name="Pagados"
                    dataKey="totalPagados"
                    fill="#059669"
                    radius={[5, 5, 0, 0]}
                  />
                  <Bar
                    name="Apartados"
                    dataKey="totalApartados"
                    fill="#9333ea"
                    radius={[5, 5, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <ChartEmptyState loading={loading} />
          )}
        </article>

        <section className="space-y-4 border-t border-slate-200 pt-6 sm:pt-8">
          <div>
            <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
              Reporte impreso formal (PDF)
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Vista previa interactiva para imprimir o descargar el informe ejecutivo.
            </p>
          </div>
          <ReporteViewerClient />
        </section>
      </div>
    </main>
  )
}

function ChartEmptyState({ loading }: { loading: boolean }) {
  return (
    <div className="flex h-64 items-center justify-center rounded-xl bg-slate-50 text-center text-sm text-slate-500 sm:h-72">
      {loading ? 'Cargando datos…' : 'No hay datos disponibles para mostrar.'}
    </div>
  )
}
