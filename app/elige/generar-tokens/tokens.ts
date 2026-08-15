export type TokenStatus = 'disponible' | 'usado' | 'expirado';
export type EstadoPago = 'sin_pago' | 'pagado' | 'pendiente' | string; // Ajusta según tu enum real

export interface TokenCanje {
  id: string;
  token_code: string;
  zone_id: string | null;
  creado_por: string;
  created_at: string;
  utilizado_por: string | null;
  status: TokenStatus;
  utilizado_el: string | null;
  total_abonado: number;
  estado_pago: EstadoPago;
  event_id: string;
}