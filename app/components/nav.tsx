import Link from 'next/link'
import { Users, CalendarClock } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { obtenerPerfil } from '@/lib/perfiles'
import LogoutButton from './logout-button'

export default async function Nav() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const perfil = user?.email ? await obtenerPerfil(user.email) : null

  const nombre = perfil?.nombre || user?.email?.split('@')[0] || 'Usuario'
  const color = perfil?.color || '#3e6fa8'
  const avatarUrl = perfil?.avatarUrl

  return (
    <div className="mb-8 flex items-center justify-between border-b border-[#e3e7e2] pb-4">
      <div className="flex items-center gap-3">
        <div
          className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full text-sm font-medium text-white"
          style={{ backgroundColor: color }}
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt={nombre} className="h-full w-full object-cover" />
          ) : (
            nombre.charAt(0)
          )}
        </div>
        <div>
          <p className="text-sm font-medium leading-tight text-[#1c2521]">{nombre}</p>
          <p className="font-serif text-xs leading-tight text-[#5b6b64]">Portal Pediatría</p>
        </div>
      </div>

      <nav className="flex items-center gap-6 text-sm">
        <Link href="/pacientes" className="flex items-center gap-1.5 font-medium text-[#1c2521] hover:text-[#3e6fa8]">
          <Users size={16} />
          Pacientes
        </Link>
        <Link href="/agenda" className="flex items-center gap-1.5 font-medium text-[#1c2521] hover:text-[#3e6fa8]">
          <CalendarClock size={16} />
          Agenda
        </Link>
        <LogoutButton />
      </nav>
    </div>
  )
} 