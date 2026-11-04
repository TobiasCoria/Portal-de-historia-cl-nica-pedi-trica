'use server'

import { mutarConAuditoria } from '@/lib/auditoria'

import { turnoSchema } from '@/lib/validaciones'

import { requireUser } from '@/lib/auth'
import { requirePaciente } from '@/lib/registros'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { mensajeError } from '@/lib/errores'

export async function crearTurno(pacienteId: string, data: {
  fecha: string
  motivo?: string
  observaciones?: string
}) {
  await requireUser()
  data = turnoSchema.parse(data)
  await requirePaciente(pacienteId)
  await mutarConAuditoria('Turno', 'ALTA', Object.keys(data), tx => tx.turno.create({
    data: {
      pacienteId,
      fecha: new Date(data.fecha),
      motivo: data.motivo || undefined,
      observaciones: data.observaciones || undefined,
    },
  }))

  revalidatePath('/agenda')
  revalidatePath('/pacientes')
  revalidatePath(`/pacientes/${pacienteId}`)
  revalidatePath('/agenda')
  redirect(`/pacientes/${pacienteId}`)
}



export async function actualizarTurno(pacienteId: string, id: string, data: {
  fecha: string
  motivo?: string
  observaciones?: string
}): Promise<{ error: string } | void> {
  await requireUser()
  data = turnoSchema.parse(data)
  await requirePaciente(pacienteId)
  try {
    await mutarConAuditoria('Turno', 'EDICION', Object.keys(data), tx => tx.turno.update({
      where: { id, pacienteId, estado: 'PENDIENTE' },
      data: {
        fecha: new Date(data.fecha),
        motivo: data.motivo || null,
        observaciones: data.observaciones || null,
      },
    }))
  } catch (error) {
    return { error: mensajeError(error) }
  }

  revalidatePath('/agenda')
  revalidatePath('/pacientes')
  revalidatePath(`/pacientes/${pacienteId}`)
  revalidatePath('/agenda')
  redirect(`/pacientes/${pacienteId}`)
}

export async function cancelarTurno(pacienteId: string, id: string) {
  await requireUser()
  await requirePaciente(pacienteId)
  await mutarConAuditoria('Turno', 'CANCELACION', ['estado'], tx => tx.turno.update({ where: { id, pacienteId, estado: 'PENDIENTE' }, data: { estado: 'CANCELADO' } }))
  revalidatePath('/agenda')
  revalidatePath('/pacientes')
  revalidatePath(`/pacientes/${pacienteId}`)
  revalidatePath('/agenda')
}

export async function eliminarTurno(pacienteId: string, id: string) {
  await requireUser()
  await requirePaciente(pacienteId)
  await mutarConAuditoria('Turno', 'CANCELACION', ['estado'], tx => tx.turno.update({ where: { id, pacienteId, estado: 'PENDIENTE' }, data: { estado: 'CANCELADO' } }))
  revalidatePath('/agenda')
  revalidatePath('/pacientes')
  revalidatePath(`/pacientes/${pacienteId}`)
  revalidatePath('/agenda')
}