export const TAMANO_HISTORIAL = 12

export function numeroPagina(valor?: string) {
  return Math.max(1, Math.min(10000, Number.parseInt(valor || '1') || 1))
}

// Conserva el paralelismo de filas y total. Solo repite la lectura si desapareció
// la última página mientras se ocultaba un registro.
export async function leerPagina<T>(solicitada: number, contar: () => Promise<number>, leer: (skip: number, take: number) => Promise<T[]>) {
  const [total, iniciales] = await Promise.all([contar(), leer((solicitada - 1) * TAMANO_HISTORIAL, TAMANO_HISTORIAL)])
  const paginas = Math.max(1, Math.ceil(total / TAMANO_HISTORIAL))
  const pagina = Math.min(solicitada, paginas)
  return { total, paginas, pagina, filas: pagina === solicitada ? iniciales : await leer((pagina - 1) * TAMANO_HISTORIAL, TAMANO_HISTORIAL) }
}
