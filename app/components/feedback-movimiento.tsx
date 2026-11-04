'use client'

import { useEffect, useRef } from 'react'

export default function FeedbackMovimiento() {
  const capa = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const contenedor = capa.current
    const reduccion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const timers = new Set<ReturnType<typeof setTimeout>>()
    function mostrar(target: EventTarget | null, x?: number, y?: number) {
      if (reduccion.matches || !(target instanceof Element)) return
      const control = target.closest<HTMLElement>('button, a[href], summary, input[type="submit"], input[type="button"]')
      if (!control || control.matches(':disabled, [aria-disabled="true"]') || !contenedor) return
      const rect = control.getBoundingClientRect()
      if (!rect.width || !rect.height) return
      const caja = document.createElement('span'), onda = document.createElement('span')
      caja.className = 'press-feedback'
      Object.assign(caja.style, { left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px`, borderRadius: getComputedStyle(control).borderRadius, color: getComputedStyle(control).color })
      onda.className = 'press-wave'
      const diametro = Math.hypot(rect.width, rect.height) * 2
      Object.assign(onda.style, { width: `${diametro}px`, height: `${diametro}px`, left: `${(x ?? rect.left + rect.width / 2) - rect.left}px`, top: `${(y ?? rect.top + rect.height / 2) - rect.top}px` })
      caja.appendChild(onda); contenedor.appendChild(caja)
      const timer = setTimeout(() => { caja.remove(); timers.delete(timer) }, 500)
      timers.add(timer)
    }
    function pointer(e: PointerEvent) { if (e.button === 0) mostrar(e.target, e.clientX, e.clientY) }
    function teclado(e: KeyboardEvent) {
      if (e.repeat || e.altKey || e.ctrlKey || e.metaKey || !(e.target instanceof Element)) return
      if (e.key === 'Enter' || (e.key === ' ' && e.target.closest('button, summary, input[type="submit"], input[type="button"]'))) mostrar(e.target)
    }
    document.addEventListener('pointerdown', pointer, { passive: true })
    document.addEventListener('keydown', teclado)
    return () => { document.removeEventListener('pointerdown', pointer); document.removeEventListener('keydown', teclado); timers.forEach(clearTimeout); contenedor?.replaceChildren() }
  }, [])
  return <><div ref={capa} className="feedback-layer" aria-hidden="true" /><div className="navigation-progress" aria-hidden="true"><span /></div></>
}
