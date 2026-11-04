'use client'
import CambiosPendientes from '@/app/components/cambios-pendientes'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'
import { crearVacuna, crearVacunaConProxima } from '../actions'

export default function FormularioVacuna({ pacienteId }: { pacienteId: string }) {
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [programarProxima, setProgramarProxima] = useState(false)
  const router = useRouter()

  async function onSubmit(formData: FormData) {
    try {

    setEnviando(true)

    const fechaAplicada = formData.get('fechaAplicada') as string
    const nombre = formData.get('nombre') as string
    const dosis = formData.get('dosis') as string || undefined
    const observaciones = formData.get('observaciones') as string || undefined

    if (fechaAplicada) {
      const respuesta = await crearVacunaConProxima(pacienteId, {
        nombre,
        dosis,
        fechaAplicada,
        observaciones,
        proximaDosis: formData.get('proximaDosis') as string || undefined,
        proximaFecha: formData.get('proximaFecha') as string || undefined,
      })
    if (respuesta?.error) { setError(respuesta.error); return }
    } else {
      const respuesta = await crearVacuna(pacienteId, {
        nombre,
        dosis,
        fechaProgramada: formData.get('proximaFecha') as string || undefined,
        observaciones,
      })
    if (respuesta?.error) { setError(respuesta.error); return }
    }

    router.push(`/pacientes/${pacienteId}`)
  
    } catch { setError('No se pudo guardar. Revisá los datos y volvé a intentar.') }
    finally { setEnviando(false) }
  }

  return (
    <form action={onSubmit} className="card space-y-4">
      <CambiosPendientes />
      <div>
        <label className="block text-sm font-medium text-[#1c2521]">Nombre de la vacuna *
        <input name="nombre" required className="input mt-1" placeholder="Ej: BCG, Sabin, Triple viral..." /></label>
      </div>
      <div>
        <label className="block text-sm font-medium text-[#1c2521]">Dosis
        <input name="dosis" className="input mt-1" placeholder="Ej: 1era dosis, refuerzo..." /></label>
      </div>
      <div>
        <label className="block text-sm font-medium text-[#1c2521]">Fecha aplicada
        <input name="fechaAplicada" type="date" className="input mt-1" /></label>
        <p className="mt-1 text-xs text-[#5b6b64]">Dejá vacío si solo querés programar una dosis futura, sin aplicar nada hoy.</p>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={programarProxima}
          onChange={(e) => setProgramarProxima(e.target.checked)}
        />
        Programar la próxima dosis
      </label>

      {programarProxima && (
        <div className="rounded border border-[#e3e7e2] p-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1c2521]">Dosis (próxima)
              <input name="proximaDosis" className="input mt-1" placeholder="Ej: refuerzo" /></label>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1c2521]">Fecha programada *
              <input name="proximaFecha" type="date" required={programarProxima} className="input mt-1" /></label>
            </div>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-[#1c2521]">Observaciones
        <textarea name="observaciones" rows={2} className="input mt-1" /></label>
      </div>

      {error && <p role="alert" className="form-error">{error}</p>}
      <button type="submit" disabled={enviando} className="btn btn-primary disabled:opacity-50">
        <Check size={16} />
        {enviando ? 'Guardando...' : 'Guardar'}
      </button>
    </form>
  )
}