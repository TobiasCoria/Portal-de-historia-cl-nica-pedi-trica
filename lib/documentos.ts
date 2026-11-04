'use server'

import { mutarConAuditoria, registrarAuditoria } from '@/lib/auditoria'

import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { requirePaciente } from '@/lib/registros'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

export async function subirDocumento(formData: FormData) {
  await requireRole('DOCTORA')
  const pacienteId = z.string().uuid().parse(formData.get('pacienteId'))
  const consultaId = z.string().uuid().nullable().parse(formData.get('consultaId'))
  await requirePaciente(pacienteId)
  if (consultaId) await prisma.consulta.findFirstOrThrow({ where: { id: consultaId, pacienteId, eliminadoEn: null } })
  const archivo = formData.get('archivo')
  if (!(archivo instanceof File) || archivo.size === 0 || archivo.size > 10 * 1024 * 1024 ||
      !['application/pdf', 'image/jpeg', 'image/png'].includes(archivo.type)) {
    throw new Error('Elegí un PDF, JPG o PNG de hasta 10 MB.')
  }
  const extension = { 'application/pdf': 'pdf', 'image/jpeg': 'jpg', 'image/png': 'png' }[archivo.type]
  const path = `${pacienteId}/${crypto.randomUUID()}.${extension}`
  const supabase = createAdminClient()
  const { error } = await supabase.storage.from('documentos').upload(path, archivo)
  if (error) throw new Error('No se pudo subir el documento. Volvé a intentar.')
  await mutarConAuditoria('Documento', 'SUBIDA', ['pacienteId', 'consultaId', 'nombre', 'url', 'tipo'], tx => tx.documento.create({ data: {
    pacienteId, consultaId, nombre: archivo.name, url: path, tipo: archivo.type,
  } }))
  revalidatePath(`/pacientes/${pacienteId}`)
  revalidatePath('/pacientes/[id]/consultas/[consultaId]/cierre', 'page')
}

export async function obtenerUrlDocumento(id: string) {
  const user = await requireRole('DOCTORA')
  const documento = await prisma.documento.findFirstOrThrow({ where: {
    id: z.string().uuid().parse(id), eliminadoEn: null, paciente: { eliminadoEn: null },
    OR: [{ consultaId: null }, { consulta: { eliminadoEn: null } }],
  } })
  const supabase = createAdminClient()
  const { data, error } = await supabase.storage.from('documentos').createSignedUrl(documento.url, 60 * 5)
  if (error) throw new Error('No se pudo abrir el documento.')
  await registrarAuditoria(prisma, user.email!, { entidad: 'Documento', accion: 'APERTURA', entidadId: documento.id, pacienteId: documento.pacienteId, campos: [] })
  return data?.signedUrl
}

export async function eliminarDocumento(pacienteId: string, id: string) {
  await requireRole('DOCTORA')
  await requirePaciente(pacienteId)
  await mutarConAuditoria('Documento', 'BAJA', ['eliminadoEn'], tx => tx.documento.update({
    where: { id, pacienteId, eliminadoEn: null, OR: [{ consultaId: null }, { consulta: { eliminadoEn: null } }] },
    data: { eliminadoEn: new Date() },
  }))
  revalidatePath(`/pacientes/${pacienteId}`)
  revalidatePath('/pacientes/[id]/consultas/[consultaId]/cierre', 'page')
}
