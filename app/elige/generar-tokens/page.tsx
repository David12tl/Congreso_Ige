import { TaquillaTokensView } from './TaquillaTokensView'
import { TokensTable } from './TokensTable'
import { createClient } from '@/lib/supabase/server'
import { getSeatKey } from '@/config/auditorioConfig'
import { getAssignmentContext } from './actions'
import type { AssignmentContext } from '@/components/asientos/types'
import type { SeatEstatusPago as SeatStatus } from '@/components/asientos/types'
import type { TokenCanje } from './TokensTable'
import {
  enriquecerTokensConDetalles,
  RawTokenRow,
  TicketLookupRow,
  PurchaseLookupRow,
} from './tokenResolver'

export default async function GenerarTokensPage() {
  const supabase = await createClient()

  // 1. Obtener contexto de asignacion del usuario (Rol / Unidad)
  const assignmentContext: AssignmentContext | null = await getAssignmentContext()

  // 2. Consultar asientos ocupados inicialmente desde Supabase para evitar parpadeos (SSR)
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
      const key = getSeatKey({
        zoneCode: ticket.asiento_zona as 'EXTERNOS' | 'ZONA_1' | 'ZONA_2' | 'ZONA_3' | 'ZONA_4',
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

  // 3. Obtenemos los datos COMPLETOS de los tokens enriquecidos con la identidad del alumno asignado/comprador
  const nombreVista = 'vista_tokens_detalles' as unknown as 'tokens_canje'

  const [tokensRes, ticketsLookupRes, purchasesLookupRes] = await Promise.all([
    supabase
      .from(nombreVista)
      .select('*')
      .order('created_at', { ascending: false }),
    supabase
      .from('tickets')
      .select('id, nombre, email, matricula, purchase_id, buyer_id'),
    supabase
      .from('purchases')
      .select('id, amount_paid, created_at'),
  ])

  const rawTokens = (tokensRes.data as unknown as RawTokenRow[]) || []
  const ticketsLookup = (ticketsLookupRes.data as unknown as TicketLookupRow[]) || []
  const purchasesLookup = (purchasesLookupRes.data as unknown as PurchaseLookupRow[]) || []

  const tokensList: TokenCanje[] = enriquecerTokensConDetalles(rawTokens, ticketsLookup, purchasesLookup)

  const initialStats = {
    total: tokensList.length,
    disponibles: tokensList.filter((t) => t.status === 'disponible').length,
    usados: tokensList.filter((t) => t.status === 'usado').length,
  }

  return (
    /* Reemplazado 'container' por 'w-full max-w-[1800px]' para abarcar el espacio de pantalla horizontal */
    <div className="w-full max-w-[1800px] mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Vista principal con el mapa interactivo de asientos */}
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

      {/* Separador visual limpio */}
      <hr className="border-slate-200" />

      {/* Renderizado de la tabla de control */}
      <div className="w-full overflow-x-auto">
        <TokensTable tokens={tokensList} />
      </div>
    </div>
  )
}