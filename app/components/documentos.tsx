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
  const [subiendo, setSubiendo] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  async function onSubmit(formData: FormData) {
    setSubiendo(true)
    formData.set('pacienteId', pacienteId)
    if (consultaId) formData.set('consultaId', consultaId)
    await subirDocumento(formData)
    setSubiendo(false)
  }

  async function verArchivo(path: string) {
    const url = await obtenerUrlDocumento(path)
    if (url) window.open(url, '_blank')
  }

  async function eliminar(id: string, url: string) {
    if (!confirm('¿Eliminar este documento? Esta acción no se puede deshacer.')) return
    await eliminarDocumento(pacienteId, id, url)
  }

  return (
    <div className="space-y-2">
      {documentos.map((doc) => (
        <div key={doc.id} className="flex items-center justify-between rounded border border-[#e3e7e2] p-2 text-sm">
          <button onClick={() => verArchivo(doc.url)} className="btn-link">
            <Paperclip size={14} />
            {doc.nombre}
          </button>
          <button onClick={() => eliminar(doc.id, doc.url)} className="btn-link-danger">
            <Trash2 size={14} />
            Eliminar
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