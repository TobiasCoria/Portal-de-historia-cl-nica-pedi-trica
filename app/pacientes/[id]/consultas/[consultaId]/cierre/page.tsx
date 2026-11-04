import { notFound } from 'next/navigation'
import { Check, CalendarPlus, ArrowUpRight } from 'lucide-react'
import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { obtenerPaciente } from '@/app/pacientes/lecturas'
import { fechaCorta, horaLocal, edad } from '@/lib/fechas'
import { leerPagina, numeroPagina } from '@/lib/paginacion'
import Nav from '@/app/components/nav'
import Link from '@/app/components/enlace'
import Documentos from '@/app/components/documentos'
import Paginacion from '@/app/components/paginacion'

export default async function CierreConsultaPage({ params, searchParams }: {
  params: Promise<{ id: string; consultaId: string }>; searchParams: Promise<{ pagina?: string }>
}) {
  await requireRole('DOCTORA')
  const { id, consultaId } = await params, query = await searchParams
  const paciente = await obtenerPaciente(id)
  if (!paciente) notFound()
  const consulta = await prisma.consulta.findFirst({ where: { id: consultaId, pacienteId: id, eliminadoEn: null } })
  if (!consulta) notFound()
  const where = { pacienteId: id, consultaId, eliminadoEn: null }
  const [documentos, proximo, nav] = await Promise.all([
    leerPagina(numeroPagina(query.pagina), () => prisma.documento.count({ where }), (skip, take) => prisma.documento.findMany({ where, skip, take, orderBy: [{ creadoEn: 'desc' }, { id: 'desc' }] })),
    prisma.turno.findFirst({ where: { pacienteId: id, estado: 'PENDIENTE', fecha: { gte: new Date() } }, orderBy: [{ fecha: 'asc' }, { id: 'asc' }] }),
    Nav(),
  ])
  return <div className="min-h-screen p-8"><div className="mx-auto max-w-5xl">{nav}
    <div className="page-heading"><div><p className="eyebrow">Encuentro registrado</p><h1>Consulta guardada</h1><p className="page-description">{paciente.nombre} {paciente.apellido} · {edad(paciente.fechaNac)} · {fechaCorta(consulta.fecha)} a las {horaLocal(consulta.fecha)}</p></div><span className="badge badge-green"><Check size={13} />Guardado en su historia</span></div>
    <nav className="consulta-pasos" aria-label="Pasos de la atención"><Link href={`/pacientes/${id}`}>1 · Resumen</Link><span aria-current="step">2 · Consulta guardada</span><Link href={`/pacientes/${id}/turnos/nuevo`}>3 · Próxima cita</Link></nav>
    <div className="summary-grid"><div><section className="card"><h2>{consulta.motivo}</h2><dl className="detail-grid mt-5"><div><dt>Diagnóstico</dt><dd className="whitespace-pre-wrap">{consulta.diagnostico || 'Sin registrar'}</dd></div><div><dt>Tratamiento</dt><dd className="whitespace-pre-wrap">{consulta.tratamiento || 'Sin registrar'}</dd></div></dl><Link className="btn-link mt-5" href={`/pacientes/${id}?seccion=consultas`}>Ver historia de consultas<ArrowUpRight size={13} /></Link></section>
      <section className="card"><div className="section-heading"><div><p className="eyebrow">En el mismo lugar</p><h2>Documentos de esta consulta</h2></div></div><Documentos pacienteId={id} consultaId={consultaId} documentos={documentos.filas} /><Paginacion total={documentos.total} pagina={documentos.pagina} paginas={documentos.paginas} base={`/pacientes/${id}/consultas/${consultaId}/cierre?adjuntos=1`} /></section></div>
      <aside><section className="card"><p className="eyebrow">Continuidad de la atención</p><h2>Próxima cita</h2>{proximo ? <p className="my-4 text-sm">Ya tiene un turno pendiente el <strong>{fechaCorta(proximo.fecha)} a las {horaLocal(proximo.fecha)}</strong>. Revisalo antes de agendar otro.</p> : <p className="my-4 text-sm text-[#657c72]">No tiene un próximo turno registrado. Podés agendarlo ahora o volver a su ficha.</p>}
        <div className="flex flex-col gap-3">{proximo && <Link className="btn btn-outline" href={`/pacientes/${id}/turnos/${proximo.id}/editar`}>Revisar o reprogramar</Link>}<Link className="btn btn-primary" href={`/pacientes/${id}/turnos/nuevo`}><CalendarPlus size={14} />{proximo ? 'Agendar otro turno' : 'Agendar próxima cita'}</Link><Link className="btn btn-outline" href={`/pacientes/${id}`}>Volver al resumen</Link></div></section></aside></div>
  </div></div>
}
