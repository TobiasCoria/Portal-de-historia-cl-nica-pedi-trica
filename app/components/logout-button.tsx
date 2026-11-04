'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function LogoutButton({ mostrarTexto = false }: { mostrarTexto?: boolean }) {
  const router = useRouter()

  async function cerrarSesion() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button onClick={cerrarSesion} aria-label="Cerrar sesión" title="Cerrar sesión" className={mostrarTexto ? 'account-logout' : 'text-[#9db6ba] hover:text-white'}>
      <LogOut size={16} />
      <span className={mostrarTexto ? '' : 'screen-reader'}>Cerrar sesión</span>
    </button>
  )
}
