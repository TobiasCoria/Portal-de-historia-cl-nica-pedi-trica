'use server'

import { prisma } from '@/lib/prisma'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function subirDocumento(formData: FormData) {
  const pacienteId = formData.get('pacienteId') as string
  const consultaId = formData.get('consultaId') as string | null
  const archivo = formData.get('archivo') as File

  if (!archivo || archivo.size === 0) return

  const supabase = createAdminClient()
  const extension = archivo.name.split('.').pop()
  const path = `${pacienteId}/${Date.now()}-${archivo.name}`

  const { error } = await supabase.storage
    .from('documentos')
    .upload(path, archivo)

  if (error) throw new Error('Error al subir el archivo: ' + error.message)

  await prisma.documento.create({
    data: {
      pacienteId,
      consultaId: consultaId || undefined,
      nombre: archivo.name,
      url: path,
      tipo: archivo.type,
    },
  })

  revalidatePath(`/pacientes/${pacienteId}`)
}

export async function obtenerUrlDocumento(path: string) {
  const supabase = createAdminClient()
  const { data } = await supabase.storage
    .from('documentos')
    .createSignedUrl(path, 60 * 5) // el link expira en 5 minutos, por seguridad

  return data?.signedUrl
}

export async function eliminarDocumento(pacienteId: string, id: string, path: string) {
  const supabase = createAdminClient()
  await supabase.storage.from('documentos').remove([path])
  await prisma.documento.delete({ where: { id } })
  revalidatePath(`/pacientes/${pacienteId}`)
}