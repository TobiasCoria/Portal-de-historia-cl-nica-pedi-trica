'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { actualizarTurno } from '../../actions'
import type { Turno } from '@prisma/client'

function formatoFechaHora(fecha: Date): string {
  const d = new Date(fecha)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function FormularioEdicionTurno({
  pacienteId,
  turno,
}: {
  pacienteId: string
  turno: Turno
}) {
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(formData: FormData) {
    setEnviando(true)
    setError(null)
    const resultado = await actualizarTurno(pacienteId, turno.id, {
      fecha: formData.get('fecha') as string,
      motivo: formData.get('motivo') as string || undefined,
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
        <label className="block text-sm font-medium text-[#1c2521]">Fecha y hora *</label>
        <input name="fecha" type="datetime-local" required defaultValue={formatoFechaHora(turno.fecha)} className="input mt-1" />
      </div>
      <div>
        <label className="block text-sm font-medium text-[#1c2521]">Motivo</label>
        <input name="motivo" defaultValue={turno.motivo ?? ''} className="input mt-1" />
      </div>
      <div>
        <label className="block text-sm font-medium text-[#1c2521]">Observaciones</label>
        <textarea name="observaciones" rows={2} defaultValue={turno.observaciones ?? ''} className="input mt-1" />
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