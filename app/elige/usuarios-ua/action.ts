'use server'

import { createClient } from '@/lib/supabase/server'

export interface UsuarioUA {
  id: string
  nombre: string | null
  email: string
  carrera: string | null
  semestre: string | null
  matricula: string | null
  modalidad: 'escolarizado' | 'mixto' | null
  unidad_academica: string | null
  id_rol: string | null
  created_at: string
}

// ── Tipos de fila de la consulta anidada sobre `tickets` ──────────────────
// La tabla `tickets` es la FUENTE PRIMARIA de los datos mostrados:
// nombre, matrícula, carrera, semestre y modalidad viven en cada fila del ticket.
interface TicketFila {
  id: string
  buyer_id: string | null
  nombre: string | null
  email: string | null
  matricula: string | null
  carrera: string | null
  semestre: string | null
  modalidad: 'escolarizado' | 'mixto' | null
  unidad_academica_id: number | null
}

interface ProfileFila {
  id: string
  email: string | null
  id_rol: number
  unidad_academica_id: number | null
  // Relación por FK `profiles_id_rol_fkey`
  roles?: { nombre_rol: string } | null
  // Relación por FK `profiles_unidad_academica_id_fkey`
  unidades_academicas?: { nombre: string } | null
}

// Normaliza un valor de texto de la BD: recorta espacios y trata una cadena vacía
// o de solo espacios como "sin dato" (null).
function valorUtilizable(value: unknown): string | null {
  if (typeof value !== 'string') return (value as string | null) ?? null
  const t = value.trim()
  return t.length > 0 ? t : null
}

// Cliente "bypass" mínimo: el cliente tipado del proyecto está desactualizado y
// rechaza columnas/relaciones reales (p. ej. el FK de `tickets` hacia
// `unidades_academicas`). Este patrón ya se usa en app/elige/generar-qr/actions.ts.
interface SupabaseBypass {
  from: (table: string) => {
    select: (columns?: string) => Promise<{
      data: Record<string, unknown>[] | null
      error: { message: string } | null
    } | null>
  }
}

export async function getUsuariosPorUA(): Promise<UsuarioUA[]> {
  const supabase = await createClient()
  const cli = supabase as unknown as SupabaseBypass

  // ── 1. FUENTE PRIMARIA: `tickets` ──────────────────────────────────────────
  // Los datos de la tabla (nombre, matrícula, carrera, semestre, modalidad) se
  // leen directamente de cada fila de `tickets`. La Unidad Académica NO vive aquí:
  // se resuelve desde `profiles` (paso 2).
  const ticketsRes = await cli
    .from('tickets')
    .select(`
      id,
      buyer_id,
      nombre,
      email,
      matricula,
      carrera,
      semestre,
      modalidad,
      unidad_academica_id
    `)

  if (!ticketsRes || ticketsRes.error) {
    console.error('[getUsuariosPorUA] Error leyendo tickets:', ticketsRes?.error?.message ?? 'sin respuesta')
    return []
  }

  const ticketRows = (ticketsRes.data || []) as unknown as TicketFila[]
  if (ticketRows.length === 0) return []

  // ── 2. Perfiles (para resolver rol, email respaldo y UNIDAD ACADÉMICA) ────
  // `tickets` no tiene FK declarada hacia `profiles`, así que se relaciona en
  // memoria por `buyer_id` (patrón lógico usado en el proyecto). Aquí leemos el
  // `unidad_academica_id` de `profiles` y, mediante su FK real, el NOMBRE de la
  // unidad académica desde `unidades_academicas`.
  const profilesRes = await cli
    .from('profiles')
    .select(`
      id,
      email,
      id_rol,
      unidad_academica_id,
      roles!profiles_id_rol_fkey (
        nombre_rol
      ),
      unidades_academicas!profiles_unidad_academica_id_fkey (
        nombre
      )
    `)

  const profileRows = (profilesRes?.data || []) as unknown as ProfileFila[]

  const rolPorBuyer = new Map<string, string>()
  const emailPorBuyer = new Map<string, string>()
  const idRolPorBuyer = new Map<string, number>()
  const uaPorBuyer = new Map<string, string>()
  profileRows.forEach((p) => {
    rolPorBuyer.set(p.id, p.roles?.nombre_rol || 'Usuario')
    if (p.email) emailPorBuyer.set(p.id, p.email)
    idRolPorBuyer.set(p.id, p.id_rol)
    // Unidad Académica: se toma desde `profiles.unidades_academicas` (RELACIÓN REAL)
    if (p.unidades_academicas?.nombre) uaPorBuyer.set(p.id, p.unidades_academicas.nombre)
  })

  // ── 3. Mapeo final: cada fila de `tickets` es un registro de la tabla ───────
  // Mostramos los tickets cuyo comprador tiene id_rol === 3 (Usuario), que es lo
  // que esta vista "Usuarios por UA" siempre ha representado.
  return ticketRows
    .filter((t) => t.buyer_id !== null && idRolPorBuyer.get(t.buyer_id as string) === 3)
    .map((t): UsuarioUA => {
      const buyerId = t.buyer_id ?? ''
      return {
        id: t.id,
        nombre: valorUtilizable(t.nombre),
        email: valorUtilizable(t.email) || emailPorBuyer.get(buyerId) || '',
        matricula: valorUtilizable(t.matricula),
        carrera: valorUtilizable(t.carrera),
        semestre: valorUtilizable(t.semestre),
        modalidad: t.modalidad ?? null,
        unidad_academica: uaPorBuyer.get(buyerId) || null,
        id_rol: rolPorBuyer.get(buyerId) || 'Usuario',
        created_at: '',
      }
    })
}