'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from '@/app/components/enlace'
import Brand from '@/app/components/brand'
import { ArrowRight, LockKeyhole, CalendarDays, ClipboardList, HeartPulse, Eye, EyeOff, LoaderCircle } from 'lucide-react'
import { PERFILES } from '@/lib/perfiles-config'


type PerfilConFoto = typeof PERFILES[number] & { avatarUrl?: string | null }

export default function LoginPage() {
  const perfiles: PerfilConFoto[] = [...PERFILES]
  const [seleccionado, setSeleccionado] = useState<PerfilConFoto | null>(null)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mostrarClave, setMostrarClave] = useState(false)
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


  return <div className="acceso-layout">
    <aside className="acceso-sidebar"><Brand /><div className="acceso-mensaje"><span className="acceso-brote"><HeartPulse size={24} strokeWidth={1.3} /></span><p className="eyebrow">Cada etapa merece cuidado</p><h2>Pequeños pasos.<br />Grandes historias.</h2><p>Un espacio para acompañar cada encuentro y seguir creciendo juntos.</p></div><p className="acceso-firma">PORTAL PEDIATRÍA<br /><span>Historias que crecen</span></p></aside>
    <main className="acceso-main"><header className="acceso-topbar"><span>Tu consultorio, en orden.</span><span className="badge badge-muted"><LockKeyhole size={12} />Acceso del equipo</span></header>
      <div className="acceso-contenido"><div className="acceso-bienvenida"><p className="eyebrow">Te damos la bienvenida</p><h1>Todo listo para <br />un nuevo encuentro.</h1><p className="page-description">Tu agenda, tus pacientes y cada historia. <br />El mismo cuidado, en un solo lugar.</p><div className="acceso-recorrido"><div><span><CalendarDays size={19} strokeWidth={1.5} /></span><p><strong>Tu jornada, organizada</strong>El próximo encuentro, siempre a mano.</p></div><div><span><ClipboardList size={19} strokeWidth={1.5} /></span><p><strong>Historias que acompañan</strong>La información de cada paciente, en su lugar.</p></div></div></div>
      <section className="card acceso-card login-form-inner" aria-labelledby="titulo-ingreso"><div className="acceso-card-heading"><span className="acceso-numero">{seleccionado ? '02' : '01'}</span><span className="eyebrow">{seleccionado ? 'Ingresá a tu cuenta' : 'Elegí tu espacio'}</span></div><h2 id="titulo-ingreso">{seleccionado ? 'Hola, ' + seleccionado.nombre : '¿Quién ingresa hoy?'}</h2><p className="acceso-ayuda">{seleccionado ? 'Ingresá tu contraseña para continuar la jornada.' : 'Seleccioná el perfil con el que vas a trabajar.'}</p>
      {!seleccionado ? <div className="profile-choices acceso-perfiles">{perfiles.map(p => <button type="button" className="profile-choice acceso-perfil" key={p.email} onClick={() => { setSeleccionado(p); setMostrarClave(false) }}><span className={'initial-avatar ' + (p.rol === 'DOCTORA' ? 'blue' : 'pink')}>{p.nombre.charAt(0)}</span><span className="acceso-perfil-texto"><strong>{p.nombre}</strong><small>{p.rol === 'DOCTORA' ? 'Atención e historias clínicas' : 'Agenda y gestión del consultorio'}</small></span><ArrowRight size={16} className="acceso-flecha" /></button>)}</div> :
      <form aria-busy={loading} onSubmit={handleLogin} className="space-y-5"><div className="acceso-cuenta"><span className={'initial-avatar ' + (seleccionado.rol === 'DOCTORA' ? 'blue' : 'pink')}>{seleccionado.nombre.charAt(0)}</span><div><strong>{seleccionado.nombre}</strong><p>{seleccionado.email}</p></div><button type="button" disabled={loading} className="btn-link" onClick={() => { setSeleccionado(null); setPassword(''); setError(''); setMostrarClave(false) }}>Cambiar</button></div>
        <input name="username" autoComplete="username" type="text" value={seleccionado.email} readOnly hidden />
        <div><label htmlFor="clave" className="mb-2 block text-xs">Contraseña</label><div className="acceso-clave"><input id="clave" name="password" autoComplete="current-password" type={mostrarClave ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} disabled={loading} required autoFocus aria-describedby={error ? 'error-ingreso' : undefined} aria-invalid={!!error} className="input" /><button type="button" disabled={loading} className="acceso-ver-clave" aria-label={mostrarClave ? 'Ocultar contraseña' : 'Mostrar contraseña'} aria-pressed={mostrarClave} onClick={() => setMostrarClave(v => !v)}>{mostrarClave ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></div>
        {error && <p id="error-ingreso" role="alert" className="form-error">{error}</p>}
        <button type="submit" disabled={loading} className="btn btn-primary w-full">{loading ? <><LoaderCircle size={15} className="search-spinner" />Ingresando…</> : <>Ingresar al consultorio<ArrowRight size={15} /></>}</button><Link href="/recuperar-clave" className="btn-link justify-center w-full">Olvidé mi contraseña</Link>
      </form>}
      <p className="acceso-privacidad"><LockKeyhole size={14} /><span>Acceso exclusivo para el equipo.<br />Ingresá con tu propia cuenta del consultorio.</span></p>
    </section></div><footer className="acceso-pie">Un espacio para cuidar. Una historia para acompañar.</footer></main>
  </div>
}
