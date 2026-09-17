'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { actualizarConsulta } from '../../actions'
import type { Consulta } from '@prisma/client'

export default function FormularioEdicionConsulta({
  pacienteId,
  consulta,
}: {
  pacienteId: string
  consulta: Consulta
}) {
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(formData: FormData) {
    setEnviando(true)
    setError(null)
    const resultado = await actualizarConsulta(pacienteId, consulta.id, {
      motivo: formData.get('motivo') as string,
      diagnostico: formData.get('diagnostico') as string || undefined,
      tratamiento: formData.get('tratamiento') as string || undefined,
      peso: formData.get('peso') ? Number(formData.get('peso')) : undefined,
      talla: formData.get('talla') ? Number(formData.get('talla')) : undefined,
      observaciones: formData.get('observaciones') as string || undefined,
    })
    if (resultado?.error) {
      setError(resultado.error)
      setEnviando(false)
    }
  }

  return (
    <form action={onSubmit} className="card space-y-4">
      <div>
        <label className="block text-sm font-medium text-[#1c2521]">Motivo de consulta *</label>
        <input name="motivo" required defaultValue={consulta.motivo} className="input mt-1" />
      </div>
      <div>
        <label className="block text-sm font-medium text-[#1c2521]">Diagnóstico</label>
        <textarea name="diagnostico" rows={2} defaultValue={consulta.diagnostico ?? ''} className="input mt-1" />
      </div>
      <div>
        <label className="block text-sm font-medium text-[#1c2521]">Tratamiento</label>
        <textarea name="tratamiento" rows={2} defaultValue={consulta.tratamiento ?? ''} className="input mt-1" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#1c2521]">Peso (kg)</label>
          <input name="peso" type="number" step="0.01" defaultValue={consulta.peso ?? ''} className="input mt-1" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1c2521]">Talla (cm)</label>
          <input name="talla" type="number" step="0.1" defaultValue={consulta.talla ?? ''} className="input mt-1" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-[#1c2521]">Observaciones</label>
        <textarea name="observaciones" rows={2} defaultValue={consulta.observaciones ?? ''} className="input mt-1" />
      </div>

      {error && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button type="submit" disabled={enviando} className="btn btn-primary disabled:opacity-50">
        <Check size={16} />
        {enviando ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </form>
  )
}