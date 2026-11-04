'use server'
import { requireRole } from '@/lib/auth'
import { mutarConAuditoria } from '@/lib/auditoria'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

export async function restaurarRegistro(tipo: string, id: string) {
  await requireRole('DOCTORA')
  const entidad = z.enum(['Paciente', 'Consulta', 'VacunaAplicada', 'Documento']).parse(tipo)
  z.string().uuid().parse(id)
  await mutarConAuditoria<{ id: string; pacienteId?: string }>(entidad, 'RESTAURACION', ['eliminadoEn'], tx => {
    if (entidad === 'Paciente') return tx.paciente.update({ where: { id, eliminadoEn: { not: null } }, data: { eliminadoEn: null } })
    if (entidad === 'Consulta') return tx.consulta.update({ where: { id, eliminadoEn: { not: null }, paciente: { eliminadoEn: null } }, data: { eliminadoEn: null } })
    if (entidad === 'VacunaAplicada') return tx.vacunaAplicada.update({ where: { id, eliminadoEn: { not: null }, paciente: { eliminadoEn: null } }, data: { eliminadoEn: null } })
    return tx.documento.update({ where: { id, eliminadoEn: { not: null }, paciente: { eliminadoEn: null }, OR: [{ consultaId: null }, { consulta: { eliminadoEn: null } }] }, data: { eliminadoEn: null } })
  })
  revalidatePath('/archivo'); revalidatePath('/pacientes'); revalidatePath('/hoy'); revalidatePath('/agenda'); revalidatePath('/pacientes/[id]', 'page')
}
