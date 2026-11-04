import 'server-only'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth'
export async function obtenerPerfil(email: string) {
  const user = await requireUser()
  if (user.email !== email) throw new Error('Perfil no autorizado.')
  return prisma.perfil.findUnique({ where: { email } })
}
