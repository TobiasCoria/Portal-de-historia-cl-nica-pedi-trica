'use server'

import { requireUser } from '@/lib/auth'
import { requirePaciente } from '@/lib/registros'
import { mutarConAuditoria } from '@/lib/auditoria'
import { turnoSchema } from '@/lib/validaciones'
import { mensajeError } from '@/lib/errores'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { verificarHorario } from '@/lib/horarios'

type DatosTurno = { fecha: string; motivo?: string; observaciones?: string; duracion?: number }


export async function crearTurno(pacienteId: string, datos: DatosTurno): Promise<{ error: string } | void> {
  await requireUser()
  await requirePaciente(pacienteId)
  try {
    const data = turnoSchema.parse(datos)
    const fecha = new Date(data.fecha + '-03:00')
    const duracion = data.duracion ?? 30
    await mutarConAuditoria('Turno', 'ALTA', Object.keys(data), async tx => {
      await verificarHorario(tx, fecha, duracion)
      return tx.turno.create({ data: { pacienteId, fecha, duracion, motivo: data.motivo, observaciones: data.observaciones } })
    })
  } catch (e) { return { error: mensajeError(e) } }
  revalidatePath('/agenda'); revalidatePath('/hoy'); revalidatePath(`/pacientes/${pacienteId}`)
  redirect(`/pacientes/${pacienteId}?seccion=turnos`)
}

export async function actualizarTurno(pacienteId: string, id: string, datos: DatosTurno): Promise<{ error: string } | void> {
  await requireUser()
  await requirePaciente(pacienteId)
  try {
    const data = turnoSchema.parse(datos)
    const fecha = new Date(data.fecha + '-03:00')
    await mutarConAuditoria('Turno', 'EDICION', Object.keys(data), async tx => {
      const anterior = await tx.turno.findFirstOrThrow({ where: { id, pacienteId, estado: 'PENDIENTE' } })
      const duracion = data.duracion ?? anterior.duracion
      await verificarHorario(tx, fecha, duracion, id)
      return tx.turno.update({ where: { id, pacienteId, estado: 'PENDIENTE' }, data: { fecha, duracion, motivo: data.motivo || null, observaciones: data.observaciones || null } })
    })
  } catch (e) { return { error: mensajeError(e) } }
  revalidatePath('/agenda'); revalidatePath('/hoy'); revalidatePath(`/pacientes/${pacienteId}`)
  redirect(`/pacientes/${pacienteId}?seccion=turnos`)
}

export async function cancelarTurno(pacienteId: string, id: string) {
  await requireUser()
  await requirePaciente(pacienteId)
  await mutarConAuditoria('Turno', 'CANCELACION', ['estado'], tx => tx.turno.update({ where: { id, pacienteId, estado: 'PENDIENTE' }, data: { estado: 'CANCELADO' } }))
  revalidatePath('/agenda'); revalidatePath('/hoy'); revalidatePath(`/pacientes/${pacienteId}`)
}

export async function marcarAusente(pacienteId: string, id: string) {
  await requireUser()
  await requirePaciente(pacienteId)
  await mutarConAuditoria('Turno', 'EDICION', ['estado'], tx => tx.turno.update({ where: { id: z.string().uuid().parse(id), pacienteId, estado: 'PENDIENTE' }, data: { estado: 'AUSENTE' } }))
  revalidatePath('/agenda'); revalidatePath('/hoy'); revalidatePath(`/pacientes/${pacienteId}`)
}
