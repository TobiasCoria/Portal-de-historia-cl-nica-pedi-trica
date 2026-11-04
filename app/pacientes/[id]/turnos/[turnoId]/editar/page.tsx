import PacienteContexto from '@/app/components/paciente-contexto'
import { notFound } from 'next/navigation'
import { obtenerTurno } from '../../lecturas'
import Nav from '@/app/components/nav'
import Volver from '@/app/components/volver'
import FormularioEdicionTurno from './formulario'

export default async function EditarTurnoPage({
  params,
}: {
  params: Promise<{ id: string; turnoId: string }>
}) {
  const { id, turnoId } = await params
  const turno = await obtenerTurno(id, turnoId)

  if (!turno) notFound()

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-2xl">
        <Nav />
        <Volver href={`/pacientes/${id}`} />
        <h1 className="mb-7">Editar turno</h1>
        <div className="form-columns"><div className="form-panel"><FormularioEdicionTurno pacienteId={id} turno={turno} /></div><PacienteContexto id={id} /></div>
      </div>
    </div>
  )
}