'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { mensajeError } from '@/lib/errores'

export async function crearConsulta(pacienteId: string, data: {
  motivo: string
  diagnostico?: string
  tratamiento?: string
  peso?: number
  talla?: number
  observaciones?: string
}, turnoId?: string) {
  const consulta = await prisma.consulta.create({
    data: {
      ...data,
      pacienteId,
    },
  })

  if (turnoId) {
    await prisma.turno.update({
      where: { id: turnoId },
      data: { estado: 'ATENDIDO', consultaId: consulta.id },
    })
    revalidatePath('/agenda')
  }

  revalidatePath(`/pacientes/${pacienteId}`)
  redirect(`/pacientes/${pacienteId}`)
}

export async function obtenerConsulta(id: string) {
  return prisma.consulta.findUnique({ where: { id } })
}

export async function actualizarConsulta(pacienteId: string, id: string, data: {
  motivo: string
  diagnostico?: string
  tratamiento?: string
  peso?: number
  talla?: number
  observaciones?: string
}): Promise<{ error: string } | void> {
  try {
    await prisma.consulta.update({ where: { id }, data })
  } catch (error) {
    return { error: mensajeError(error) }
  }

  revalidatePath(`/pacientes/${pacienteId}`)
  redirect(`/pacientes/${pacienteId}`)
}

export async function eliminarConsulta(pacienteId: string, id: string) {
  await prisma.consulta.delete({ where: { id } })
  revalidatePath(`/pacientes/${pacienteId}`)
}