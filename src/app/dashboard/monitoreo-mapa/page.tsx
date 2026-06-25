import { PublicSeatMonitor } from '@/components/asientos/PublicSeatMonitor'
import { getOccupiedSeatKeys } from './actions'

export default async function MonitoreoMapaPage() {
  const initialOccupiedSeatKeys = await getOccupiedSeatKeys()

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-7xl">
        <PublicSeatMonitor initialOccupiedSeatKeys={initialOccupiedSeatKeys} />
      </div>
    </main>
  )
}
