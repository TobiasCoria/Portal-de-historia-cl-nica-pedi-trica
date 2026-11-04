'use server'

import { requireUser } from '@/lib/auth'
import { PERFILES } from '@/lib/perfiles-config'
import { prisma } from '@/lib/prisma'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'



export async function asegurarPerfil(email: string, nombre: string, color: string) {
  const user = await requireUser()
  if (email !== user.email) throw new Error('No tenés permiso para modificar este perfil.')
  const perfil = PERFILES.find(p => p.email === user.email)
  if (!perfil) throw new Error('Perfil no autorizado.')
  nombre = perfil.nombre
  color = perfil.color
  return prisma.perfil.upsert({
    where: { email },
    update: {},
    create: { email, nombre, color },
  })
}

export async function subirAvatar(email: string, nombre: string, color: string, formData: FormData) {
  const user = await requireUser()
  if (email !== user.email) throw new Error('No tenés permiso para modificar este perfil.')
  const perfil = PERFILES.find(p => p.email === user.email)
  if (!perfil) throw new Error('Perfil no autorizado.')
  nombre = perfil.nombre
  color = perfil.color
  const archivo = formData.get('avatar') as File
  if (!(archivo instanceof File) || archivo.size === 0 || archivo.size > 10 * 1024 * 1024 || !['image/jpeg', 'image/png'].includes(archivo.type)) throw new Error('Elegí un JPG o PNG de hasta 10 MB.')

  const supabase = createAdminClient()
  const path = `${email}-${Date.now()}.${archivo.name.split('.').pop()}`

  const { error } = await supabase.storage.from('avatares').upload(path, archivo, { upsert: true })
  if (error) throw new Error('No se pudo subir la imagen: ' + error.message)

  const { data } = supabase.storage.from('avatares').getPublicUrl(path)

  await prisma.perfil.upsert({
    where: { email },
    update: { avatarUrl: data.publicUrl },
    create: { email, nombre, color, avatarUrl: data.publicUrl },
  })

  revalidatePath('/', 'layout')
}