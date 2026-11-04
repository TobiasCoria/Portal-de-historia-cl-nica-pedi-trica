'use server'
import { requireRole } from '@/lib/auth'
import { mutarConAuditoria } from '@/lib/auditoria'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { mensajeError } from '@/lib/errores'

export async function actualizarProfesional(datos: { nombre: string; matricula: string }) {
  const user = await requireRole('DOCTORA')
  try {
    const data = z.object({ nombre: z.string().trim().min(2, 'Ingresá el nombre profesional.').max(120), matricula: z.string().trim().max(80) }).parse(datos)
    await mutarConAuditoria('Perfil', 'EDICION', ['nombre', 'matricula'], tx => tx.perfil.upsert({
      where: { email: user.email! }, update: { nombre: data.nombre, matricula: data.matricula || null, rol: user.rol },
      create: { email: user.email!, nombre: data.nombre, matricula: data.matricula || null, color: '#3e6fa8', rol: user.rol },
    }))
    revalidatePath('/', 'layout')
    return { ok: true }
  } catch (e) { return { error: mensajeError(e) } }
}
