'use client'
import { useRef, useState } from 'react'
import { Paperclip, Upload, FileText } from 'lucide-react'
import { subirDocumento, eliminarDocumento } from '@/lib/documentos'
import ConfirmarEliminar from './confirmar-eliminar'

type Documento = { id: string; nombre: string; tipo: string | null; creadoEn: Date }
export default function Documentos({ pacienteId, consultaId, documentos }: { pacienteId: string; consultaId?: string; documentos: Documento[] }) {
  const [error, setError] = useState(''), [subiendo, setSubiendo] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  async function subir(data: FormData) {
    setError(''); setSubiendo(true); data.set('pacienteId', pacienteId)
    if (consultaId) data.set('consultaId', consultaId)
    try { await subirDocumento(data); if (input.current) input.current.value = '' }
    catch { setError('No se pudo subir el archivo. Elegí un PDF, JPG o PNG de hasta 10 MB y volvé a intentar.') }
    finally { setSubiendo(false) }
  }
  async function ocultar(id: string) {
    setError('')
    try { await eliminarDocumento(pacienteId, id) }
    catch { setError('No se pudo ocultar el documento. Volvé a intentar.') }
  }
  return <div>{error && <p role="alert" className="form-error mb-4">{error}</p>}{documentos.map(d => <div key={d.id} className="doc-row"><div className="flex min-w-0 items-center gap-3"><span className="doc-icon"><FileText size={17} strokeWidth={1.5} /></span><div><a href={`/documentos/${d.id}`} target="_blank" rel="noopener noreferrer" className="btn-link break-all"><Paperclip size={12} />{d.nombre}</a><p className="text-[10px] text-[#8c9d94]">{d.tipo === 'application/pdf' ? 'PDF' : 'Imagen'} · {new Date(d.creadoEn).toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}</p></div></div><ConfirmarEliminar mensaje="¿Ocultar este documento? El archivo se conserva y puede recuperarse desde Archivo."><form action={ocultar.bind(null, d.id)}><button className="btn-link-danger">Ocultar</button></form></ConfirmarEliminar></div>)}<form action={subir} className="doc-upload"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs font-medium">{documentos.length ? 'Sumá un nuevo documento' : 'Los documentos también cuentan su historia'}</p><p className="mt-1 text-[10px] text-[#8c9d94]">PDF, JPG o PNG · hasta 10 MB · acceso privado</p></div><input ref={input} type="file" name="archivo" accept=".pdf,.jpg,.jpeg,.png" className="hidden" required onChange={e => e.target.form?.requestSubmit()} /><button type="button" disabled={subiendo} className="btn btn-outline" onClick={() => input.current?.click()}><Upload size={13} />{subiendo ? 'Subiendo…' : 'Subir documento'}</button></div></form></div>
}
