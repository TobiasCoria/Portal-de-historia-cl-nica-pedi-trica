'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { ChevronDown, UserRound, Camera } from 'lucide-react'
import Link from '@/app/components/enlace'
import AvatarUploader from './avatar-uploader'
import LogoutButton from './logout-button'

export default function MenuPerfil({ nombre, email, rol, color, avatarUrl }: {
  nombre: string; email: string; rol: 'DOCTORA' | 'SECRETARIA'; color: string; avatarUrl?: string | null
}) {
  const [abierto, setAbierto] = useState(false), contenedor = useRef<HTMLDivElement>(null), disparador = useRef<HTMLButtonElement>(null), id = useId()
  const etiqueta = rol === 'DOCTORA' ? 'Doctora' : 'Secretaria'
  useEffect(() => {
    if (!abierto) return
    function cerrar(e: PointerEvent) { if (e.target instanceof Node && !contenedor.current?.contains(e.target)) setAbierto(false) }
    function teclado(e: KeyboardEvent) { if (e.key === 'Escape') { setAbierto(false); disparador.current?.focus() } }
    document.addEventListener('pointerdown', cerrar); document.addEventListener('keydown', teclado)
    return () => { document.removeEventListener('pointerdown', cerrar); document.removeEventListener('keydown', teclado) }
  }, [abierto])
  return <div className="account-menu" ref={contenedor}>
    <button type="button" ref={disparador} className={`account-trigger ${abierto ? 'account-open' : ''}`} onClick={() => setAbierto(v => !v)} aria-expanded={abierto} aria-controls={id} aria-label={`Mi perfil: ${nombre}, ${etiqueta}`}>
      <span className="account-avatar" style={{ backgroundColor: color }}>{avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt="" />
      ) : nombre.charAt(0)}</span><span className="account-identity"><strong>{nombre}</strong><small>{etiqueta} · Mi perfil</small></span><ChevronDown size={13} className="account-chevron" />
    </button>
    {abierto && <section className="account-panel" id={id} aria-label="Mi perfil">
      <p className="eyebrow">Tu cuenta</p><h2>Mi perfil</h2><strong className="account-panel-name">{nombre}</strong><p className="account-email">{email}</p><span className="badge badge-green mt-3"><UserRound size={10} />{etiqueta}</span>
      <div className="account-photo"><AvatarUploader email={email} nombre={nombre} color={color} avatarUrl={avatarUrl} mostrarTexto /><p><Camera size={12} />La foto se muestra en tu encabezado.</p></div>
      {rol === 'DOCTORA' && <Link href="/configuracion" className="account-settings" onClick={() => setAbierto(false)}>Editar nombre y datos profesionales</Link>}
      <LogoutButton mostrarTexto />
    </section>}
  </div>
}
