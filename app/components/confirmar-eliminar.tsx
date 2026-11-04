'use client'
import { useEffect, useRef, useState } from 'react'
import { AlertCircle } from 'lucide-react'

export default function ConfirmarEliminar({ children, mensaje = '¿Querés ocultar este registro? Los datos se conservan.' }: { children: React.ReactNode; mensaje?: string }) {
  const [abierto, setAbierto] = useState(false)
  const form = useRef<HTMLFormElement | null>(null)
  const permitido = useRef(false)
  const cancelar = useRef<HTMLButtonElement>(null)
  const anterior = useRef<HTMLElement | null>(null)
  useEffect(() => {
    if (!abierto) return
    anterior.current = document.activeElement as HTMLElement
    cancelar.current?.focus()
    const teclado = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAbierto(false)
      if (e.key === 'Tab') {
        const botones = cancelar.current?.closest('[role="dialog"]')?.querySelectorAll<HTMLButtonElement>('button')
        if (!botones?.length) return
        const primero = botones[0], ultimo = botones[botones.length - 1]
        if (e.shiftKey && document.activeElement === primero) { e.preventDefault(); ultimo.focus() }
        else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero.focus() }
      }
    }
    document.addEventListener('keydown', teclado)
    return () => { document.removeEventListener('keydown', teclado); anterior.current?.focus() }
  }, [abierto])
  return <div onSubmit={e => {
    if (permitido.current) { permitido.current = false; return }
    e.preventDefault(); form.current = e.target as HTMLFormElement; setAbierto(true)
  }}>{children}{abierto && <div className="dialog-backdrop" onClick={e => { if (e.target === e.currentTarget) setAbierto(false) }}><section role="dialog" aria-modal="true" aria-labelledby="confirmacion-titulo" aria-describedby="confirmacion-texto" className="dialog-card"><AlertCircle size={28} className="mb-4 text-[#a97f4e]" /><h2 id="confirmacion-titulo">Confirmá la acción</h2><p id="confirmacion-texto">{mensaje}</p><div className="dialog-actions"><button ref={cancelar} type="button" className="btn btn-outline" onClick={() => setAbierto(false)}>Volver</button><button type="button" className="btn btn-primary" onClick={() => { permitido.current = true; setAbierto(false); form.current?.requestSubmit() }}>Confirmar</button></div></section></div>}</div>
}
