import 'server-only'
import { cache } from 'react'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth'
import { pacienteAdministrativo, camposClinicosVacios } from '@/lib/paciente-administrativo'

export const obtenerPaciente = cache(async (id: string) => {
  const user = await requireUser()
  if (user.rol === 'DOCTORA') return prisma.paciente.findUnique({ where: { id, eliminadoEn: null } })
  const paciente = await prisma.paciente.findUnique({ where: { id, eliminadoEn: null }, select: pacienteAdministrativo })
  return paciente ? { ...paciente, ...camposClinicosVacios } : null
})

export async function listarPacientesFicha(busqueda?: string) {
  await requireUser()
  return prisma.paciente.findMany({ where: { eliminadoEn: null, ...(busqueda ? { OR: [{ nombre: { contains: busqueda, mode: 'insensitive' } }, { apellido: { contains: busqueda, mode: 'insensitive' } }, { dni: { contains: busqueda } }] } : {}) }, select: { id: true, nombre: true, apellido: true, dni: true, fechaNac: true }, orderBy: { apellido: 'asc' } })
}
