import { TaquillaTokensView } from './TaquillaTokensView'
import { getOccupiedSeatKeys, getSeatStatusMap, getAssignmentContext, requireAssignmentContext } from './actions'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function GenerarTokensPage() {
  const [assignmentContext, initialOccupiedSeatKeys, initialSeatStatusMap] = await Promise.all([
    requireAssignmentContext(),
    getOccupiedSeatKeys(),
    getSeatStatusMap(),
  ])

  // Obtener estadísticas iniciales de tokens
  const supabase = await createClient()
  const { data: tokensData } = await supabase
    .from('tokens_canje')
    .select('status')

  const tokens = (tokensData as { status: string }[] | null) ?? []
  const initialStats = {
    total: tokens.length,
    disponibles: tokens.filter((t) => t.status === 'disponible').length,
    usados: tokens.length - tokens.filter((t) => t.status === 'disponible').length,
  }

  return (
    <div className="mx-auto max-w-7xl animate-fadeIn">
      <TaquillaTokensView
        assignmentContext={assignmentContext}
        initialOccupiedSeatKeys={initialOccupiedSeatKeys}
        initialSeatStatusMap={initialSeatStatusMap}
        initialStats={initialStats}
      />
    </div>
  )
}