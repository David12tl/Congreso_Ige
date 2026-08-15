export type TokenStatus = 'disponible' | 'usado' | 'expirado';
export type EstadoPago = 'sin_pago' | 'pagado' | 'pendiente' | string; // Ajusta según tu enum real

export interface TokenCanje {
  id: string;
  token_code: string;
  status: string;
  estado_pago: string;
  total_abonado: number;
  created_at: string;
  // Agrega estos campos para saber de quién es:
  cliente_nombre?: string; 
  cliente_correo?: string;
}