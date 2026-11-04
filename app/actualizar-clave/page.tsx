'use client'
import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Brand from '@/app/components/brand'
import { createClient } from '@/lib/supabase/client'
import { conTiempo } from '@/lib/espera'

function FormularioNuevaClave() {
  const params = useSearchParams()
  const [error, setError] = useState(params.get('error') ? 'El enlace venció o ya fue utilizado. Pedí uno nuevo.' : ''), [enviando, setEnviando] = useState(false), [ok, setOk] = useState(false)
  return <div className="login-layout"><section className="login-story"><Brand /><div className="story-copy"><h1>Tu espacio.<br />Tu acceso seguro.</h1></div></section><section className="login-form-area"><div className="login-form-inner"><p className="eyebrow">Una nueva contraseña</p><h2>Volvé a tu consultorio</h2><p className="page-description">Elegí una contraseña de al menos ocho caracteres para tu cuenta.</p>{ok ? <div><p className="toast-message">La contraseña se actualizó. Ingresá de nuevo con tu nueva clave.</p><Link className="btn btn-primary" href="/login">Ir al ingreso</Link></div> : <form className="space-y-5" action={async fd => {
    setError(''); setEnviando(true)
    try {
      const clave = String(fd.get('clave') || ''), confirmacion = String(fd.get('confirmacion') || '')
      if (clave.length < 8 || clave.length > 72 || clave !== confirmacion) { setError('Las contraseñas deben coincidir y tener entre 8 y 72 caracteres.'); return }
      const supabase = createClient()
      const { data, error: sesionError } = await conTiempo(supabase.auth.getUser())
      if (sesionError || !data.user) { setError('El enlace venció o la sesión no está disponible. Pedí un enlace nuevo.'); return }
      const { error } = await conTiempo(supabase.auth.updateUser({ password: clave }))
      if (error) { setError('No se pudo actualizar la contraseña. Elegí una distinta o pedí un enlace nuevo.'); return }
      await conTiempo(supabase.auth.signOut({ scope: 'local' }))
      setOk(true)
    } catch { setError('No se pudo completar el cambio. Revisá tu conexión y volvé a intentar.') }
    finally { setEnviando(false) }
  }}><label className="block">Nueva contraseña<input className="input mt-2" name="clave" type="password" minLength={8} maxLength={72} required autoComplete="new-password" /></label><label className="block">Repetí la contraseña<input className="input mt-2" name="confirmacion" type="password" minLength={8} maxLength={72} required autoComplete="new-password" /></label>{error && <p role="alert" className="form-error">{error}</p>}<button disabled={enviando} className="btn btn-primary w-full">{enviando ? 'Guardando…' : 'Guardar nueva contraseña'}</button><Link className="btn-link" href="/recuperar-clave">Pedir otro enlace</Link></form>}</div></section></div>
}
export default function ActualizarClavePage() { return <Suspense fallback={<p className="p-8">Preparando el formulario…</p>}><FormularioNuevaClave /></Suspense> }
