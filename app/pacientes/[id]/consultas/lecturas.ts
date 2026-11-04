import 'server-only'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { requirePaciente } from '@/lib/registros'

export async function obtenerConsulta(pacienteId: string, id: string) {
  await requireRole('DOCTORA')
  await requirePaciente(pacienteId)
  return prisma.consulta.findUnique({ where: { id, pacienteId, eliminadoEn: null } })
}
