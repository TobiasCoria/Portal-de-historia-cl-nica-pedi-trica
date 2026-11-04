import PacienteContexto from '@/app/components/paciente-contexto'
import { requireRole } from '@/lib/auth'
import Nav from '@/app/components/nav'
import Volver from '@/app/components/volver'
import FormularioVacuna from './formulario'

export default async function NuevaVacunaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireRole('DOCTORA')
  const { id } = await params

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-2xl">
        <Nav />
        <Volver href={`/pacientes/${id}`} />
        <h1 className="mb-7">Registrar vacuna</h1>
        <div className="form-columns"><div className="form-panel"><FormularioVacuna pacienteId={id} /></div><PacienteContexto id={id} /></div>
      </div>
    </div>
  )
}