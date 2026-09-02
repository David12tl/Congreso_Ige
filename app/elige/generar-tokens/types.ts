import type { UnidadAcademicaOption, AssignmentContext, SeatEstatusPago as SeatStatus } from '@/components/asientos/types'
import type { ZoneCode, SeatIdentity } from '@/config/auditorioConfig'
import type { SeatSelectionInfo } from '@/components/asientos/zonaExternos'
import type { ZonaSeatSelectionInfo } from '@/components/asientos/ZonaGrid'

export const PRECIO_POR_BOLETO = 650

// Pestañas de zonas visibles en la taquilla (interacción directa, sin modales).
export const ZONA_TABS = ['EXTERNOS', 'ZONA_1', 'ZONA_2', 'ZONA_3', 'ZONA_4'] as const

export interface ApartadoInfoLocal {
  ticketId: string
  purchaseId: string | null
  totalAbonado: number
  montoRestante: number
  status: string
  total: number
  tokenCode: string | null
  nombre: string | null
  email: string | null
}

export interface TicketWithPurchase {
  id: string
  nombre: string | null
  email: string | null
  zone_id: string | null
  purchase_id: string | null
  purchases: {
    amount_paid: number
    total: number
    status: string
  } | null
}

export interface ProfileRoleRow {
  id_rol: number
  unidad_academica_id?: number | null
}

export interface StaffTicketRow {
  unidad_academica_id?: number | null
  unidad_academica?: string | null
}

export interface DbError {
  code?: string
  message: string
}

export interface AssignmentDataClient {
  from: (table: string) => {
    select: (columns: string) => {
      eq: (column: string, value: string | number) => {
        maybeSingle: () => Promise<{ data: ProfileRoleRow | StaffTicketRow | null; error: DbError | null }>
      }
      order: (column: string, options: { ascending: boolean }) => Promise<{
        data: UnidadAcademicaOption[] | null
        error: DbError | null
      }>
    }
    insert: (values: Record<string, unknown>) => Promise<{ error: DbError | null }>
  }
}

export interface TokenCanjeInsert {
  token_code: string
  event_id: string
  zone_id: string
  creado_por: string
  status: string
  total_abonado: number
  estado_pago: 'sin_pago' | 'faltante' | 'completado'
}

// ─── Tipos de TaquillaTokensView ───────────────────────────────────────

export interface TicketInsertPayload {
  event_id?: string | null
  zone_id?: string | null
  asiento_zona?: string | null
  asiento_bloque?: string | null
  asiento_fila?: string | null
  asiento_numero?: number | null
  purchase_id?: string | null
  estatus_pago?: string | null
}

export interface TaquillaTokensViewProps {
  assignmentContext: AssignmentContext
  initialOccupiedSeatKeys: string[]
  initialSeatStatusMap: Record<string, string>
  initialStats: { total: number; disponibles: number; usados: number }
}

export interface TicketSelectResponse {
  id: string
  nombre: string | null
  email: string | null
  buyer_id?: string | null
  type?: string | null
}

export interface ApartadoPendienteRow {
  ticketId: string
  purchaseId: string | null
  zoneId: string | null
  zoneCode: ZoneCode | null
  bloque: string | null
  fila: string | null
  numero: number | null
  nombre: string | null
  email: string | null
  totalAbonado: number
  montoRestante: number
  total: number
  estatusPago: string
  purchasedAt: string | null
}

export interface ExtendedZoneConfig {
  id: string
  code: ZoneCode
  name?: string
  price?: number
  [key: string]: unknown
}

export type ModalMode = 'nuevo' | 'liquidar' | null

export type MetodoRegistro = 'pago' | 'apartado'

export type TipoPagoLiquidacion = 'efectivo' | 'transferencia'

export interface ZonaSupabaseRow {
  id: string
  name: string
  price: number
  capacity: number
}

export interface TaquillaStoreResult {
  // Estado de zonas
  zonaActiva: string
  onZonaActivaChange: (value: string) => void

  // Estado del mapa
  occupiedSeatKeys: Set<string>
  seatStatusMap: Record<string, SeatStatus>
  asientosOcupados: string[]

  // Asiento seleccionado
  selectedSeat: SeatIdentity | null
  selectedTicketId: string | null
  modalMode: ModalMode

  // Buscador de pre-registros
  busqueda: string
  usuariosPendientes: TicketSelectResponse[]
  usuarioSeleccionado: TicketSelectResponse | null

  // Formulario nuevo cobro
  nombreAlumno: string
  emailAlumno: string
  metodoRegistro: MetodoRegistro
  montoApartado: number

  // Apartado / liquidación
  infoApartado: ApartadoInfoLocal | null
  loadingApartado: boolean
  tipoPagoLiquidacion: TipoPagoLiquidacion

  // Lista de apartados pendientes
  apartadosPendientes: ApartadoPendienteRow[]
  loadingApartados: boolean
  errorApartados: string | null
  filtroNombre: string

  // Feedback
  errorMsg: string | null
  tokenGenerado: string | null
  isPending: boolean

  // Estadísticas
  stats: { total: number; disponibles: number; usados: number }

  // Asiento seleccionado (etiqueta legible)
  asientoSeleccionado: string | null

  // Zona activa derivada
  zonaActivaRow: ZonaSupabaseRow | null
  zonaActivaOcupados: string[]
  zonaActivaStatuses: Record<string, string>

  // Zona seleccionada (para panel lateral)
  selectedZone: ExtendedZoneConfig | null

  // Apartados filtrados
  apartadosFiltrados: ApartadoPendienteRow[]
  totalPendientes: number
  totalAdeudo: number

  // Handlers
  onNombreAlumnoChange: (value: string) => void
  onEmailAlumnoChange: (value: string) => void
  onMetodoRegistroChange: (value: MetodoRegistro) => void
  onMontoApartadoChange: (value: number) => void
  onBusquedaChange: (value: string) => void
  onFiltroNombreChange: (value: string) => void
  onSeleccionarUsuario: (u: TicketSelectResponse) => void
  onDeseleccionarUsuario: () => void
  onBuscarPreRegistro: () => void
  onSeleccionarAsiento: (seatId: string, info: SeatSelectionInfo) => void
  onSeleccionarAsientoCuadro: (
    zonaCode: string,
    zoneId: string,
    seatId: string,
    info: ZonaSeatSelectionInfo | SeatSelectionInfo,
  ) => void
  onLiquidarDesdeTabla: (row: ApartadoPendienteRow) => void
  onConfirmarNuevoCobro: (e: React.FormEvent) => void
  onConfirmarLiquidacion: () => void
  onCancelarNuevoCobro: () => void
  onRegresarLiquidacion: () => void
  onCerrarToken: () => void
  onTipoPagoLiquidacionChange: (value: TipoPagoLiquidacion) => void
  onRecargarApartados: () => void
}