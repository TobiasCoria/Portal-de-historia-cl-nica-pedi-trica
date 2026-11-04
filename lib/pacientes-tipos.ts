export type FiltrosPacientes = { q: string; cobertura: string; pagina: number }
export type PacienteListado = {
  id: string; nombre: string; apellido: string; dni: string; fechaNac: string;
  tutorNombre: string | null; obraSocial: string | null; particular: boolean; esDemo: boolean;
}
export type PaginaPacientes = {
  pacientes: PacienteListado[]; total: number; pagina: number; paginas: number; filtros: FiltrosPacientes;
}
export function claveFiltros(f: FiltrosPacientes) {
  return JSON.stringify([f.q.trim(), f.cobertura, f.pagina])
}
