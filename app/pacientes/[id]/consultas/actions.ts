'use server'

import { consultaSchema } from '@/lib/validaciones'

import { requireUser } from '@/lib/auth'
import { requirePaciente } from '@/lib/registros'
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
  await requireUser()
  await requirePaciente(pacienteId)
  await prisma.$transaction(async (tx) => {
    const consulta = await tx.consulta.create({ data: { ...data, pacienteId } })
    if (turnoId) {
      await tx.turno.update({ where: { id: turnoId, pacienteId, estado: 'PENDIENTE' }, data: { estado: 'ATENDIDO', consultaId: consulta.id } })
    }
  })

  revalidatePath('/agenda')
  revalidatePath('/pacientes')
  revalidatePath(`/pacientes/${pacienteId}`)
  redirect(`/pacientes/${pacienteId}`)
}



export async function actualizarConsulta(pacienteId: string, id: string, data: {
  motivo: string
  diagnostico?: string
  tratamiento?: string
  peso?: number
  talla?: number
  observaciones?: string
}): Promise<{ error: string } | void> {
  await requireUser()
  await requirePaciente(pacienteId)
  try {
    await prisma.consulta.update({ where: { id, pacienteId, eliminadoEn: null }, data })
  } catch (error) {
    return { error: mensajeError(error) }
  }

  revalidatePath('/agenda')
  revalidatePath('/pacientes')
  revalidatePath(`/pacientes/${pacienteId}`)
  redirect(`/pacientes/${pacienteId}`)
}

export async function eliminarConsulta(pacienteId: string, id: string) {
  await requireUser()
  await requirePaciente(pacienteId)
  await prisma.consulta.update({ where: { id, pacienteId, eliminadoEn: null }, data: { eliminadoEn: new Date() } })
  revalidatePath('/agenda')
  revalidatePath('/pacientes')
  revalidatePath(`/pacientes/${pacienteId}`)
}