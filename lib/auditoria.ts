import 'server-only'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth'

type Entidad = 'Paciente' | 'Consulta' | 'VacunaAplicada' | 'Turno' | 'Documento' | 'Perfil'
type Accion = 'ALTA' | 'EDICION' | 'BAJA' | 'CANCELACION' | 'SUBIDA' | 'APERTURA' | 'ATENCION'
type Evento = { accion: Accion; entidad: Entidad; entidadId: string; pacienteId?: string; campos: string[] }

// El llamador entrega nombres de campos validados, nunca valores del formulario.
export async function registrarAuditoria(tx: Prisma.TransactionClient, usuarioEmail: string, evento: Evento) {
  await tx.logAuditoria.create({ data: {
    usuarioEmail, accion: evento.accion, entidad: evento.entidad, entidadId: evento.entidadId,
    pacienteId: evento.pacienteId,
    detalle: JSON.stringify({ campos: evento.campos }),
  } })
}

export async function mutarConAuditoria<T extends { id: string; pacienteId?: string }>(
  entidad: Entidad, accion: Accion, campos: string[], mutacion: (tx: Prisma.TransactionClient) => Promise<T>,
) {
  const user = await requireUser()
  return prisma.$transaction(async tx => {
    const registro = await mutacion(tx)
    await registrarAuditoria(tx, user.email!, {
      entidad, accion, entidadId: registro.id,
      pacienteId: entidad === 'Paciente' ? registro.id : registro.pacienteId, campos,
    })
    return registro
  })
}
