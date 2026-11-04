import 'server-only'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

export async function requirePaciente(id: string) {
  const paciente = await prisma.paciente.findFirst({ where: { id, eliminadoEn: null }, select: { id: true } })
  if (!paciente) notFound()
  return paciente
}
