'use server'
import { requireRole } from '@/lib/auth'
import { mutarConAuditoria } from '@/lib/auditoria'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { mensajeError } from '@/lib/errores'

export async function registrarConsentimiento(pacienteId: string, confirmacion: boolean) {
  const user = await requireRole('DOCTORA')
  try {
    z.string().uuid().parse(pacienteId)
    z.literal(true, { errorMap: () => ({ message: 'Confirmá el consentimiento para continuar.' }) }).parse(confirmacion)
    await mutarConAuditoria('Paciente', 'CONSENTIMIENTO', ['consentimientoAt', 'consentimientoPor'], async tx => {
      const p = await tx.paciente.findFirstOrThrow({ where: { id: pacienteId, eliminadoEn: null }, select: { tutorNombre: true, tutorDni: true, tutorVinculo: true, consentimientoAt: true } })
      if (p.consentimientoAt) throw new Error('USUARIO:El consentimiento ya está registrado. No se reemplazó la evidencia original.')
      if (!p.tutorNombre || !p.tutorDni || !p.tutorVinculo) throw new Error('USUARIO:Completá primero el nombre, DNI y vínculo del tutor en Editar datos.')
      return tx.paciente.update({ where: { id: pacienteId, eliminadoEn: null, consentimientoAt: null }, data: { consentimientoAt: new Date(), consentimientoPor: user.email } })
    })
    revalidatePath(`/pacientes/${pacienteId}`)
    return { ok: true }
  } catch (e) { return { error: mensajeError(e) } }
}
