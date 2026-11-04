'use client'
import Link from 'next/link'
import { CloudOff } from 'lucide-react'
export default function ErrorPortal({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <main className="flex min-h-screen items-center justify-center p-8"><section className="card max-w-lg text-center"><CloudOff size={35} className="mx-auto mb-5 text-[#8bada0]" /><p className="eyebrow">Hagamos una pausa</p><h1 className="!text-3xl">No pudimos cargar este espacio</h1><p className="page-description">Puede ser un problema de conexión. Si estabas completando un formulario, revisá si el registro se guardó antes de repetirlo.</p><div className="flex justify-center gap-3"><button className="btn btn-primary" onClick={() => retry()}>Volver a intentar</button><Link className="btn btn-outline" href="/hoy">Ir al inicio</Link></div></section></main>
}
