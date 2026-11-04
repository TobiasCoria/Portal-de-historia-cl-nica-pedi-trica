export function estadoTurno(estado: string, fecha: Date, ahora = new Date()) {
  if (estado === 'ATENDIDO') return { etiqueta: 'Atendido', clase: 'atendido' }
  if (estado === 'CANCELADO') return { etiqueta: 'Cancelado', clase: 'cancelado' }
  if (estado === 'AUSENTE') return { etiqueta: 'Ausente', clase: 'ausente' }
  return fecha < ahora ? { etiqueta: 'Pendiente de resolver', clase: 'vencido' } : { etiqueta: 'Próximo', clase: 'proximo' }
}
