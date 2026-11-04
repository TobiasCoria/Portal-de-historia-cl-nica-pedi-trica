import { obtenerPaciente } from '@/app/pacientes/lecturas'
import { edad, fechaCorta } from '@/lib/fechas'
import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from '@/app/components/enlace'
import { HeartPulse, ArrowUpRight } from 'lucide-react'
export default async function PacienteContexto({ id, mostrarUltimaConsulta = false }: { id: string; mostrarUltimaConsulta?: boolean }) {
  if (mostrarUltimaConsulta) await requireRole('DOCTORA')
  const p = await obtenerPaciente(id)
  if (!p) notFound()
  const ultima = mostrarUltimaConsulta ? await prisma.consulta.findFirst({ where: { pacienteId: id, eliminadoEn: null }, orderBy: [{ fecha: 'desc' }, { id: 'desc' }], select: { id: true, motivo: true, fecha: true } }) : null
  return <aside className="card form-aside"><p className="eyebrow">Estás acompañando a</p><span className="initial-avatar blue mb-4">{p.nombre.charAt(0)}{p.apellido.charAt(0)}</span><h2 className="text-xl">{p.nombre} {p.apellido}</h2><p className="mt-2">{edad(p.fechaNac)} · DNI {p.dni}</p><p className="mt-4">{p.particular ? 'Atención particular' : p.obraSocial || 'Sin cobertura registrada'}</p>{p.alergias && <div className="mt-5 rounded-lg bg-[#fbedf2] p-3 text-xs text-[#b15075]"><HeartPulse size={14} className="mb-2" /><strong>Alergias</strong><p className="!text-[#b15075]">{p.alergias}</p></div>}<div className="mt-5">{ultima && <><p className="eyebrow">Última consulta · {fechaCorta(ultima.fecha)}</p><p>{ultima.motivo}</p><Link href={`/pacientes/${id}/consultas/${ultima.id}/cierre`} className="btn-link mt-3">Ver consulta y documentos<ArrowUpRight size={12} /></Link></>}</div><Link href={`/pacientes/${id}`} className="btn-link mt-5">Volver a su ficha<ArrowUpRight size={12} /></Link></aside>
}
