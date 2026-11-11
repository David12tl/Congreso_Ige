export type StudentModality = 'escolarizado' | 'mixto'

export function normalizeStudentModality(value: unknown): StudentModality {
  const normalized = typeof value === 'string'
    ? value.trim().normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
    : ''

  return /\b(mixt[oa]|virtual|hibrid[oa]|online|remot[oa]|distancia|semi[\s-]?presencial)\b/.test(normalized)
    ? 'mixto'
    : 'escolarizado'
}
