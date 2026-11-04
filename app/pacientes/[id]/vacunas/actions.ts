'use server'

import { mutarConAuditoria, registrarAuditoria } from '@/lib/auditoria'

import { vacunaSchema, vacunaConProximaSchema } from '@/lib/validaciones'

import { requireRole } from '@/lib/auth'
import { requirePaciente } from '@/lib/registros'
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
  await requireRole('DOCTORA')
  try {
data = vacunaSchema.parse(data)
  await requirePaciente(pacienteId)
  await mutarConAuditoria('VacunaAplicada', 'ALTA', Object.keys(data), tx => tx.vacunaAplicada.create({
    data: {
      pacienteId,
      nombre: data.nombre,
      dosis: data.dosis || undefined,
      fechaAplicada: data.fechaAplicada ? new Date(data.fechaAplicada) : undefined,
      fechaProgramada: data.fechaProgramada ? new Date(data.fechaProgramada) : undefined,
      observaciones: data.observaciones || undefined,
    },
  }))

  
  } catch (error) { return { error: mensajeError(error) } }
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
  await requireRole('DOCTORA')
  try {
data = vacunaConProximaSchema.parse(data)
  await requirePaciente(pacienteId)
  const user = await requireRole('DOCTORA')
  await mutarConAuditoria('VacunaAplicada', 'ALTA', ['nombre', 'dosis', 'fechaAplicada', 'observaciones'], async tx => {
    const aplicada = await tx.vacunaAplicada.create({ data: {
      pacienteId, nombre: data.nombre, dosis: data.dosis || undefined,
      fechaAplicada: new Date(data.fechaAplicada), observaciones: data.observaciones || undefined,
    } })
    if (data.proximaFecha) {
      const proxima = await tx.vacunaAplicada.create({ data: {
        pacienteId, nombre: data.nombre, dosis: data.proximaDosis || undefined,
        fechaProgramada: new Date(data.proximaFecha),
      } })
      await registrarAuditoria(tx, user.email!, { entidad: 'VacunaAplicada', accion: 'ALTA', entidadId: proxima.id, pacienteId, campos: ['nombre', 'dosis', 'fechaProgramada'] })
    }
    return aplicada
  })

  
  } catch (error) { return { error: mensajeError(error) } }
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
  await requireRole('DOCTORA')
  data = vacunaSchema.parse(data)
  await requirePaciente(pacienteId)
  try {
    await mutarConAuditoria('VacunaAplicada', 'EDICION', Object.keys(data), tx => tx.vacunaAplicada.update({
      where: { id, pacienteId, eliminadoEn: null },
      data: {
        nombre: data.nombre,
        dosis: data.dosis || null,
        fechaAplicada: data.fechaAplicada ? new Date(data.fechaAplicada) : null,
        fechaProgramada: data.fechaProgramada ? new Date(data.fechaProgramada) : null,
        observaciones: data.observaciones || null,
      },
    }))
  } catch (error) {
    return { error: mensajeError(error) }
  }

  revalidatePath('/agenda')
  revalidatePath('/pacientes')
  revalidatePath(`/pacientes/${pacienteId}`)
  redirect(`/pacientes/${pacienteId}`)
}

export async function eliminarVacuna(pacienteId: string, id: string) {
  await requireRole('DOCTORA')
  await requirePaciente(pacienteId)
  await mutarConAuditoria('VacunaAplicada', 'BAJA', ['eliminadoEn'], tx => tx.vacunaAplicada.update({ where: { id, pacienteId, eliminadoEn: null }, data: { eliminadoEn: new Date() } }))
  revalidatePath('/agenda')
  revalidatePath('/pacientes')
  revalidatePath(`/pacientes/${pacienteId}`)
}