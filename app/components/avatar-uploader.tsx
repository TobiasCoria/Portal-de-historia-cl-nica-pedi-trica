'use client'

import { useRef, useState } from 'react'
import { subirAvatar } from '@/lib/perfiles'

export default function AvatarUploader({ email, nombre, color, avatarUrl, mostrarTexto = false }: {
  email: string; nombre: string; color: string; avatarUrl?: string | null; mostrarTexto?: boolean
}) {
  const input = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')
  const [subiendo, setSubiendo] = useState(false)
  const [confirmacion, setConfirmacion] = useState(false)
  return <div>
    <button type="button" title="Cambiar foto" aria-label="Cambiar foto de perfil" disabled={subiendo} onClick={() => input.current?.click()}
      className={mostrarTexto ? 'account-photo-button' : 'flex h-9 w-9 items-center justify-center overflow-hidden rounded-full text-sm font-medium text-white'}
      style={mostrarTexto ? undefined : { backgroundColor: color }}>
      <span className={mostrarTexto ? 'account-avatar account-avatar-large' : 'contents'} style={mostrarTexto ? { backgroundColor: color } : undefined}>
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt={nombre} className="h-full w-full object-cover" />
      ) : nombre.charAt(0)}
      </span>
      {mostrarTexto && <span>{subiendo ? 'Actualizando foto…' : 'Cambiar foto de perfil'}<small>JPG o PNG · hasta 10 MB</small></span>}
    </button>
    <input ref={input} type="file" accept="image/jpeg,image/png" className="hidden" onChange={async e => {
      const archivo = e.target.files?.[0]
      if (!archivo) return
      setSubiendo(true)
      setError('')
      setConfirmacion(false)
      try {
        const data = new FormData()
        data.set('avatar', archivo)
        await subirAvatar(email, nombre, color, data)
        setConfirmacion(true)
      } catch { setError('No se pudo cambiar la foto. Volvé a intentar.') }
      finally { setSubiendo(false); if (input.current) input.current.value = '' }
    }} />
    {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
    {confirmacion && <p role="status" className="account-photo-saved">Foto de perfil actualizada.</p>}
  </div>
}
