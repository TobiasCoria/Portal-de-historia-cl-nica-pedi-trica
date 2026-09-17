import { prisma } from '@/lib/prisma'

export async function obtenerAgendaProxima() {
  const ahora = new Date()
  const en24hs = new Date(ahora.getTime() + 24 * 60 * 60 * 1000)
  const en30dias = new Date(ahora.getTime() + 30 * 24 * 60 * 60 * 1000)

  const [vacunas, turnos] = await Promise.all([
    prisma.vacunaAplicada.findMany({
      where: { fechaAplicada: null, fechaProgramada: { not: null, lte: en30dias } },
      include: { paciente: true },
    }),
    prisma.turno.findMany({
      where: { estado: 'PENDIENTE', fecha: { lte: en30dias } },
      include: { paciente: true },
    }),
  ])

  const items = [
    ...vacunas.map((v) => ({
      tipo: 'vacuna' as const,
      id: v.id,
      pacienteId: v.pacienteId,
      paciente: v.paciente,
      titulo: v.nombre + (v.dosis ? ` (${v.dosis})` : ''),
      fecha: v.fechaProgramada!,
      vencido: v.fechaProgramada! < ahora,
      urgente: v.fechaProgramada! >= ahora && v.fechaProgramada! <= en24hs,
    })),
    ...turnos.map((t) => ({
      tipo: 'turno' as const,
      id: t.id,
      pacienteId: t.pacienteId,
      paciente: t.paciente,
      titulo: t.motivo || 'Turno',
      fecha: t.fecha,
      vencido: t.fecha < ahora,
      urgente: t.fecha >= ahora && t.fecha <= en24hs,
    })),
  ]

  items.sort((a, b) => a.fecha.getTime() - b.fecha.getTime())
  return items
}