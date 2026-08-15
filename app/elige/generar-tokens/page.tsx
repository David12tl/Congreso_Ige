import { TaquillaTokensView } from './TaquillaTokensView'
import { TokensTable } from './TokensTable' // Ajusta la ruta relativa si moviste el componente
import { createClient } from '@/lib/supabase/server'
import { getSeatKey } from '@/config/auditorioConfig'
import { getAssignmentContext } from './actions'
import type { AssignmentContext } from '@/components/asientos/types'
import type { SeatStatus } from '@/components/asientos/AuditorioSeatMap'
import type { TokenCanje } from './TokensTable' // Apuntamos al tipo correcto exportado por la tabla

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

  // 3. Obtenemos los datos COMPLETOS de la vista detallada de SQL pasándola por unknown para evitar bloqueos estrictos de TS/ESLint
  const nombreVista = 'vista_tokens_detalles' as unknown as 'tokens_canje'

  const { data: dbTokens } = await (supabase
    .from(nombreVista)
    .select('*')
    .order('created_at', { ascending: false }) as unknown as Promise<{ data: TokenCanje[] | null }>)

  const tokensList = dbTokens ?? []

  // Calculamos las estadísticas usando el array completo para ahorrar una petición extra a la base de datos
  const initialStats = {
    total: tokensList.length,
    disponibles: tokensList.filter((t) => t.status === 'disponible').length,
    usados: tokensList.filter((t) => t.status === 'usado').length,
  }

  return (
    <div className="container mx-auto py-8 space-y-10">
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
      <hr className="border-gray-200" />

      {/* Renderizado de la tabla de control pasándole la data obtenida por SSR */}
      <TokensTable tokens={tokensList} />
    </div>
  )
}  