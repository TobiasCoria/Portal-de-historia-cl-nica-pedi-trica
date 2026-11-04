'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { crearConsulta } from '../actions'

export default function FormularioConsulta({ pacienteId, turnoId }: { pacienteId: string; turnoId?: string }) {
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(formData: FormData) {
    try {

    setEnviando(true)
    const respuesta = await crearConsulta(pacienteId, {
      motivo: formData.get('motivo') as string,
      diagnostico: formData.get('diagnostico') as string || undefined,
      tratamiento: formData.get('tratamiento') as string || undefined,
      peso: formData.get('peso') ? Number(formData.get('peso')) : undefined,
      talla: formData.get('talla') ? Number(formData.get('talla')) : undefined,
      observaciones: formData.get('observaciones') as string || undefined,
    }, turnoId)
    if (respuesta?.error) { setError(respuesta.error); return }
  
    } catch { setError('No se pudo guardar. Revisá los datos y volvé a intentar.') }
    finally { setEnviando(false) }
  }

  return (
    <form action={onSubmit} className="card space-y-4">
      {turnoId && (
        <p className="rounded border border-[#e3e7e2] bg-[#fafbfa] p-3 text-sm text-[#5b6b64]">
          Esta consulta va a marcar el turno correspondiente como <strong>Atendido</strong>.
        </p>
      )}
      <div>
        <label className="block text-sm font-medium text-[#1c2521]">Motivo de consulta *</label>
        <input name="motivo" required className="input mt-1" />
      </div>
      <div>
        <label className="block text-sm font-medium text-[#1c2521]">Diagnóstico</label>
        <textarea name="diagnostico" rows={2} className="input mt-1" />
      </div>
      <div>
        <label className="block text-sm font-medium text-[#1c2521]">Tratamiento</label>
        <textarea name="tratamiento" rows={2} className="input mt-1" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#1c2521]">Peso (kg)</label>
          <input name="peso" type="number" step="0.01" className="input mt-1" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1c2521]">Talla (cm)</label>
          <input name="talla" type="number" step="0.1" className="input mt-1" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-[#1c2521]">Observaciones</label>
        <textarea name="observaciones" rows={2} className="input mt-1" />
      </div>

      {error && <p role="alert" className="form-error">{error}</p>}
      <button type="submit" disabled={enviando} className="btn btn-primary disabled:opacity-50">
        <Check size={16} />
        {enviando ? 'Guardando...' : 'Guardar consulta'}
      </button>
    </form>
  )
}