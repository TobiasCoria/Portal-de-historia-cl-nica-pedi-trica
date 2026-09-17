'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { obtenerPerfil, subirAvatar, asegurarPerfil } from '@/lib/perfiles'

const PERFILES = [
  { nombre: 'Doctora', email: 'gritest123@gmail.com', color: '#3e6fa8' },
  { nombre: 'Secretaria', email: 'secretaria@gmail.com', color: '#D6497B' },
]

type PerfilConFoto = typeof PERFILES[number] & { avatarUrl?: string | null }

export default function LoginPage() {
  const [perfiles, setPerfiles] = useState<PerfilConFoto[]>(PERFILES)
  const [seleccionado, setSeleccionado] = useState<PerfilConFoto | null>(null)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [subiendoFoto, setSubiendoFoto] = useState<string | null>(null)
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({})
  const router = useRouter()

  useEffect(() => {
    async function cargarFotos() {
      const actualizados = await Promise.all(
        PERFILES.map(async (p) => {
          const perfil = await obtenerPerfil(p.email)
          return { ...p, avatarUrl: perfil?.avatarUrl }
        })
      )
      setPerfiles(actualizados)
    }
    cargarFotos()
  }, [])

  async function subirFoto(perfil: PerfilConFoto, archivo: File) {
    setSubiendoFoto(perfil.email)
    const formData = new FormData()
    formData.set('avatar', archivo)
    await subirAvatar(perfil.email, perfil.nombre, perfil.color, formData)
    const actualizado = await obtenerPerfil(perfil.email)
    setPerfiles((prev) =>
      prev.map((p) => (p.email === perfil.email ? { ...p, avatarUrl: actualizado?.avatarUrl } : p))
    )
    setSubiendoFoto(null)
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!seleccionado) return
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: seleccionado.email,
      password,
    })

    if (error) {
      setError('Contraseña incorrecta')
      setLoading(false)
      return
    }

    await asegurarPerfil(seleccionado.email, seleccionado.nombre, seleccionado.color)
    router.push('/pacientes')
    router.refresh()
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

                <button
                  type="button"
                  onClick={() => fileInputs.current[p.email]?.click()}
                  disabled={subiendoFoto === p.email}
                  className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#1c2521] text-white opacity-0 transition-opacity group-hover:opacity-100"
                  title="Cambiar foto"
                >
                  {subiendoFoto === p.email ? '…' : '✎'}
                </button>
                <input
                  ref={(el) => { fileInputs.current[p.email] = el }}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const archivo = e.target.files?.[0]
                    if (archivo) subirFoto(p, archivo)
                  }}
                />
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