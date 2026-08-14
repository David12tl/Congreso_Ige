import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

interface EventData {
  id: string
  name: string
  start_date: string
  end_date: string
  location: string | null
  maps_link: string | null
}

interface StatsData {
  totalTickets: number
  totalAsistentes: number
  zonasDisponibles: number
  capacidadTotal: number
}

function formatDateRange(start: string, end: string) {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }
  return `${startDate.toLocaleDateString('es-MX', options)} - ${endDate.toLocaleDateString('es-MX', options)}`
}

function daysUntil(date: string): number {
  const target = new Date(date)
  const now = new Date()
  const diff = target.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // ─── Cargar datos del evento activo ────────────────────────────────
  const { data: eventos } = await supabase
    .from('events')
    .select('*')
    .order('start_date', { ascending: true })
    .limit(1)

  const evento: EventData | null = eventos?.[0] ?? null

  // ─── Estadísticas del congreso ─────────────────────────────────────
  const { count: totalTickets } = await supabase
    .from('tickets')
    .select('*', { count: 'exact', head: true })

  const { count: totalAsistentes } = await supabase
    .from('tickets')
    .select('*', { count: 'exact', head: true })
    .not('nombre', 'is', null)

  const { data: zonas } = await supabase
    .from('zones')
    .select('capacity, available')

  const capacidadTotal = zonas?.reduce((acc, z) => acc + z.capacity, 0) ?? 0
  const zonasDisponibles = zonas?.filter(z => z.available > 0).length ?? 0

  const stats: StatsData = {
    totalTickets: totalTickets ?? 0,
    totalAsistentes: totalAsistentes ?? 0,
    zonasDisponibles,
    capacidadTotal,
  }

  const diasRestantes = evento ? daysUntil(evento.start_date) : 0

  // ─── Cuentas por rol (para admins) ─────────────────────────────────
  const { data: perfil } = await supabase
    .from('profiles')
    .select('id_rol')
    .eq('id', user.id)
    .single()

  const esAdmin = perfil?.id_rol === 1

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* ── Hero / Cabecera del Evento ─────────────────────────────── */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1e3a8a] via-[#1e3a8a] to-[#581c87] p-8 md:p-12 text-white">
        <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <span className="inline-block bg-white/15 backdrop-blur-sm text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest border border-white/20">
                Congreso IGE 2026
              </span>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
                {evento?.name ?? 'Congreso de Ingeniería en Gestión Empresarial'}
              </h1>
              {evento && (
                <div className="flex flex-wrap items-center gap-4 text-sm text-white/80">
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDateRange(evento.start_date, evento.end_date)}
                  </span>
                  {evento.location && (
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {evento.location}
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-4 shrink-0">
              {diasRestantes > 0 && (
                <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/15">
                  <span className="block text-3xl font-black">{diasRestantes}</span>
                  <span className="text-[10px] uppercase tracking-widest text-white/70">Días Restantes</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Grid de Acceso Rápido ───────────────────────────────────── */}
      <section>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">Acceso Rápido</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/elige/mapa"
            className="group bg-white dark:bg-[#2a2a2f] rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-lg hover:border-[#1e3a8a]/30 transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-[#1e3a8a] mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#1e3a8a] transition-colors">Mapa del Evento</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Explora stands, salas de conferencias y zonas del congreso</p>
          </Link>

          <Link
            href="/elige/mi-ua"
            className="group bg-white dark:bg-[#2a2a2f] rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-lg hover:border-[#1e3a8a]/30 transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#1e3a8a] transition-colors">Mi Unidad Académica</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Información y estadísticas de tu unidad académica</p>
          </Link>

          <Link
            href="/elige/mis-asientos"
            className="group bg-white dark:bg-[#2a2a2f] rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-lg hover:border-[#1e3a8a]/30 transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#1e3a8a] dark:group-hover:text-blue-400 transition-colors">Mis Asientos</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Visualiza y gestiona tus asientos asignados</p>
          </Link>

          <Link
            href="/elige/usuario"
            className="group bg-white dark:bg-[#2a2a2f] rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-lg hover:border-[#1e3a8a]/30 transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#1e3a8a] dark:group-hover:text-blue-400 transition-colors">Mi Perfil</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Gafete digital, credenciales y unidad académica</p>
          </Link>


          {esAdmin && (
            <Link
              href="/elige/reportes"
              className="group bg-white dark:bg-[#2a2a2f] rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-lg hover:border-[#1e3a8a]/30 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#1e3a8a] dark:group-hover:text-blue-400 transition-colors">Reportes</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Exporta listados, métricas y estadísticas del evento</p>
            </Link>
          )}
        </div>
      </section>

      {/* ── Información de la cuenta ────────────────────────────────── */}
      <section className="bg-white dark:bg-[#2a2a2f] rounded-2xl border border-slate-200 dark:border-slate-700 p-6 md:p-8 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">Tu Cuenta</h2>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1e3a8a] text-white font-bold text-sm flex items-center justify-center">
              {(user.email ?? '?').charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{user.email}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {esAdmin ? 'Administrador' : 'Usuario'}
              </p>
            </div>
          </div>
          <div className="sm:ml-auto flex gap-3">
            <Link
              href="/elige/perfil"
              className="text-xs font-bold uppercase tracking-wider text-[#1e3a8a] bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
            >
              Editar Perfil
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}