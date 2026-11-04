import 'server-only'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PERFILES } from '@/lib/perfiles-config'
import { notFound } from 'next/navigation'

export async function requireUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user?.email) redirect('/login')
  return user
}

export function esDoctora(email: string) {
  return PERFILES.some(p => p.email === email && p.rol === 'DOCTORA')
}

export async function requireDoctora() {
  const user = await requireUser()
  if (!esDoctora(user.email!)) notFound()
  return user
}
