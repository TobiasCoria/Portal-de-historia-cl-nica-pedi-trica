import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { requireDoctora } from '@/lib/auth'
import Nav from '@/app/components/nav'

export const dynamic = 'force-dynamic'

export default async function AuditoriaPage({ searchParams }: {
  searchParams: Promise<{ antes?: string }>
}) {
  await requireDoctora()
  const { antes } = await searchParams
  const cursor = antes && /^[\da-f-]{36}$/i.test(antes) ? antes : undefined
  const registros = await prisma.logAuditoria.findMany({
    orderBy: [{ fecha: 'desc' }, { id: 'desc' }], take: 51,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: { id: true, fecha: true, usuarioEmail: true, accion: true, entidad: true, entidadId: true, pacienteId: true },
  })
  const pagina = registros.slice(0, 50)
  return <div className="min-h-screen p-8"><div className="mx-auto max-w-5xl">
    <Nav />
    <h1 className="mb-3 text-2xl">Auditoría</h1>
    <p className="mb-6 text-sm text-[#5b6b64]">Actividad registrada. Se muestran identificadores, sin contenido clínico.</p>
    {pagina.length === 0 ? <div className="card">Todavía no hay actividad en esta página.</div> :
      <div className="space-y-3">{pagina.map(r => <article key={r.id} className="card break-words text-sm">
        <p className="font-medium">{r.accion} · {r.entidad}</p>
        <p>{r.fecha.toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })} · {r.usuarioEmail}</p>
        <p className="text-[#5b6b64]">Registro: {r.entidadId}</p>
        {r.pacienteId && <p className="text-[#5b6b64]">Paciente: {r.pacienteId}</p>}
      </article>)}</div>}
    <div className="mt-6 flex gap-4">
      {cursor && <Link className="btn btn-outline" href="/auditoria">Volver al inicio</Link>}
      {registros.length > 50 && <Link className="btn btn-outline" href={`/auditoria?antes=${pagina.at(-1)!.id}`}>Ver anteriores</Link>}
    </div>
  </div></div>
}
