import Nav from '@/app/components/nav'
import Volver from '@/app/components/volver'
import FormularioVacuna from './formulario'

export default async function NuevaVacunaPage({
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
        <h1 className="mb-6 text-2xl">Registrar vacuna</h1>
        <FormularioVacuna pacienteId={id} />
      </div>
    </div>
  )
}