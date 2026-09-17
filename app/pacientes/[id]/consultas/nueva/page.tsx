import Nav from '@/app/components/nav'
import Volver from '@/app/components/volver'
import FormularioConsulta from './formulario'

export default async function NuevaConsultaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ turnoId?: string }>
}) {
  const { id } = await params
  const { turnoId } = await searchParams

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-2xl">
        <Nav />
        <Volver href={`/pacientes/${id}`} />
        <h1 className="mb-6 text-2xl">Nueva consulta</h1>
        <FormularioConsulta pacienteId={id} turnoId={turnoId} />
      </div>
    </div>
  )
}