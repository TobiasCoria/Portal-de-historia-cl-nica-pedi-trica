import { notFound } from 'next/navigation'
import { obtenerTurno } from '../../actions'
import Nav from '@/app/components/nav'
import Volver from '@/app/components/volver'
import FormularioEdicionTurno from './formulario'

export default async function EditarTurnoPage({
  params,
}: {
  params: Promise<{ id: string; turnoId: string }>
}) {
  const { id, turnoId } = await params
  const turno = await obtenerTurno(turnoId)

  if (!turno) notFound()

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-2xl">
        <Nav />
        <Volver href={`/pacientes/${id}`} />
        <h1 className="mb-6 text-2xl">Editar turno</h1>
        <FormularioEdicionTurno pacienteId={id} turno={turno} />
      </div>
    </div>
  )
}