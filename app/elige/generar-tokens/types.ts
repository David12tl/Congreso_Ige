import type { UnidadAcademicaOption } from '@/components/asientos/types'

export const PRECIO_POR_BOLETO = 650

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