import { requireRole } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { obtenerVacuna } from '../../lecturas'
import Nav from '@/app/components/nav'
import Volver from '@/app/components/volver'
import FormularioEdicionVacuna from './formulario'

export default async function EditarVacunaPage({
  params,
}: {
  params: Promise<{ id: string; vacunaId: string }>
}) {
  await requireRole('DOCTORA')
  const { id, vacunaId } = await params
  const vacuna = await obtenerVacuna(id, vacunaId)

  if (!vacuna) notFound()

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-2xl">
        <Nav />
        <Volver href={`/pacientes/${id}`} />
        <h1 className="mb-6 text-2xl">Editar vacuna</h1>
        <FormularioEdicionVacuna pacienteId={id} vacuna={vacuna} />
      </div>
    </div>
  )
}