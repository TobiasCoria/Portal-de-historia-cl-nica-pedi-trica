'use client'

import { useRef, useState } from 'react'
import { subirAvatar } from '@/lib/perfiles'

export default function AvatarUploader({ email, nombre, color, avatarUrl }: {
  email: string; nombre: string; color: string; avatarUrl?: string | null
}) {
  const input = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')
  const [subiendo, setSubiendo] = useState(false)
  return <div>
    <button type="button" title="Cambiar foto" aria-label="Cambiar foto de perfil" disabled={subiendo} onClick={() => input.current?.click()}
      className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full text-sm font-medium text-white"
      style={{ backgroundColor: color }}>
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt={nombre} className="h-full w-full object-cover" />
      ) : nombre.charAt(0)}
    </button>
    <input ref={input} type="file" accept="image/jpeg,image/png" className="hidden" onChange={async e => {
      const archivo = e.target.files?.[0]
      if (!archivo) return
      setSubiendo(true)
      setError('')
      try {
        const data = new FormData()
        data.set('avatar', archivo)
        await subirAvatar(email, nombre, color, data)
      } catch { setError('No se pudo cambiar la foto. Volvé a intentar.') }
      finally { setSubiendo(false); if (input.current) input.current.value = '' }
    }} />
    {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
  </div>
}
