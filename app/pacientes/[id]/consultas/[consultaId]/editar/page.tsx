import { notFound } from 'next/navigation'
import { obtenerConsulta } from '../../actions'
import Nav from '@/app/components/nav'
import Volver from '@/app/components/volver'
import FormularioEdicionConsulta from './formulario'

export default async function EditarConsultaPage({
  params,
}: {
  params: Promise<{ id: string; consultaId: string }>
}) {
  const { id, consultaId } = await params
  const consulta = await obtenerConsulta(consultaId)

  if (!consulta) notFound()

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-2xl">
        <Nav />
        <Volver href={`/pacientes/${id}`} />
        <h1 className="mb-6 text-2xl">Editar consulta</h1>
        <FormularioEdicionConsulta pacienteId={id} consulta={consulta} />
      </div>
    </div>
  )
}