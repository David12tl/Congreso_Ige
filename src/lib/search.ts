export function normalizarTextoBusqueda(value: string | null | undefined): string {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
}

export function coincideBusquedaPorPalabras(
  termino: string,
  campos: readonly (string | null | undefined)[]
): boolean {
  const palabras = normalizarTextoBusqueda(termino).split(/\s+/).filter(Boolean)
  if (palabras.length === 0) return true

  const camposNormalizados = campos.map(normalizarTextoBusqueda).filter(Boolean)
  return palabras.every((palabra) =>
    camposNormalizados.some((campo) => campo.includes(palabra))
  )
}
