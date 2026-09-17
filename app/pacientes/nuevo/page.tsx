import Nav from '../../components/nav'
import Volver from '@/app/components/volver'
import PacienteWizard from './wizard'

export default function NuevoPacientePage() {
  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-2xl">
        <Nav />
        <Volver href="/pacientes" />
        <h1 className="mb-6 text-2xl">Nuevo paciente</h1>
        <PacienteWizard />
      </div>
    </div>
  )
}