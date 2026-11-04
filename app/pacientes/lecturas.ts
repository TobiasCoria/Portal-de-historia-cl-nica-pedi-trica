import 'server-only'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth'
import { requirePaciente } from '@/lib/registros'

export async function obtenerPaciente(id: string) {
  await requireUser()
  return prisma.paciente.findUnique({ where: { id, eliminadoEn: null } })
}

export async function listarPacientesFicha(busqueda?: string) {
  await requireUser()
  return prisma.paciente.findMany({ where: { eliminadoEn: null, ...(busqueda ? { OR: [{ nombre: { contains: busqueda, mode: 'insensitive' } }, { apellido: { contains: busqueda, mode: 'insensitive' } }, { dni: { contains: busqueda } }] } : {}) }, select: { id: true, nombre: true, apellido: true, dni: true, fechaNac: true }, orderBy: { apellido: 'asc' } })
}
