// app/dashboard/generar-tokens/page.tsx
import { TaquillaTokensView } from './TaquillaTokensView'
import { createClient } from '@/lib/supabase/server'
import { getSeatKey } from '@/config/auditorioConfig'
import { getAssignmentContext } from './actions'
import type { AssignmentContext } from '@/components/asientos/types'
import type { SeatStatus } from '@/components/asientos/AuditorioSeatMap'

export default async function GenerarTokensPage() {
  const supabase = await createClient()

  // 1. Obtener contexto de asignacion del usuario (Rol / Unidad)
  const assignmentContext: AssignmentContext | null = await getAssignmentContext()

  // 2. Consultar asientos ocupados inicialmente desde Supabase para evitar parpadeos (SSR)
  // Usamos unknown para evitar errores de tipado con Supabase
  const { data: tickets } = await (supabase
    .from('tickets')
    .select('asiento_zona, asiento_bloque, asiento_fila, asiento_numero, estatus_pago') as unknown as Promise<{
      data: Array<{
        asiento_zona: string | null
        asiento_bloque: string | null
        asiento_fila: string | null
        asiento_numero: number | null
        estatus_pago: string | null
      }> | null
    }>)

  const initialOccupiedSeatKeys: string[] = []
  const initialSeatStatusMap: Record<string, SeatStatus> = {}

  tickets?.forEach((ticket) => {
    if (ticket.asiento_zona && ticket.asiento_bloque && ticket.asiento_fila && ticket.asiento_numero) {
      // Reconstruir la clave unica del asiento usando getSeatKey (formato: "ZONA|BLOQUE|FILA|NUMERO")
      const key = getSeatKey({
        zoneCode: ticket.asiento_zona as 'PREFERENTE' | 'LUNETA' | 'PALCOS' | 'GENERAL PLANTA BAJA' | 'GENERAL PLANTA ALTA',
        zoneId: '',
        bloque: ticket.asiento_bloque,
        fila: ticket.asiento_fila,
        numero: ticket.asiento_numero,
      })
      initialOccupiedSeatKeys.push(key)
      // eslint-disable-next-line security/detect-object-injection
      initialSeatStatusMap[key] = (ticket.estatus_pago as SeatStatus) || 'pendiente'
    }
  })

  // 3. Estadisticas iniciales de tokens
  const { data: tokenStats } = await (supabase
    .from('tokens_canje')
    .select('status') as unknown as Promise<{ data: Array<{ status: string }> | null }>)
  const tokens = (tokenStats ?? []) as Array<{ status: string }>
  const initialStats = {
    total: tokens.length,
    disponibles: tokens.filter((t) => t.status === 'disponible').length,
    usados: tokens.length - tokens.filter((t) => t.status === 'disponible').length,
  }

  return (
    <div className="container mx-auto py-8">
      {/* Renderizamos el componente que de verdad contiene el mapa SVG y la logica de cobro */}
      <TaquillaTokensView 
        assignmentContext={assignmentContext ?? {
          userId: '',
          role: 'admin',
          unidadAcademicaId: null,
          unidadAcademicaNombre: null,
          unidades: [],
        }}
        initialOccupiedSeatKeys={initialOccupiedSeatKeys}
        initialSeatStatusMap={initialSeatStatusMap}
        initialStats={initialStats}
      />
    </div>
  )
}