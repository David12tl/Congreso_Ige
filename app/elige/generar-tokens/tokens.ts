import { createClient } from '../../../src/lib/supabase/client';
import { TokenCanje } from './TokensTable'; // Ajusta la ruta a tu componente de tabla si es necesario

export async function obtenerTokensConDetalles(): Promise<TokenCanje[]> {
  const supabase = createClient();

  // 1. Engañamos al string de .from() pasándolo por 'unknown' primero para evitar 'any'
  const nombreVista = 'vista_tokens_detalles' as unknown as 'tokens_canje';

  const { data, error } = await supabase
    .from(nombreVista)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error al obtener los tokens detallados:', error.message);
    return [];
  }

  // 2. Para corregir el error 2352 de superposición, convertimos los datos
  // primero a 'unknown' y luego al arreglo 'TokenCanje[]' que necesitas
  return (data as unknown) as TokenCanje[];
}