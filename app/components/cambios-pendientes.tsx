'use client'
import { useEffect, useRef } from 'react'
export default function CambiosPendientes() {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const formulario = ref.current?.closest('form') || ref.current?.parentElement
    if (!formulario) return
    let cambiado = false
    const marcar = () => { cambiado = true }
    const salir = (e: BeforeUnloadEvent) => { if (cambiado) { e.preventDefault(); e.returnValue = '' } }
    const enlaces = (e: MouseEvent) => {
      const a = (e.target as Element).closest('a')
      if (!cambiado || !a || a.target === '_blank' || a.getAttribute('href')?.startsWith('#')) return
      if (!confirm('Tenés cambios sin guardar. ¿Querés salir de esta pantalla?')) { e.preventDefault(); e.stopPropagation() }
    }
    formulario.addEventListener('input', marcar)
    formulario.addEventListener('change', marcar)
    window.addEventListener('beforeunload', salir)
    document.addEventListener('click', enlaces, true)
    return () => { formulario.removeEventListener('input', marcar); formulario.removeEventListener('change', marcar); window.removeEventListener('beforeunload', salir); document.removeEventListener('click', enlaces, true) }
  }, [])
  return <span ref={ref} className="screen-reader">Se te avisará si salís con cambios sin guardar.</span>
}
