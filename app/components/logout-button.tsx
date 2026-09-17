'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function LogoutButton() {
  const router = useRouter()

  async function cerrarSesion() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button onClick={cerrarSesion} className="flex items-center gap-1.5 text-sm font-medium text-[#5b6b64] hover:text-[#c4433a]">
      <LogOut size={16} />
      Salir
    </button>
  )
}