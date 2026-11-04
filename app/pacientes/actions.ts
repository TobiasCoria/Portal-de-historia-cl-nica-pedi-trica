'use server'

import { schema } from './schema'
import { requireUser } from '@/lib/auth'
import { requirePaciente } from '@/lib/registros'
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

export async function crearPaciente(data: {
  nombre: string
  apellido: string
  dni: string
  fechaNac: string
  sexo?: 'MASCULINO' | 'FEMENINO'
  tutorNombre?: string
  tutorDni?: string
  telefono?: string
  email?: string
  direccion?: string
  contactoEmergencia?: string
  antecedentesFamiliares?: string
  alergias?: string
  pesoNacer?: number
  tallaNacer?: number
  grupoSanguineo?: string
  observaciones?: string
  obraSocial?: string
  numeroAfiliado?: string
  plan?: string
  particular?: boolean
}): Promise<{ error: string } | void> {
  await requireUser()
  data = schema.parse(data)
  try {
    await prisma.paciente.create({
      data: {
        ...data,
        fechaNac: new Date(data.fechaNac),
      },
    })
  } catch (error) {
    return { error: mensajeError(error) }
  }

  revalidatePath('/pacientes')
  redirect('/pacientes')
}

export async function eliminarPaciente(id: string) {
  await requireUser()
  try {
    await prisma.paciente.update({
      where: { id, eliminadoEn: null },
      data: { eliminadoEn: new Date() },
    })
  } catch (error) {
    console.error(mensajeError(error))
    return
  }

  revalidatePath('/pacientes')
}



export async function actualizarPaciente(id: string, data: {
  nombre: string
  apellido: string
  dni: string
  fechaNac: string
  sexo?: 'MASCULINO' | 'FEMENINO'
  tutorNombre?: string
  tutorDni?: string
  telefono?: string
  email?: string
  direccion?: string
  contactoEmergencia?: string
  antecedentesFamiliares?: string
  alergias?: string
  pesoNacer?: number
  tallaNacer?: number
  grupoSanguineo?: string
  observaciones?: string
  obraSocial?: string
  numeroAfiliado?: string
  plan?: string
  particular?: boolean
}): Promise<{ error: string } | void> {
  await requireUser()
  data = schema.parse(data)
  try {
    await prisma.paciente.update({
      where: { id, eliminadoEn: null },
      data: {
        ...data,
        fechaNac: new Date(data.fechaNac),
      },
    })
  } catch (error) {
    return { error: mensajeError(error) }
  }

  revalidatePath('/pacientes')
  redirect(`/pacientes/${id}`)
}