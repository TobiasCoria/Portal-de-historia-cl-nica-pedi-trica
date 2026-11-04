import Link from '@/app/components/enlace'
import { TAMANO_HISTORIAL } from '@/lib/paginacion'

export default function Paginacion({ total, pagina, paginas, base }: { total: number; pagina: number; paginas: number; base: string }) {
  if (!total) return null
  return <nav className="historial-paginacion" aria-label="Páginas del historial">
    <span>Mostrando {(pagina - 1) * TAMANO_HISTORIAL + 1}–{Math.min(pagina * TAMANO_HISTORIAL, total)} de {total}</span>
    <div>{pagina > 1 && <Link className="btn btn-outline" href={`${base}&pagina=${pagina - 1}`}>Anterior</Link>}<span aria-current="page">{pagina} / {paginas}</span>{pagina < paginas && <Link className="btn btn-outline" href={`${base}&pagina=${pagina + 1}`}>Siguiente</Link>}</div>
  </nav>
}
