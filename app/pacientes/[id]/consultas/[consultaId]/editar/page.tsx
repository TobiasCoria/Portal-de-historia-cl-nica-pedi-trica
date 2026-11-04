import PacienteContexto from '@/app/components/paciente-contexto'
import { requireRole } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { obtenerConsulta } from '../../lecturas'
import Nav from '@/app/components/nav'
import Volver from '@/app/components/volver'
import FormularioEdicionConsulta from './formulario'

export default async function EditarConsultaPage({
  params,
}: {
  params: Promise<{ id: string; consultaId: string }>
}) {
  await requireRole('DOCTORA')
  const { id, consultaId } = await params
  const consulta = await obtenerConsulta(id, consultaId)

  if (!consulta) notFound()

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-2xl">
        <Nav />
        <Volver href={`/pacientes/${id}`} />
        <h1 className="mb-7">Editar consulta</h1>
        <div className="form-columns"><div className="form-panel"><FormularioEdicionConsulta pacienteId={id} consulta={consulta} /></div><PacienteContexto id={id} /></div>
      </div>
    </div>
  )
}