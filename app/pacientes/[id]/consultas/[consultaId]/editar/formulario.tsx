'use client'
import CambiosPendientes from '@/app/components/cambios-pendientes'

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
    try {

    setEnviando(true)
    setError(null)
    const resultado = await actualizarConsulta(pacienteId, consulta.id, {
      motivo: formData.get('motivo') as string,
      diagnostico: formData.get('diagnostico') as string || undefined,
      tratamiento: formData.get('tratamiento') as string || undefined,
      peso: formData.get('peso') ? Number(formData.get('peso')) : undefined,
      talla: formData.get('talla') ? Number(formData.get('talla')) : undefined,
      observaciones: formData.get('observaciones') as string || undefined,
    }, consulta.version, String(formData.get('motivoCambio') || ''))
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
        <label className="block text-sm font-medium text-[#1c2521]">Motivo de consulta *
        <input name="motivo" required defaultValue={consulta.motivo} className="input mt-1" /></label>
      </div>
      <div>
        <label className="block text-sm font-medium text-[#1c2521]">Diagnóstico
        <textarea name="diagnostico" rows={2} defaultValue={consulta.diagnostico ?? ''} className="input mt-1" /></label>
      </div>
      <div>
        <label className="block text-sm font-medium text-[#1c2521]">Tratamiento
        <textarea name="tratamiento" rows={2} defaultValue={consulta.tratamiento ?? ''} className="input mt-1" /></label>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#1c2521]">Peso (kg)
          <input name="peso" type="number" step="0.01" defaultValue={consulta.peso ?? ''} className="input mt-1" /></label>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1c2521]">Talla (cm)
          <input name="talla" type="number" step="0.1" defaultValue={consulta.talla ?? ''} className="input mt-1" /></label>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-[#1c2521]">Observaciones
        <textarea name="observaciones" rows={2} defaultValue={consulta.observaciones ?? ''} className="input mt-1" /></label>
      </div>

      <div>
        <label className="block text-sm font-medium">Motivo de la rectificación *
        <textarea name="motivoCambio" required minLength={5} rows={2} className="input mt-1" placeholder="Contá por qué necesitás corregir esta consulta." /></label>
        <p className="mt-2 text-xs text-[#5b6b64]">La versión anterior queda conservada en el historial.</p>
      </div>
      {error && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="sticky-actions"><span className="text-xs text-[#6f8578]">Revisá los datos antes de guardar.</span><button type="submit" disabled={enviando} className="btn btn-primary disabled:opacity-50">
        <Check size={16} />
        {enviando ? 'Guardando...' : 'Guardar cambios'}
      </button></div>
    </form>
  )
}