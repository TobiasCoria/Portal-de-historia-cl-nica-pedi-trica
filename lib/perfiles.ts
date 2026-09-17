'use server'

import { prisma } from '@/lib/prisma'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function obtenerPerfil(email: string) {
  return prisma.perfil.findUnique({ where: { email } })
}

export async function asegurarPerfil(email: string, nombre: string, color: string) {
  return prisma.perfil.upsert({
    where: { email },
    update: {},
    create: { email, nombre, color },
  })
}

export async function subirAvatar(email: string, nombre: string, color: string, formData: FormData) {
  const archivo = formData.get('avatar') as File
  if (!archivo || archivo.size === 0) return

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