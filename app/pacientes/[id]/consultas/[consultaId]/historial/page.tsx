import { requireRole } from '@/lib/auth'
import { requirePaciente } from '@/lib/registros'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Nav from '@/app/components/nav'
import Volver from '@/app/components/volver'
import { fechaCorta, horaLocal } from '@/lib/fechas'

export default async function HistorialPage({ params }: { params: Promise<{ id: string; consultaId: string }> }) {
  await requireRole('DOCTORA')
  const { id, consultaId } = await params
  await requirePaciente(id)
  const consulta = await prisma.consulta.findFirst({ where: { id: consultaId, pacienteId: id, eliminadoEn: null }, include: { revisiones: { orderBy: { version: 'desc' } } } })
  if (!consulta) notFound()
  return <div className="min-h-screen p-8"><div className="mx-auto max-w-3xl"><Nav /><Volver href={`/pacientes/${id}?seccion=consultas`} />
    <p className="eyebrow">Trazabilidad clínica</p><h1>Historial de rectificaciones</h1><p className="page-description">Cada versión anterior se conserva junto con el motivo y la persona que realizó el cambio.</p>
    <article className="card mb-4"><span className="badge">Versión actual · {consulta.version}</span><h2 className="mt-3">{consulta.motivo}</h2><p className="whitespace-pre-wrap">{consulta.diagnostico}</p><p className="whitespace-pre-wrap">{consulta.tratamiento}</p><p className="whitespace-pre-wrap">{consulta.observaciones}</p></article>
    {consulta.revisiones.map(r => <article className="card mb-4" key={r.id}><span className="badge badge-amber">Versión anterior · {r.version}</span>
      <p className="mt-3 text-sm">{fechaCorta(r.fecha)} · {horaLocal(r.fecha)} · {r.usuarioEmail}</p><p className="my-3"><strong>Motivo del cambio:</strong> {r.motivo}</p>
      <dl className="detail-grid">{Object.entries(r.snapshot as Record<string, unknown>).map(([campo, valor]) => <div key={campo}><dt>{campo}</dt><dd className="whitespace-pre-wrap">{valor == null ? 'Sin registrar' : String(valor)}</dd></div>)}</dl></article>)}
    {!consulta.revisiones.length && <p className="card">Esta consulta todavía no tiene rectificaciones.</p>}
  </div></div>
}
