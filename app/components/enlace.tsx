'use client'

import Link, { useLinkStatus } from 'next/link'
import type { ComponentProps } from 'react'

function EstadoEnlace() {
  const { pending } = useLinkStatus()
  return <><span className={`link-wait-indicator ${pending ? 'is-link-pending' : ''}`} aria-hidden="true" />{pending && <span role="status" className="screen-reader">Abriendo…</span>}</>
}

export default function Enlace({ children, className = '', ...props }: ComponentProps<typeof Link>) {
  return <Link {...props} className={`interactive-link ${className}`}>{children}<EstadoEnlace /></Link>
}
