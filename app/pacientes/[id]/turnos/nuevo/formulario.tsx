'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { crearTurno } from '../actions'

export default function FormularioTurno({ pacienteId }: { pacienteId: string }) {
  const [enviando, setEnviando] = useState(false)

  async function onSubmit(formData: FormData) {
    setEnviando(true)
    await crearTurno(pacienteId, {
      fecha: formData.get('fecha') as string,
      motivo: formData.get('motivo') as string || undefined,
      observaciones: formData.get('observaciones') as string || undefined,
    })
  }

  return (
    <form action={onSubmit} className="card space-y-4">
      <div>
        <label className="block text-sm font-medium text-[#1c2521]">Fecha y hora *</label>
        <input name="fecha" type="datetime-local" required className="input mt-1" />
      </div>
      <div>
        <label className="block text-sm font-medium text-[#1c2521]">Motivo</label>
        <input name="motivo" className="input mt-1" placeholder="Ej: Control de rutina, seguimiento..." />
      </div>
      <div>
        <label className="block text-sm font-medium text-[#1c2521]">Observaciones</label>
        <textarea name="observaciones" rows={2} className="input mt-1" />
      </div>

      <button type="submit" disabled={enviando} className="btn btn-primary disabled:opacity-50">
        <Check size={16} />
        {enviando ? 'Agendando...' : 'Agendar turno'}
      </button>
    </form>
  )
}