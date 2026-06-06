import { SeatAssignmentConsole } from '@/src/components/asientos/SeatAssignmentConsole'
import { getOccupiedSeatKeys } from '@/app/monitoreo-mapa/actions'
import { requireAssignmentContext } from './actions'

export default async function AsignacionAsientosPage() {
  const [assignmentContext, initialOccupiedSeatKeys] = await Promise.all([
    requireAssignmentContext(),
    getOccupiedSeatKeys(),
  ])

  return (
    <div className="mx-auto max-w-7xl animate-fadeIn text-white">
      <SeatAssignmentConsole
        assignmentContext={assignmentContext}
        initialOccupiedSeatKeys={initialOccupiedSeatKeys}
      />
    </div>
  )
}
