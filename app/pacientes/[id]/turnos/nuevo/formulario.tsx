'use client'
import CambiosPendientes from '@/app/components/cambios-pendientes'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { crearTurno } from '../actions'

export default function FormularioTurno({ pacienteId }: { pacienteId: string }) {
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(formData: FormData) {
    try {

    setEnviando(true)
    const respuesta = await crearTurno(pacienteId, {
      fecha: formData.get('fecha') as string,
      duracion: Number(formData.get('duracion') || 30),
      motivo: formData.get('motivo') as string || undefined,
      observaciones: formData.get('observaciones') as string || undefined,
    })
    if (respuesta?.error) { setError(respuesta.error); return }
  
    } catch { setError('No se pudo guardar. Revisá los datos y volvé a intentar.') }
    finally { setEnviando(false) }
  }

  return (
    <form aria-busy={enviando} action={onSubmit} className="card space-y-4">
      <CambiosPendientes />
      <div>
        <label className="block text-sm font-medium text-[#1c2521]">Fecha y hora *
        <input name="fecha" type="datetime-local" required className="input mt-1" /></label>
      </div>
      <div><label className="block text-sm font-medium">Duración<select name="duracion" className="input mt-1" defaultValue={30}><option value={15}>15 minutos</option><option value={30}>30 minutos</option><option value={45}>45 minutos</option><option value={60}>60 minutos</option></select></label></div>
      <div>
        <label className="block text-sm font-medium text-[#1c2521]">Motivo
        <input name="motivo" className="input mt-1" placeholder="Ej: Control de rutina, seguimiento..." /></label>
      </div>
      <div>
        <label className="block text-sm font-medium text-[#1c2521]">Observaciones
        <textarea name="observaciones" rows={2} className="input mt-1" /></label>
      </div>

      {error && <p role="alert" className="form-error">{error}</p>}
      <div className="sticky-actions"><span className="text-xs text-[#6f8578]">Revisá los datos antes de guardar.</span><button type="submit" disabled={enviando} className="btn btn-primary disabled:opacity-50">
        <Check size={16} />
        {enviando ? 'Agendando...' : 'Agendar turno'}
      </button></div>
    </form>
  )
}