import Link from 'next/link'
import { Sprout } from 'lucide-react'
export default function NoEncontrado() {
  return <main className="flex min-h-screen items-center justify-center p-8"><section className="card max-w-lg text-center"><Sprout size={35} className="mx-auto mb-5 text-[#8bada0]" /><p className="eyebrow">No encontramos este espacio</p><h1 className="!text-3xl">Sigamos por otro camino</h1><p className="page-description">El registro puede estar oculto, el enlace puede haber cambiado o tu cuenta puede no tener acceso.</p><Link className="btn btn-primary" href="/hoy">Volver al inicio</Link></section></main>
}
