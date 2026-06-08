import type { SeatIdentity } from '@/src/config/auditorioConfig'

export interface OccupiedSeat extends SeatIdentity {
  ticketId?: string
  estatusPago?: 'pre-registro' | 'pagado' | 'pendiente'
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