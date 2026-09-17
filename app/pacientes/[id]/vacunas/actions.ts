'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { mensajeError } from '@/lib/errores'

export async function crearVacuna(pacienteId: string, data: {
  nombre: string
  dosis?: string
  fechaAplicada?: string
  fechaProgramada?: string
  observaciones?: string
}) {
  await prisma.vacunaAplicada.create({
    data: {
      pacienteId,
      nombre: data.nombre,
      dosis: data.dosis || undefined,
      fechaAplicada: data.fechaAplicada ? new Date(data.fechaAplicada) : undefined,
      fechaProgramada: data.fechaProgramada ? new Date(data.fechaProgramada) : undefined,
      observaciones: data.observaciones || undefined,
    },
  })

  revalidatePath(`/pacientes/${pacienteId}`)
}

export async function crearVacunaConProxima(pacienteId: string, data: {
  nombre: string
  dosis?: string
  fechaAplicada: string
  observaciones?: string
  proximaDosis?: string
  proximaFecha?: string
}) {
  await prisma.vacunaAplicada.create({
    data: {
      pacienteId,
      nombre: data.nombre,
      dosis: data.dosis || undefined,
      fechaAplicada: new Date(data.fechaAplicada),
      observaciones: data.observaciones || undefined,
    },
  })

  if (data.proximaFecha) {
    await prisma.vacunaAplicada.create({
      data: {
        pacienteId,
        nombre: data.nombre,
        dosis: data.proximaDosis || undefined,
        fechaProgramada: new Date(data.proximaFecha),
      },
    })
  }

  revalidatePath(`/pacientes/${pacienteId}`)
}

export async function obtenerVacuna(id: string) {
  return prisma.vacunaAplicada.findUnique({ where: { id } })
}

export async function actualizarVacuna(pacienteId: string, id: string, data: {
  nombre: string
  dosis?: string
  fechaAplicada?: string
  fechaProgramada?: string
  observaciones?: string
}): Promise<{ error: string } | void> {
  try {
    await prisma.vacunaAplicada.update({
      where: { id },
      data: {
        nombre: data.nombre,
        dosis: data.dosis || null,
        fechaAplicada: data.fechaAplicada ? new Date(data.fechaAplicada) : null,
        fechaProgramada: data.fechaProgramada ? new Date(data.fechaProgramada) : null,
        observaciones: data.observaciones || null,
      },
    })
  } catch (error) {
    return { error: mensajeError(error) }
  }

  revalidatePath(`/pacientes/${pacienteId}`)
  redirect(`/pacientes/${pacienteId}`)
}

export async function eliminarVacuna(pacienteId: string, id: string) {
  await prisma.vacunaAplicada.delete({ where: { id } })
  revalidatePath(`/pacientes/${pacienteId}`)
}