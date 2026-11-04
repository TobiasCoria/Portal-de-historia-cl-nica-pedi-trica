'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
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
      router.push('/pacientes')
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

  if (!seleccionado) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white p-8">
        <h1 className="mb-2 font-serif text-3xl text-[#1c2521]">Portal Pediatría</h1>
        <p className="mb-12 text-sm text-[#5b6b64]">¿Quién está usando el sistema?</p>

        <div className="flex gap-10">
          {perfiles.map((p) => (
            <div key={p.email} className="flex flex-col items-center gap-3">
              <div className="group relative">
                <button
                  onClick={() => setSeleccionado(p)}
                  className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full text-4xl font-medium text-white shadow-sm transition-transform group-hover:scale-105"
                  style={{ backgroundColor: p.color }}
                >
                  {p.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.avatarUrl} alt={p.nombre} className="h-full w-full object-cover" />
                  ) : (
                    p.nombre.charAt(0)
                  )}
                </button>

              </div>
              <span className="text-sm font-medium text-[#1c2521]">{p.nombre}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-8">
      <form onSubmit={handleLogin} className="card w-full max-w-sm space-y-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full text-lg font-medium text-white"
            style={{ backgroundColor: seleccionado.color }}
          >
            {seleccionado.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={seleccionado.avatarUrl} alt={seleccionado.nombre} className="h-full w-full object-cover" />
            ) : (
              seleccionado.nombre.charAt(0)
            )}
          </div>
          <div>
            <p className="font-medium text-[#1c2521]">{seleccionado.nombre}</p>
            <button
              type="button"
              disabled={loading}
              onClick={() => { setSeleccionado(null); setPassword(''); setError('') }}
              className="btn-link text-xs"
            >
              Cambiar perfil
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1c2521]">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoFocus
            className="input mt-1"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={loading} className="btn btn-primary w-full disabled:opacity-50">
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  )
}
