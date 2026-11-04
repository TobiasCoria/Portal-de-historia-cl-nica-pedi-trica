'use server'

import { mutarConAuditoria, registrarAuditoria } from '@/lib/auditoria'

import { consultaSchema } from '@/lib/validaciones'

import { requireUser } from '@/lib/auth'
import { requirePaciente } from '@/lib/registros'
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
  const user = await requireUser()
  data = consultaSchema.parse(data)
  await requirePaciente(pacienteId)
  await mutarConAuditoria('Consulta', 'ALTA', Object.keys(data), async (tx) => {
    const consulta = await tx.consulta.create({ data: { ...data, pacienteId } })
    if (turnoId) {
      const turno = await tx.turno.update({ where: { id: turnoId, pacienteId, estado: 'PENDIENTE' }, data: { estado: 'ATENDIDO', consultaId: consulta.id } })
      await registrarAuditoria(tx, user.email!, { entidad: 'Turno', accion: 'ATENCION', entidadId: turno.id, pacienteId, campos: ['estado', 'consultaId'] })
    }
    return consulta
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
  data = consultaSchema.parse(data)
  await requirePaciente(pacienteId)
  try {
    await mutarConAuditoria('Consulta', 'EDICION', Object.keys(data), tx => tx.consulta.update({ where: { id, pacienteId, eliminadoEn: null }, data }))
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
  await mutarConAuditoria('Consulta', 'BAJA', ['eliminadoEn'], tx => tx.consulta.update({ where: { id, pacienteId, eliminadoEn: null }, data: { eliminadoEn: new Date() } }))
  revalidatePath('/agenda')
  revalidatePath('/pacientes')
  revalidatePath(`/pacientes/${pacienteId}`)
}