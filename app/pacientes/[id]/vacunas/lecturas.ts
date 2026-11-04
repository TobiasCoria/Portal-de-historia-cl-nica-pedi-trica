import 'server-only'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { requirePaciente } from '@/lib/registros'

export async function obtenerVacuna(pacienteId: string, id: string) {
  await requireRole('DOCTORA')
  await requirePaciente(pacienteId)
  return prisma.vacunaAplicada.findUnique({ where: { id, pacienteId, eliminadoEn: null } })
}
