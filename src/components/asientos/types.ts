import type { SeatIdentity } from '@/config/auditorioConfig'

/**
 * Estatus de pago del asiento.
 * - 'libre'    : no aplica, el asiento está disponible.
 * - 'pagado'   : el ticket está liquidado (verde en la consola de staff,
 *                rojo en el mapa público).
 * - 'pre-registro' : el ticket fue creado sin pago (naranja en consola de staff).
 * - 'pendiente' : alias legacy equivalente a 'apartado' (ámbar en consola de staff).
 * - 'apartado' : la compra relacionada está en estado 'pendiente' o el total
 *                abonado es menor al precio del boleto. Amarillo en el mapa.
 * - 'completo' : la compra está liquidada por el total. Rojo en el mapa.
 */
export type SeatEstatusPago =
  | 'libre'
  | 'pre-registro'
  | 'pagado'
  | 'pendiente'
  | 'apartado'
  | 'completo'

export interface OccupiedSeat extends SeatIdentity {
  ticketId?: string
  estatusPago?: SeatEstatusPago
  buyerId?: string
}

export interface UnidadAcademicaOption {
  id: number
  nombre: string
  tipo: string
}

export type StaffRole = 'admin' | 'encargado'

export interface AssignmentContext {
  userId: string
  role: StaffRole
  unidadAcademicaId: number | null
  unidadAcademicaNombre: string | null
  unidades: UnidadAcademicaOption[]
}

export interface ManualTicketInput extends SeatIdentity {
  nombre: string
  email: string
  matricula: string
  carrera: string
  semestre: string
  telefono: string
  unidadAcademicaId?: number | null
  estatusPago?: 'pre-registro' | 'pagado' | 'pendiente'
}

export interface PreRegistroInput extends SeatIdentity {
  tipo: 'alumno' | 'externo'
  nombre: string
  carrera?: string
  matricula?: string
  semestre?: string
  telefono?: string
  organizacion?: string
}

export interface PerfilUsuarioCompleto {
  email: string | null
  nombre: string | null
  telefono: string | null
  matricula: string | null
  carrera: string | null
  semestre: string | null
  unidadAcademicaId: number | null
  unidadAcademicaNombre: string | null
  tipo: 'alumno' | 'externo' | null
  completo: boolean
}

export interface ActionResult {
  success: boolean
  message: string
}