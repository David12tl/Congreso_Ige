import type { SeatIdentity } from '@/src/config/auditorioConfig'

export interface OccupiedSeat extends SeatIdentity {
  ticketId?: string
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
}

export interface ActionResult {
  success: boolean
  message: string
}
