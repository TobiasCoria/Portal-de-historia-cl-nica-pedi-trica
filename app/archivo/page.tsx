import Link from 'next/link'
import { Archive, RotateCcw } from 'lucide-react'
import Nav from '@/app/components/nav'
import ConfirmarEliminar from '@/app/components/confirmar-eliminar'
import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { fechaCorta } from '@/lib/fechas'
import { restaurarRegistro } from './actions'

export const dynamic = 'force-dynamic'
export default async function ArchivoPage({ searchParams }: { searchParams: Promise<{ tipo?: string; pagina?: string }> }) {
  await requireRole('DOCTORA')
  const params = await searchParams
  const tipos = ['Paciente', 'Consulta', 'VacunaAplicada', 'Documento'] as const
  const tipo = tipos.find(t => t === params.tipo) || 'Paciente'
  const pagina = Math.max(1, Math.min(10000, Number.parseInt(params.pagina || '1') || 1))
  const options = { skip: (pagina - 1) * 20, take: 21, orderBy: { eliminadoEn: 'desc' as const } }
  let registros: { id: string; titulo: string; eliminadoEn: Date | null; pacienteId?: string }[] = []
  if (tipo === 'Paciente') registros = (await prisma.paciente.findMany({ ...options, where: { eliminadoEn: { not: null } }, select: { id: true, nombre: true, apellido: true, eliminadoEn: true } })).map(p => ({ ...p, titulo: `${p.nombre} ${p.apellido}` }))
  else if (tipo === 'Consulta') registros = (await prisma.consulta.findMany({ ...options, where: { eliminadoEn: { not: null }, paciente: { eliminadoEn: null } }, select: { id: true, pacienteId: true, fecha: true, eliminadoEn: true, paciente: { select: { nombre: true, apellido: true } } } })).map(c => ({ ...c, titulo: `${c.paciente.nombre} ${c.paciente.apellido} · ${fechaCorta(c.fecha)}` }))
  else if (tipo === 'VacunaAplicada') registros = (await prisma.vacunaAplicada.findMany({ ...options, where: { eliminadoEn: { not: null }, paciente: { eliminadoEn: null } }, select: { id: true, pacienteId: true, nombre: true, eliminadoEn: true, paciente: { select: { nombre: true, apellido: true } } } })).map(v => ({ ...v, titulo: `${v.paciente.nombre} ${v.paciente.apellido} · ${v.nombre}` }))
  else registros = (await prisma.documento.findMany({ ...options, where: { eliminadoEn: { not: null }, paciente: { eliminadoEn: null }, OR: [{ consultaId: null }, { consulta: { eliminadoEn: null } }] }, select: { id: true, pacienteId: true, nombre: true, eliminadoEn: true, paciente: { select: { nombre: true, apellido: true } } } })).map(d => ({ ...d, titulo: `${d.paciente.nombre} ${d.paciente.apellido} · ${d.nombre}` }))
  const etiquetas = { Paciente: 'Pacientes', Consulta: 'Consultas', VacunaAplicada: 'Vacunas', Documento: 'Documentos' }
  return <div className="min-h-screen p-8"><div className="mx-auto max-w-5xl"><Nav /><div className="page-heading"><div><p className="eyebrow">La historia se conserva</p><h1>Archivo</h1><p className="page-description">Revisá y recuperá los registros que quedaron ocultos.</p></div><Archive size={30} className="text-[#90ab9d]" /></div><nav className="patient-tabs" aria-label="Tipos de archivo">{tipos.map(t => <Link key={t} href={`/archivo?tipo=${t}`} className={t === tipo ? 'active' : ''}>{etiquetas[t]}</Link>)}</nav><p className="form-notice mb-5">Para recuperar un registro de un paciente oculto, recuperá primero al paciente. Para documentos de consultas ocultas, recuperá primero la consulta.</p><section className="card">{registros.length ? registros.slice(0, 20).map(r => <article key={r.id} className="flex flex-wrap items-center justify-between gap-4 border-b border-[#edf0eb] py-5 last:border-0"><div><h3>{r.titulo}</h3><p className="mt-1 text-xs text-[#899c91]">Oculto el {r.eliminadoEn ? fechaCorta(r.eliminadoEn) : ''}</p></div><ConfirmarEliminar mensaje="¿Recuperar este registro? Volverá a estar visible en la ficha correspondiente."><form action={restaurarRegistro.bind(null, tipo, r.id)}><button className="btn btn-outline"><RotateCcw size={13} />Recuperar</button></form></ConfirmarEliminar></article>) : <div className="empty-state"><Archive size={27} /><h3>No hay registros ocultos para mostrar</h3><p>Los registros que ocultes aparecerán en esta sección.</p></div>}</section><div className="mt-5 flex gap-3">{pagina > 1 && <Link className="btn btn-outline" href={`/archivo?tipo=${tipo}&pagina=${pagina - 1}`}>Anterior</Link>}{registros.length > 20 && <Link className="btn btn-outline" href={`/archivo?tipo=${tipo}&pagina=${pagina + 1}`}>Siguiente</Link>}</div></div></div>
}
