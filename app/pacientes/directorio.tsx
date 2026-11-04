'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from '@/app/components/enlace'
import { Search, X, ArrowUpRight, Users, Plus, LoaderCircle } from 'lucide-react'
import { edad } from '@/lib/fechas'
import { claveFiltros, type FiltrosPacientes, type PaginaPacientes } from '@/lib/pacientes-tipos'

export default function DirectorioPacientes({ inicial }: { inicial: PaginaPacientes }) {
  const [filtros, setFiltros] = useState(inicial.filtros), [resultado, setResultado] = useState(inicial)
  const [error, setError] = useState<{ clave: string; mensaje: string } | null>(null), [intento, setIntento] = useState(0)
  const secuencia = useRef(0), controlador = useRef<AbortController | null>(null)
  const router = useRouter(), clave = claveFiltros(filtros), aplicado = claveFiltros(resultado.filtros)
  const pendiente = clave !== aplicado && error?.clave !== clave

  function cambiar(cambio: Partial<FiltrosPacientes>) {
    secuencia.current++; controlador.current?.abort(); setError(null)
    setFiltros(f => ({ ...f, ...cambio, pagina: 1 }))
  }

  useEffect(() => {
    const query = new URLSearchParams({ q: filtros.q.trim(), cobertura: filtros.cobertura, pagina: String(filtros.pagina) })
    if (clave === aplicado) {
      window.history.replaceState(null, '', `/pacientes?${query}`)
      return
    }
    const actual = ++secuencia.current, abort = new AbortController()
    controlador.current = abort
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/pacientes?${query}`, { signal: abort.signal, cache: 'no-store', credentials: 'same-origin' })
        if (actual !== secuencia.current || abort.signal.aborted) return
        if (response.redirected && new URL(response.url).pathname === '/login') { router.replace('/login'); return }
        if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) throw new Error('No disponible')
        const datos = await response.json() as PaginaPacientes
        if (actual !== secuencia.current || abort.signal.aborted) return
        setResultado(datos)
        if (datos.pagina !== filtros.pagina) setFiltros(f => ({ ...f, pagina: datos.pagina }))
        query.set('pagina', String(datos.pagina))
        window.history.replaceState(null, '', `/pacientes?${query}`)
      } catch {
        if (actual === secuencia.current && !abort.signal.aborted) setError({ clave, mensaje: 'No pudimos actualizar la búsqueda. Los resultados de abajo son los anteriores.' })
      }
    }, 250)
    return () => { clearTimeout(timer); abort.abort() }
  }, [filtros, clave, aplicado, intento, router])

  const { pacientes, total, pagina, paginas } = resultado
  const href = (p: number) => `/pacientes?${new URLSearchParams({ q: filtros.q.trim(), cobertura: filtros.cobertura, pagina: String(p) })}`
  return <>
    <div className="page-heading"><div><p className="eyebrow">Personas e historias</p><h1>Pacientes</h1><p className="page-description">Cada historia, a un paso. Encontrá a quien necesitás y continuá su atención.</p></div><span className="badge badge-green"><Users size={12} />{total} {total === 1 ? 'paciente' : 'pacientes'}</span></div>
    <form className="toolbar directorio-filtros" onSubmit={e => { e.preventDefault(); setError(null); setIntento(i => i + 1) }} role="search" aria-label="Filtrar pacientes">
      <div className="search-field"><Search size={16} /><label htmlFor="busqueda-paciente" className="screen-reader">Nombre, apellido o DNI</label><input id="busqueda-paciente" name="q" value={filtros.q} onChange={e => cambiar({ q: e.target.value })} maxLength={100} autoComplete="off" aria-controls="resultados-pacientes" placeholder="Escribí nombre, apellido o DNI…" className="input" />{filtros.q && <button type="button" className="search-clear" aria-label="Borrar búsqueda" onClick={() => cambiar({ q: '' })}><X size={14} /></button>}</div>
      <div className="directorio-opciones"><label htmlFor="cobertura" className="screen-reader">Cobertura</label><select id="cobertura" name="cobertura" value={filtros.cobertura} onChange={e => cambiar({ cobertura: e.target.value })} className="input"><option value="">Todas las coberturas</option><option value="particular">Particulares</option><option value="cobertura">Con cobertura</option></select>{(filtros.q || filtros.cobertura) && <button type="button" className="btn btn-outline" onClick={() => cambiar({ q: '', cobertura: '' })}>Limpiar filtros</button>}</div>
    </form>
    <div className="search-status" role="status" aria-live="polite">{pendiente ? <><LoaderCircle size={13} className="search-spinner" />Actualizando resultados…</> : error?.clave === clave ? 'La búsqueda no se pudo actualizar.' : `${total} ${total === 1 ? 'paciente encontrado' : 'pacientes encontrados'} · Se filtra mientras escribís`}</div>
    {error?.clave === clave && <div className="form-error mb-4" role="alert">{error.mensaje}<button type="button" className="btn-link ml-3" onClick={() => { setError(null); setIntento(i => i + 1) }}>Reintentar</button></div>}
    <section id="resultados-pacientes" className={`card table-card ${pendiente ? 'results-updating' : ''}`} aria-label="Listado de pacientes" aria-busy={pendiente}>
      {pacientes.length ? <><table className="patient-table"><thead><tr><th>Paciente</th><th>Edad / DNI</th><th>Tutor</th><th>Cobertura</th><th><span className="screen-reader">Acciones</span></th></tr></thead><tbody>{pacientes.map((p, i) => <tr key={p.id}><td><Link className="patient-name" href={`/pacientes/${p.id}`}><span className={`initial-avatar ${i % 3 === 0 ? 'blue' : i % 3 === 1 ? 'pink' : ''}`}>{p.nombre.charAt(0)}{p.apellido.charAt(0)}</span><span>{p.nombre} {p.apellido}<small>{p.esDemo ? 'Paciente ficticio · demostración' : 'Historia clínica pediátrica'}</small></span></Link></td><td data-label="Edad y DNI">{edad(p.fechaNac)}<p className="text-[10px] text-[#91a09b]">{p.dni}</p></td><td data-label="Tutor">{p.tutorNombre || 'Sin registrar'}</td><td data-label="Cobertura"><span className={`badge ${p.particular ? 'badge-muted' : ''}`}>{p.particular ? 'Particular' : p.obraSocial || 'Sin registrar'}</span></td><td><Link className="action-btn" href={`/pacientes/${p.id}`} aria-label={`Abrir ficha de ${p.nombre} ${p.apellido}`}>Ver ficha<ArrowUpRight size={12} /></Link></td></tr>)}</tbody></table><footer className="table-footer"><span>Mostrando {(pagina - 1) * 12 + 1}–{Math.min(pagina * 12, total)} de {total}</span><div className="flex items-center gap-3">{!pendiente && pagina > 1 && <Link className="action-btn" href={href(pagina - 1)}>Anterior</Link>}<span>{pagina} / {paginas}</span>{!pendiente && pagina < paginas && <Link className="action-btn" href={href(pagina + 1)}>Siguiente</Link>}</div></footer></> : <div className="empty-state"><Users size={28} /><h3>{filtros.q || filtros.cobertura ? 'No encontramos coincidencias' : 'Las primeras historias empiezan acá'}</h3><p>{filtros.q || filtros.cobertura ? 'Probá con otro nombre, DNI o filtro.' : 'Agregá un paciente para empezar a acompañarlo.'}</p><Link href="/pacientes/nuevo" className="btn btn-primary mt-5"><Plus size={14} />Nuevo paciente</Link></div>}
    </section><p className="mt-5 text-[10px] text-[#95a29c]">Los registros identificados como demostración contienen datos ficticios.</p>
  </>
}
