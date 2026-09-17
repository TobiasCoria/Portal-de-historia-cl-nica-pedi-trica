'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { actualizarVacuna } from '../../actions'
import type { VacunaAplicada } from '@prisma/client'

function formatoFecha(fecha: Date | null): string {
  if (!fecha) return ''
  return new Date(fecha).toISOString().split('T')[0]
}

export default function FormularioEdicionVacuna({
  pacienteId,
  vacuna,
}: {
  pacienteId: string
  vacuna: VacunaAplicada
}) {
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(formData: FormData) {
    setEnviando(true)
    setError(null)
    const resultado = await actualizarVacuna(pacienteId, vacuna.id, {
      nombre: formData.get('nombre') as string,
      dosis: formData.get('dosis') as string || undefined,
      fechaAplicada: formData.get('fechaAplicada') as string || undefined,
      fechaProgramada: formData.get('fechaProgramada') as string || undefined,
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
        <label className="block text-sm font-medium text-[#1c2521]">Nombre de la vacuna *</label>
        <input name="nombre" required defaultValue={vacuna.nombre} className="input mt-1" />
      </div>
      <div>
        <label className="block text-sm font-medium text-[#1c2521]">Dosis</label>
        <input name="dosis" defaultValue={vacuna.dosis ?? ''} className="input mt-1" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#1c2521]">Fecha aplicada</label>
          <input name="fechaAplicada" type="date" defaultValue={formatoFecha(vacuna.fechaAplicada)} className="input mt-1" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1c2521]">Próxima dosis</label>
          <input name="fechaProgramada" type="date" defaultValue={formatoFecha(vacuna.fechaProgramada)} className="input mt-1" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-[#1c2521]">Observaciones</label>
        <textarea name="observaciones" rows={2} defaultValue={vacuna.observaciones ?? ''} className="input mt-1" />
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