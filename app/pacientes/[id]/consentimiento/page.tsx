import Link from '@/app/components/enlace'
import { requireRole } from '@/lib/auth'
import { obtenerPaciente } from '@/app/pacientes/lecturas'
import { notFound } from 'next/navigation'
import Nav from '@/app/components/nav'
import Volver from '@/app/components/volver'
import FormularioConsentimiento from './formulario'
export default async function ConsentimientoPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole('DOCTORA')
  const { id } = await params, p = await obtenerPaciente(id)
  if (!p) notFound()
  return <div className="min-h-screen p-8"><div className="mx-auto max-w-5xl"><Nav /><Volver href={`/pacientes/${id}`} /><p className="eyebrow">Documentación de su historia</p><h1>Consentimiento</h1><p className="page-description">{p.nombre} {p.apellido} · Tutor: {p.tutorNombre || 'Sin registrar'} · {p.tutorVinculo || 'Vínculo pendiente'}</p>{p.consentimientoAt ? <div className="card"><h2>Ya está registrado</h2><p className="mt-3 text-sm">La evidencia original se conserva. Podés adjuntar documentación adicional desde la ficha.</p><Link className="btn-link mt-4" href={`/pacientes/${id}?seccion=documentos`}>Ir a Documentos</Link></div> : <FormularioConsentimiento pacienteId={id} />}</div></div>
}
