import 'server-only'
import type { Prisma } from '@prisma/client'

export async function verificarHorario(tx: Prisma.TransactionClient, fecha: Date, duracion: number, excluir?: string) {
  const fin = new Date(fecha.getTime() + duracion * 60000)
  const candidatos = await tx.turno.findMany({ where: {
    estado: 'PENDIENTE', id: excluir ? { not: excluir } : undefined,
    paciente: { eliminadoEn: null }, fecha: { gte: new Date(fecha.getTime() - 240 * 60000), lt: fin },
  }, select: { fecha: true, duracion: true } })
  if (candidatos.some(t => t.fecha.getTime() + t.duracion * 60000 > fecha.getTime())) {
    throw new Error('USUARIO:Este horario se superpone con otro turno. Elegí otro horario.')
  }
}
