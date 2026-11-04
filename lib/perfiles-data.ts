import 'server-only'
import { cache } from 'react'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth'
export const obtenerPerfil = cache(async (email: string) => {
  const user = await requireUser()
  if (user.email !== email) throw new Error('Perfil no autorizado.')
  return prisma.perfil.findUnique({ where: { email } })
})
