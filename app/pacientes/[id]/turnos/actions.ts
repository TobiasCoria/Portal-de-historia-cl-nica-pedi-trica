'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { mensajeError } from '@/lib/errores'

export async function crearTurno(pacienteId: string, data: {
  fecha: string
  motivo?: string
  observaciones?: string
}) {
  await prisma.turno.create({
    data: {
      pacienteId,
      fecha: new Date(data.fecha),
      motivo: data.motivo || undefined,
      observaciones: data.observaciones || undefined,
    },
  })

  revalidatePath(`/pacientes/${pacienteId}`)
  revalidatePath('/agenda')
  redirect(`/pacientes/${pacienteId}`)
}

export async function obtenerTurno(id: string) {
  return prisma.turno.findUnique({ where: { id } })
}

export async function actualizarTurno(pacienteId: string, id: string, data: {
  fecha: string
  motivo?: string
  observaciones?: string
}): Promise<{ error: string } | void> {
  try {
    await prisma.turno.update({
      where: { id },
      data: {
        fecha: new Date(data.fecha),
        motivo: data.motivo || null,
        observaciones: data.observaciones || null,
      },
    })
  } catch (error) {
    return { error: mensajeError(error) }
  }

  revalidatePath(`/pacientes/${pacienteId}`)
  revalidatePath('/agenda')
  redirect(`/pacientes/${pacienteId}`)
}

export async function cancelarTurno(pacienteId: string, id: string) {
  await prisma.turno.update({ where: { id }, data: { estado: 'CANCELADO' } })
  revalidatePath(`/pacientes/${pacienteId}`)
  revalidatePath('/agenda')
}

export async function eliminarTurno(pacienteId: string, id: string) {
  await prisma.turno.delete({ where: { id } })
  revalidatePath(`/pacientes/${pacienteId}`)
  revalidatePath('/agenda')
}