'use client'
import { useState } from 'react'
import { actualizarProfesional } from './actions'
import CambiosPendientes from '@/app/components/cambios-pendientes'
export default function FormularioProfesional({ nombre, matricula }: { nombre: string; matricula: string }) {
  const [error, setError] = useState(''), [ok, setOk] = useState(false), [enviando, setEnviando] = useState(false)
  return <form aria-busy={enviando} className="card form-panel space-y-5" action={async fd => {
    setError(''); setOk(false); setEnviando(true)
    try { const r = await actualizarProfesional({ nombre: String(fd.get('nombre') || ''), matricula: String(fd.get('matricula') || '') }); if (r.error) setError(r.error); else setOk(true) }
    catch { setError('No se pudo guardar. Volvé a intentar.') }
    finally { setEnviando(false) }
  }}><CambiosPendientes /><h2>Identidad profesional</h2><p className="text-xs text-[#81938a]">Estos datos aparecen en el encabezado y en los PDF que entregás a las familias.</p><label className="block">Nombre profesional<input className="input mt-2" name="nombre" defaultValue={nombre} required minLength={2} maxLength={120} autoComplete="name" /></label><label className="block">Matrícula<input className="input mt-2" name="matricula" defaultValue={matricula} maxLength={80} placeholder="Ingresá tu matrícula cuando corresponda" /></label>{error && <p role="alert" className="form-error">{error}</p>}{ok && <p role="status" className="toast-message">Los datos del consultorio quedaron guardados.</p>}<button className="btn btn-primary" disabled={enviando}>{enviando ? 'Guardando…' : 'Guardar datos'}</button></form>
}
