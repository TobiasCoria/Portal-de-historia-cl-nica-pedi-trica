'use client'
import CambiosPendientes from '@/app/components/cambios-pendientes'
import { inputFechaHora } from '@/lib/fechas'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { actualizarTurno } from '../../actions'
import type { Turno } from '@prisma/client'


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
    try {

    setEnviando(true)
    setError(null)
    const resultado = await actualizarTurno(pacienteId, turno.id, {
      fecha: formData.get('fecha') as string,
      duracion: Number(formData.get('duracion') || 30),
      motivo: formData.get('motivo') as string || undefined,
      observaciones: formData.get('observaciones') as string || undefined,
    })
    if (resultado?.error) {
      setError(resultado.error)
      setEnviando(false)
    }
  
    } catch { setError('No se pudo guardar. Revisá los datos y volvé a intentar.') }
    finally { setEnviando(false) }
  }

  return (
    <form action={onSubmit} className="card space-y-4">
      <CambiosPendientes />
      <div>
        <label className="block text-sm font-medium text-[#1c2521]">Fecha y hora *
        <input name="fecha" type="datetime-local" required defaultValue={inputFechaHora(turno.fecha)} className="input mt-1" /></label>
      </div>
      <div><label className="block text-sm font-medium">Duración<select name="duracion" className="input mt-1" defaultValue={turno.duracion}><option value={15}>15 minutos</option><option value={30}>30 minutos</option><option value={45}>45 minutos</option><option value={60}>60 minutos</option></select></label></div>
      <div>
        <label className="block text-sm font-medium text-[#1c2521]">Motivo
        <input name="motivo" defaultValue={turno.motivo ?? ''} className="input mt-1" /></label>
      </div>
      <div>
        <label className="block text-sm font-medium text-[#1c2521]">Observaciones
        <textarea name="observaciones" rows={2} defaultValue={turno.observaciones ?? ''} className="input mt-1" /></label>
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