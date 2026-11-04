import 'server-only'
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PERFILES } from '@/lib/perfiles-config'
import { notFound } from 'next/navigation'

// React cache deduplica dentro del render actual, nunca entre personas o requests.
export const requireUser = cache(async () => {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user?.email) redirect('/login')
  const perfil = PERFILES.find(p => p.email.toLowerCase() === user.email!.toLowerCase())
  if (!perfil) notFound()
  return { ...user, rol: perfil.rol, nombre: perfil.nombre }
})

export function esDoctora(email: string) {
  return PERFILES.some(p => p.email === email && p.rol === 'DOCTORA')
}

export async function requireDoctora() {
  return requireRole('DOCTORA')
}

export async function requireRole(...roles: ('DOCTORA' | 'SECRETARIA')[]) {
  const user = await requireUser()
  if (!roles.includes(user.rol)) notFound()
  return user
}
