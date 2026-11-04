import PacienteContexto from '@/app/components/paciente-contexto'
import Nav from '@/app/components/nav'
import Volver from '@/app/components/volver'
import FormularioTurno from './formulario'

export default async function NuevoTurnoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-2xl">
        <Nav />
        <Volver href={`/pacientes/${id}`} />
        <h1 className="mb-7">Agendar turno</h1>
        <div className="form-columns"><div className="form-panel"><FormularioTurno pacienteId={id} /></div><PacienteContexto id={id} /></div>
      </div>
    </div>
  )
}