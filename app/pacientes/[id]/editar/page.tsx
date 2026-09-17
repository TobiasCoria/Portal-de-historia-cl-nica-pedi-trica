import { notFound } from 'next/navigation'
import { obtenerPaciente } from '../../actions'
import { prisma } from '@/lib/prisma'
import Nav from '@/app/components/nav'
import Volver from '@/app/components/volver'
import Documentos from '@/app/components/documentos'
import FormularioEdicion from './formulario'

export default async function EditarPacientePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const paciente = await obtenerPaciente(id)

  if (!paciente) notFound()

  const documentos = await prisma.documento.findMany({
    where: { pacienteId: id, consultaId: null },
    orderBy: { creadoEn: 'desc' },
  })

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-2xl">
        <Nav />
        <Volver href={`/pacientes/${id}`} />
        <h1 className="mb-6 text-2xl">
          Editar paciente — {paciente.nombre} {paciente.apellido}
        </h1>

        <FormularioEdicion paciente={paciente} />

        <div className="mt-8">
          <h2 className="mb-3 text-lg font-medium">Documentos</h2>
          <div className="card">
            <Documentos pacienteId={id} documentos={documentos} />
          </div>
        </div>
      </div>
    </div>
  )
}