export const ZONA = 'America/Argentina/Buenos_Aires'
export function fechaHoy(fecha = new Date()) {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: ZONA, year: 'numeric', month: '2-digit', day: '2-digit' }).format(fecha)
}
export function fechaValida(valor: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(valor) && !Number.isNaN(Date.parse(valor)) && new Date(valor).toISOString().slice(0, 10) === valor
}
export function diaLocal(valor: string) { return new Date(`${valor}T00:00:00-03:00`) }
export function sumarDias(dia: string, cantidad: number) {
  const fecha = new Date(`${dia}T12:00:00-03:00`)
  fecha.setUTCDate(fecha.getUTCDate() + cantidad)
  return fechaHoy(fecha)
}
export function fechaCorta(valor: Date | string) {
  // Las fechas sin hora se conservan como días de calendario.
  const fecha = typeof valor === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(valor) ? diaLocal(valor) : new Date(valor)
  return fecha.toLocaleDateString('es-AR', { timeZone: ZONA, day: '2-digit', month: 'short', year: 'numeric' })
}
export function horaLocal(valor: Date | string) {
  return new Date(valor).toLocaleTimeString('es-AR', { timeZone: ZONA, hour: '2-digit', minute: '2-digit' })
}
export function inputFechaHora(valor: Date | string) {
  return `${fechaHoy(new Date(valor))}T${horaLocal(valor)}`
}
export function edad(fecha: Date | string) {
  const nacimiento = new Date(fecha).toISOString().slice(0, 10)
  const [a, m, d] = nacimiento.split('-').map(Number)
  const [ha, hm, hd] = fechaHoy().split('-').map(Number)
  const meses = (ha - a) * 12 + hm - m - (hd < d ? 1 : 0)
  if (meses < 1) return 'Menor de 1 mes'
  if (meses < 24) return `${meses} meses`
  return `${Math.floor(meses / 12)} años`
}
