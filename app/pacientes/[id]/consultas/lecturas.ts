import 'server-only'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth'
import { requirePaciente } from '@/lib/registros'

export async function obtenerConsulta(pacienteId: string, id: string) {
  await requireUser()
  await requirePaciente(pacienteId)
  return prisma.consulta.findUnique({ where: { id, pacienteId, eliminadoEn: null } })
}
