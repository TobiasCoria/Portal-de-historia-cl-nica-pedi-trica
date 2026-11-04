'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TEXTO_CONSENTIMIENTO } from '@/lib/consentimiento'
import { registrarConsentimiento } from './actions'
export default function FormularioConsentimiento({ pacienteId }: { pacienteId: string }) {
  const [error, setError] = useState(''), [enviando, setEnviando] = useState(false), router = useRouter()
  return <form className="card form-panel space-y-5" action={async fd => {
    setError(''); setEnviando(true)
    try { const resultado = await registrarConsentimiento(pacienteId, fd.get('confirmacion') === 'on'); if (resultado.error) setError(resultado.error); else { router.push(`/pacientes/${pacienteId}`); router.refresh() } }
    catch { setError('No se pudo registrar el consentimiento. Volvé a intentar.') }
    finally { setEnviando(false) }
  }}><h2>Consentimiento del tutor</h2><p className="text-sm leading-7">{TEXTO_CONSENTIMIENTO}</p><p className="form-notice">Texto pendiente de aprobación legal. La fecha registrada será la de hoy; no se completa una aceptación retroactiva.</p><label className="flex items-start gap-3"><input className="mt-1" name="confirmacion" type="checkbox" required /><span>Confirmo que el tutor prestó el consentimiento indicado.</span></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="btn btn-primary" disabled={enviando}>{enviando ? 'Registrando…' : 'Registrar consentimiento'}</button><p className="text-xs text-[#83958b]">Después podés adjuntar la copia firmada en Documentos.</p></form>
}
