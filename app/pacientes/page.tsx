import Link from 'next/link'
import { Plus, Search, ArrowUpRight, Users } from 'lucide-react'
import Nav from '@/app/components/nav'
import { requireUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { edad } from '@/lib/fechas'
import type { Prisma } from '@prisma/client'

export default async function PacientesPage({ searchParams }: { searchParams: Promise<{ q?: string; pagina?: string; cobertura?: string }> }) {
  await requireUser()
  const params = await searchParams
  const q = (params.q || '').trim().slice(0, 100)
  const cobertura = params.cobertura === 'particular' || params.cobertura === 'cobertura' ? params.cobertura : ''
  const solicitada = Math.max(1, Math.min(100000, Number.parseInt(params.pagina || '1') || 1))
  const where: Prisma.PacienteWhereInput = { eliminadoEn: null,
    ...(q ? { OR: [{ nombre: { contains: q, mode: 'insensitive' } }, { apellido: { contains: q, mode: 'insensitive' } }, { dni: { contains: q } }] } : {}),
    ...(cobertura ? { particular: cobertura === 'particular' } : {}),
  }
  const total = await prisma.paciente.count({ where })
  const paginas = Math.max(1, Math.ceil(total / 12)), pagina = Math.min(solicitada, paginas)
  const pacientes = await prisma.paciente.findMany({ where, skip: (pagina - 1) * 12, take: 12,
    orderBy: [{ apellido: 'asc' }, { nombre: 'asc' }, { id: 'asc' }],
    select: { id: true, nombre: true, apellido: true, dni: true, fechaNac: true, tutorNombre: true, obraSocial: true, particular: true, esDemo: true },
  })
  const href = (p: number) => `/pacientes?${new URLSearchParams({ q, cobertura, pagina: String(p) })}`
  return <div className="min-h-screen p-8"><div className="mx-auto max-w-5xl"><Nav />
    <div className="page-heading"><div><p className="eyebrow">Personas e historias</p><h1>Pacientes</h1><p className="page-description">Cada historia, a un paso. Encontrá a quien necesitás y continuá su atención.</p></div><span className="badge badge-green"><Users size={12} />{total} {total === 1 ? 'paciente' : 'pacientes'}</span></div>
    <form className="toolbar" method="GET"><div className="search-field"><Search size={16} /><label htmlFor="busqueda-paciente" className="screen-reader">Nombre, apellido o DNI</label><input id="busqueda-paciente" name="q" defaultValue={q} placeholder="Buscá por nombre, apellido o DNI…" className="input" /></div><div className="flex gap-2"><label htmlFor="cobertura" className="screen-reader">Cobertura</label><select id="cobertura" name="cobertura" defaultValue={cobertura} className="input"><option value="">Todas las coberturas</option><option value="particular">Particulares</option><option value="cobertura">Con cobertura</option></select><button className="btn btn-outline">Buscar</button>{(q || cobertura) && <Link className="btn btn-link" href="/pacientes">Limpiar</Link>}</div></form>
    <section className="card table-card" aria-label="Listado de pacientes">{pacientes.length ? <><table className="patient-table"><thead><tr><th>Paciente</th><th>Edad / DNI</th><th>Tutor</th><th>Cobertura</th><th><span className="screen-reader">Acciones</span></th></tr></thead><tbody>{pacientes.map((p, i) => <tr key={p.id}><td><Link className="patient-name" href={`/pacientes/${p.id}`}><span className={`initial-avatar ${i % 3 === 0 ? 'blue' : i % 3 === 1 ? 'pink' : ''}`}>{p.nombre.charAt(0)}{p.apellido.charAt(0)}</span><span>{p.nombre} {p.apellido}<small>{p.esDemo ? 'Paciente ficticio · demostración' : 'Historia clínica pediátrica'}</small></span></Link></td><td data-label="Edad y DNI">{edad(p.fechaNac)}<p className="text-[10px] text-[#91a09b]">{p.dni}</p></td><td data-label="Tutor">{p.tutorNombre || 'Sin registrar'}</td><td data-label="Cobertura"><span className={`badge ${p.particular ? 'badge-muted' : ''}`}>{p.particular ? 'Particular' : p.obraSocial || 'Sin registrar'}</span></td><td><Link className="action-btn" href={`/pacientes/${p.id}`} aria-label={`Abrir ficha de ${p.nombre} ${p.apellido}`}>Ver ficha<ArrowUpRight size={12} /></Link></td></tr>)}</tbody></table><footer className="table-footer"><span>Mostrando {(pagina - 1) * 12 + 1}–{Math.min(pagina * 12, total)} de {total}</span><div className="flex items-center gap-3">{pagina > 1 && <Link className="action-btn" href={href(pagina - 1)}>Anterior</Link>}<span>{pagina} / {paginas}</span>{pagina < paginas && <Link className="action-btn" href={href(pagina + 1)}>Siguiente</Link>}</div></footer></> : <div className="empty-state"><Users size={28} /><h3>{q || cobertura ? 'No encontramos coincidencias' : 'Las primeras historias empiezan acá'}</h3><p>{q || cobertura ? 'Probá con otro nombre, DNI o filtro.' : 'Agregá un paciente para empezar a acompañarlo.'}</p><Link href="/pacientes/nuevo" className="btn btn-primary mt-5"><Plus size={14} />Nuevo paciente</Link></div>}</section>
    <p className="mt-5 text-[10px] text-[#95a29c]">Los registros identificados como demostración contienen datos ficticios.</p>
  </div></div>
}
