'use server'

import { mutarConAuditoria, registrarAuditoria } from '@/lib/auditoria'

import { consultaSchema } from '@/lib/validaciones'

import { z } from 'zod'
import { requireRole } from '@/lib/auth'
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
  const user = await requireRole('DOCTORA')
  let consultaId = ''
  try {
data = consultaSchema.parse(data)
  await requirePaciente(pacienteId)
  const creada = await mutarConAuditoria('Consulta', 'ALTA', Object.keys(data), async (tx) => {
    const consulta = await tx.consulta.create({ data: { ...data, pacienteId, autorEmail: user.email } })
    if (turnoId) {
      const turno = await tx.turno.update({ where: { id: turnoId, pacienteId, estado: 'PENDIENTE' }, data: { estado: 'ATENDIDO', consultaId: consulta.id } })
      await registrarAuditoria(tx, user.email!, { entidad: 'Turno', accion: 'ATENCION', entidadId: turno.id, pacienteId, campos: ['estado', 'consultaId'] })
    }
    return consulta
  })
  consultaId = creada.id
  
  } catch (error) { return { error: mensajeError(error) } }
  revalidatePath('/hoy')
  revalidatePath('/agenda')
  revalidatePath('/pacientes')
  revalidatePath(`/pacientes/${pacienteId}`)
  redirect(`/pacientes/${pacienteId}/consultas/${consultaId}/cierre`)
}



export async function actualizarConsulta(pacienteId: string, id: string, data: {
  motivo: string
  diagnostico?: string
  tratamiento?: string
  peso?: number
  talla?: number
  observaciones?: string
}, version = -1, motivoCambio = ''): Promise<{ error: string } | void> {
  const user = await requireRole('DOCTORA')
  await requirePaciente(pacienteId)
  try {
    data = consultaSchema.parse(data)
    const motivo = z.string().trim().min(5, 'Explicá el motivo de la rectificación (al menos 5 caracteres).').parse(motivoCambio)
    z.number().int().nonnegative().parse(version)
    await mutarConAuditoria('Consulta', 'EDICION', Object.keys(data), async tx => {
      const anterior = await tx.consulta.findFirstOrThrow({ where: { id, pacienteId, eliminadoEn: null } })
      if (anterior.version !== version) throw new Error('USUARIO:La consulta cambió desde que la abriste. Recargá para revisar la última versión.')
      const cambio = await tx.consulta.updateMany({ where: { id, pacienteId, eliminadoEn: null, version }, data: {
        motivo: data.motivo, diagnostico: data.diagnostico || null, tratamiento: data.tratamiento || null,
        peso: data.peso ?? null, talla: data.talla ?? null, observaciones: data.observaciones || null,
        version: { increment: 1 },
      } })
      if (cambio.count !== 1) throw new Error('USUARIO:Otra persona modificó la consulta. Recargá antes de guardar.')
      const { motivo: motivoAnterior, diagnostico, tratamiento, peso, talla, observaciones } = anterior
      await tx.consultaRevision.create({ data: { consultaId: id, usuarioEmail: user.email!, motivo, version, snapshot: { motivo: motivoAnterior, diagnostico, tratamiento, peso, talla, observaciones } } })
      return tx.consulta.findUniqueOrThrow({ where: { id } })
    })
  } catch (error) {
    return { error: mensajeError(error) }
  }

  revalidatePath('/hoy')
  revalidatePath('/agenda')
  revalidatePath('/pacientes')
  revalidatePath(`/pacientes/${pacienteId}`)
  redirect(`/pacientes/${pacienteId}`)
}

export async function eliminarConsulta(pacienteId: string, id: string) {
  await requireRole('DOCTORA')
  await requirePaciente(pacienteId)
  await mutarConAuditoria('Consulta', 'BAJA', ['eliminadoEn'], tx => tx.consulta.update({ where: { id, pacienteId, eliminadoEn: null }, data: { eliminadoEn: new Date() } }))
  revalidatePath('/hoy')
  revalidatePath('/agenda')
  revalidatePath('/pacientes')
  revalidatePath(`/pacientes/${pacienteId}`)
}
