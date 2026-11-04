import PacienteContexto from '@/app/components/paciente-contexto'
import { requireRole } from '@/lib/auth'
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
  await requireRole('DOCTORA')
  const { id } = await params
  const { turnoId } = await searchParams

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-2xl">
        <Nav />
        <Volver href={`/pacientes/${id}`} />
        <h1 className="mb-7">Nueva consulta</h1><nav className="consulta-pasos" aria-label="Pasos de la atención"><span>1 · Resumen a la vista</span><strong aria-current="step">2 · Registrar consulta</strong><span>3 · Próxima cita al guardar</span></nav>
        <div className="form-columns"><div className="form-panel"><FormularioConsulta pacienteId={id} turnoId={turnoId} /></div><PacienteContexto id={id} mostrarUltimaConsulta /></div>
      </div>
    </div>
  )
}