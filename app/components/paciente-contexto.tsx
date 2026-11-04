import { obtenerPaciente } from '@/app/pacientes/lecturas'
import { edad } from '@/lib/fechas'
import { notFound } from 'next/navigation'
import Link from '@/app/components/enlace'
import { HeartPulse, ArrowUpRight } from 'lucide-react'
export default async function PacienteContexto({ id }: { id: string }) {
  const p = await obtenerPaciente(id)
  if (!p) notFound()
  return <aside className="card form-aside"><p className="eyebrow">Estás acompañando a</p><span className="initial-avatar blue mb-4">{p.nombre.charAt(0)}{p.apellido.charAt(0)}</span><h2 className="text-xl">{p.nombre} {p.apellido}</h2><p className="mt-2">{edad(p.fechaNac)} · DNI {p.dni}</p><p className="mt-4">{p.particular ? 'Atención particular' : p.obraSocial || 'Sin cobertura registrada'}</p>{p.alergias && <div className="mt-5 rounded-lg bg-[#fbedf2] p-3 text-xs text-[#b15075]"><HeartPulse size={14} className="mb-2" /><strong>Alergias</strong><p className="!text-[#b15075]">{p.alergias}</p></div>}<Link href={`/pacientes/${id}`} className="btn-link mt-5">Volver a su ficha<ArrowUpRight size={12} /></Link></aside>
}
