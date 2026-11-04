'use client'

import { useRef, useState } from 'react'
import { Paperclip, Trash2, Upload } from 'lucide-react'
import { subirDocumento, obtenerUrlDocumento, eliminarDocumento } from '@/lib/documentos'

type Documento = {
  id: string
  nombre: string
  url: string
  tipo: string | null
  creadoEn: Date
}

export default function Documentos({
  pacienteId,
  consultaId,
  documentos,
}: {
  pacienteId: string
  consultaId?: string
  documentos: Documento[]
}) {
  const [error, setError] = useState('')
  const [subiendo, setSubiendo] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  async function onSubmit(formData: FormData) {
    setSubiendo(true)
    formData.set('pacienteId', pacienteId)
    if (consultaId) formData.set('consultaId', consultaId)
    setError('')
    try { await subirDocumento(formData) }
    catch { setError('No se pudo subir el archivo. Elegí un PDF, JPG o PNG de hasta 10 MB.') }
    finally { setSubiendo(false) }
  }

  async function verArchivo(id: string) {
    try {
      const url = await obtenerUrlDocumento(id)
      if (url) window.open(url, '_blank', 'noopener,noreferrer')
    } catch { setError('No se pudo abrir el documento.') }
  }

  async function eliminar(id: string) {
    if (!confirm('¿Ocultar este documento? El archivo se conserva en el sistema.')) return
    try { await eliminarDocumento(pacienteId, id) }
    catch { setError('No se pudo ocultar el documento.') }
  }

  return (
    <div className="space-y-2">
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      {documentos.map((doc) => (
        <div key={doc.id} className="flex items-center justify-between rounded border border-[#e3e7e2] p-2 text-sm">
          <button onClick={() => verArchivo(doc.id)} className="btn-link">
            <Paperclip size={14} />
            {doc.nombre}
          </button>
          <button onClick={() => eliminar(doc.id)} className="btn-link-danger">
            <Trash2 size={14} />
            Ocultar
          </button>
        </div>
      ))}

      <form action={onSubmit} className="flex items-center gap-2">
        <input ref={fileInput} type="file" name="archivo" accept=".pdf,.jpg,.jpeg,.png" className="hidden" required
          onChange={(e) => e.target.form?.requestSubmit()} />
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          disabled={subiendo}
          className="btn btn-outline disabled:opacity-50"
        >
          <Upload size={15} />
          {subiendo ? 'Subiendo...' : 'Subir documento'}
        </button>
      </form>
    </div>
  )
}