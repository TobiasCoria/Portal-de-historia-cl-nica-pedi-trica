'use server'

import { mutarConAuditoria } from '@/lib/auditoria'

import { schema, schemaAlta, type PacienteAltaData, type PacienteFormData } from './schema'
import { requireUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { mensajeError } from '@/lib/errores'

export async function listarPacientes(busqueda?: string) {
  await requireUser()
  return prisma.paciente.findMany({
    where: {
      eliminadoEn: null,
      ...(busqueda
        ? {
            OR: [
              { nombre: { contains: busqueda, mode: 'insensitive' } },
              { apellido: { contains: busqueda, mode: 'insensitive' } },
              { dni: { contains: busqueda, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    select: { id: true, nombre: true, apellido: true, dni: true },
    orderBy: { apellido: 'asc' },
  })
}

export async function crearPaciente(data: PacienteAltaData): Promise<{ error: string } | void> {
  const user = await requireUser()
  const validacion = schemaAlta.safeParse(data)
  if (!validacion.success) return { error: validacion.error.issues[0]?.message || 'Revisá los datos del paciente.' }
  const datos = schema.parse(validacion.data)
  try {
    await mutarConAuditoria('Paciente', 'ALTA', [...Object.keys(datos), 'consentimientoAt', 'consentimientoPor'], tx => tx.paciente.create({
      data: {
        ...datos,
        fechaNac: new Date(datos.fechaNac),
        consentimientoAt: new Date(),
        consentimientoPor: user.email,
      },
    }))
  } catch (error) {
    return { error: mensajeError(error) }
  }

  revalidatePath('/pacientes')
  redirect('/pacientes')
}

export async function eliminarPaciente(id: string) {
  await requireUser()
  try {
    await mutarConAuditoria('Paciente', 'BAJA', ['eliminadoEn'], tx => tx.paciente.update({
      where: { id, eliminadoEn: null },
      data: { eliminadoEn: new Date() },
    }))
  } catch (error) {
    console.error(mensajeError(error))
    return
  }

  revalidatePath('/pacientes')
}



export async function actualizarPaciente(id: string, data: PacienteFormData): Promise<{ error: string } | void> {
  await requireUser()
  data = schema.parse(data)
  try {
    await mutarConAuditoria('Paciente', 'EDICION', Object.keys(data), tx => tx.paciente.update({
      where: { id, eliminadoEn: null },
      data: {
        ...data,
        fechaNac: new Date(data.fechaNac),
      },
    }))
  } catch (error) {
    return { error: mensajeError(error) }
  }

  revalidatePath('/pacientes')
  redirect(`/pacientes/${id}`)
}