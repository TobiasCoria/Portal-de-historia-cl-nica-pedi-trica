'use client'
import { useState } from 'react'
import Link from 'next/link'
import Brand from '@/app/components/brand'
import { createClient } from '@/lib/supabase/client'
import { PERFILES } from '@/lib/perfiles-config'
import { conTiempo } from '@/lib/espera'
export default function RecuperarClavePage() {
  const [enviando, setEnviando] = useState(false), [mensaje, setMensaje] = useState(''), [error, setError] = useState('')
  return <div className="login-layout"><section className="login-story"><Brand /><div className="story-copy"><p className="eyebrow" style={{ color: '#99b9b1' }}>Volvamos a tu espacio</p><h1>Un paso para<br />seguir acompañando.</h1><p>Recuperá el acceso a tu cuenta desde el correo que usás en el consultorio.</p></div></section><section className="login-form-area"><div className="login-form-inner"><p className="eyebrow">Recuperación de acceso</p><h2>¿Olvidaste tu contraseña?</h2><p className="page-description">Ingresá el email de tu cuenta. Te vamos a enviar un enlace para elegir una nueva contraseña.</p><form className="space-y-5" action={async fd => {
    setEnviando(true); setError(''); setMensaje('')
    try {
      const email = String(fd.get('email') || '').trim().toLowerCase()
      if (PERFILES.some(p => p.email.toLowerCase() === email)) {
        const { error } = await conTiempo(createClient().auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/callback` }))
        if (error) throw new Error('No se pudo enviar el enlace. Esperá unos minutos y volvé a intentar.')
      }
      setMensaje('Si el email corresponde a una cuenta del consultorio, vas a recibir un enlace. Revisá también la carpeta de correo no deseado.')
    } catch { setError('No se pudo enviar el enlace. Revisá tu conexión y volvé a intentar en unos minutos.') }
    finally { setEnviando(false) }
  }}><label className="block">Email de tu cuenta<input className="input mt-2" type="email" name="email" required autoComplete="email" /></label>{mensaje && <p role="status" className="form-notice">{mensaje}</p>}{error && <p role="alert" className="form-error">{error}</p>}<button className="btn btn-primary w-full" disabled={enviando}>{enviando ? 'Enviando…' : 'Enviar enlace de recuperación'}</button><Link className="btn-link" href="/login">Volver al ingreso</Link></form></div></section></div>
}
