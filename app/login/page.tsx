'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Brand from '@/app/components/brand'
import { ArrowRight, LockKeyhole } from 'lucide-react'
import { PERFILES } from '@/lib/perfiles-config'


type PerfilConFoto = typeof PERFILES[number] & { avatarUrl?: string | null }

export default function LoginPage() {
  const perfiles: PerfilConFoto[] = [...PERFILES]
  const [seleccionado, setSeleccionado] = useState<PerfilConFoto | null>(null)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!seleccionado || loading) return
    setLoading(true)
    setError('')

    let timeout: ReturnType<typeof setTimeout> | undefined
    try {
      const supabase = createClient()
      const { error } = await Promise.race([
        supabase.auth.signInWithPassword({ email: seleccionado.email, password }),
        new Promise<never>((_, reject) => {
          timeout = setTimeout(() => reject(new Error('TIEMPO_AGOTADO')), 20000)
        }),
      ])
      if (error) {
        setError(error.code === 'invalid_credentials'
          ? 'El email o la contraseña no coinciden.'
          : error.code === 'email_not_confirmed'
          ? 'Todavía falta confirmar el email de esta cuenta.'
          : 'No se pudo iniciar sesión. Volvé a intentar en unos minutos.')
        return
      }
      // El login solo autentica. No depende de escrituras de perfil o auditoría.
      router.push('/hoy')
      router.refresh()
    } catch (error) {
      setError(error instanceof Error && error.message === 'TIEMPO_AGOTADO'
        ? 'La conexión está tardando demasiado. Recargá la página y volvé a intentar.'
        : 'No se pudo conectar para iniciar sesión. Revisá tu conexión y volvé a intentar.')
    } finally {
      if (timeout) clearTimeout(timeout)
      setLoading(false)
    }
  }


  return <div className="login-layout">
    <section className="login-story"><Brand /><div className="story-copy"><p className="eyebrow" style={{ color: '#99b9b1' }}>Cada etapa merece cuidado</p><h1>Un lugar para cuidar.<br />Una historia para acompañar.</h1><p>La información que necesitás, en un espacio pensado para el ritmo de tu consultorio.</p></div><div className="login-footer">PORTAL PEDIATRÍA · HISTORIAS QUE CRECEN</div></section>
    <section className="login-form-area"><div className="login-form-inner"><p className="eyebrow">Te damos la bienvenida</p><h2>{seleccionado ? 'Ingresá a tu espacio' : '¿Quién ingresa hoy?'}</h2><p className="page-description">{seleccionado ? 'Usá la contraseña de tu cuenta para continuar.' : 'Elegí tu perfil para comenzar la jornada.'}</p>
      {!seleccionado ? <div className="profile-choices">{perfiles.map(p => <button className="profile-choice" key={p.email} onClick={() => setSeleccionado(p)}><span className={'initial-avatar ' + (p.rol === 'DOCTORA' ? 'blue' : 'pink')}>{p.nombre.charAt(0)}</span><strong>{p.nombre}</strong><ArrowRight size={14} className="text-[#8eaaa0]" /></button>)}</div> :
      <form onSubmit={handleLogin} className="space-y-5"><div className="flex items-center justify-between rounded-xl border border-[#e0e6de] bg-white p-4"><div className="flex items-center gap-3"><span className="initial-avatar blue">{seleccionado.nombre.charAt(0)}</span><div><strong className="text-xs">{seleccionado.nombre}</strong><p className="text-[10px] text-[#8b9b94]">{seleccionado.email}</p></div></div><button type="button" disabled={loading} className="btn-link" onClick={() => { setSeleccionado(null); setPassword(''); setError('') }}>Cambiar</button></div>
        <div><label htmlFor="clave" className="mb-2 block text-xs">Contraseña</label><input id="clave" autoComplete="current-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required autoFocus className="input" /></div>
        {error && <p role="alert" className="form-error">{error}</p>}
        <button type="submit" disabled={loading} className="btn btn-primary w-full">{loading ? 'Ingresando…' : 'Ingresar al consultorio'}<ArrowRight size={15} /></button><Link href="/recuperar-clave" className="btn-link justify-center w-full">Olvidé mi contraseña</Link>
      </form>}
      <p className="login-caption"><LockKeyhole size={12} className="mb-2" />Acceso exclusivo para el equipo del consultorio.<br />Cuidamos la privacidad de cada historia.</p>
    </div></section>
  </div>
}
