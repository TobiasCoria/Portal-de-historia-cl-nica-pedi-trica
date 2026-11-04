import 'server-only'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth'
import { requirePaciente } from '@/lib/registros'

export async function obtenerTurno(pacienteId: string, id: string) {
  await requireUser()
  await requirePaciente(pacienteId)
  return prisma.turno.findUnique({ where: { id, pacienteId, estado: 'PENDIENTE' } })
}
