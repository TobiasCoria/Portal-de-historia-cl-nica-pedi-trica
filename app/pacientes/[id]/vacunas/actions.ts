'use server'

import { vacunaSchema, vacunaConProximaSchema } from '@/lib/validaciones'

import { requireUser } from '@/lib/auth'
import { requirePaciente } from '@/lib/registros'
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
  await requireUser()
  await requirePaciente(pacienteId)
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

  revalidatePath('/agenda')
  revalidatePath('/pacientes')
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
  await requireUser()
  await requirePaciente(pacienteId)
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

  revalidatePath('/agenda')
  revalidatePath('/pacientes')
  revalidatePath(`/pacientes/${pacienteId}`)
}



export async function actualizarVacuna(pacienteId: string, id: string, data: {
  nombre: string
  dosis?: string
  fechaAplicada?: string
  fechaProgramada?: string
  observaciones?: string
}): Promise<{ error: string } | void> {
  await requireUser()
  await requirePaciente(pacienteId)
  try {
    await prisma.vacunaAplicada.update({
      where: { id, pacienteId, eliminadoEn: null },
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

  revalidatePath('/agenda')
  revalidatePath('/pacientes')
  revalidatePath(`/pacientes/${pacienteId}`)
  redirect(`/pacientes/${pacienteId}`)
}

export async function eliminarVacuna(pacienteId: string, id: string) {
  await requireUser()
  await requirePaciente(pacienteId)
  await prisma.vacunaAplicada.update({ where: { id, pacienteId, eliminadoEn: null }, data: { eliminadoEn: new Date() } })
  revalidatePath('/agenda')
  revalidatePath('/pacientes')
  revalidatePath(`/pacientes/${pacienteId}`)
}