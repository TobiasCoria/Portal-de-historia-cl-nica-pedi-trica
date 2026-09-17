'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { mensajeError } from '@/lib/errores'

export async function listarPacientes(busqueda?: string) {
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
  try {
    await prisma.paciente.update({
      where: { id },
      data: { eliminadoEn: new Date() },
    })
  } catch (error) {
    console.error(mensajeError(error))
    return
  }

  revalidatePath('/pacientes')
}

export async function obtenerPaciente(id: string) {
  return prisma.paciente.findUnique({ where: { id } })
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
  try {
    await prisma.paciente.update({
      where: { id },
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