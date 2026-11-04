import Nav from '@/app/components/nav'
import { requireUser } from '@/lib/auth'
import { listarPaginaPacientes } from '@/lib/listado-pacientes'
import DirectorioPacientes from './directorio'

export default async function PacientesPage({ searchParams }: { searchParams: Promise<{ q?: string; pagina?: string; cobertura?: string }> }) {
  await requireUser()
  const params = await searchParams
  const [resultado, nav] = await Promise.all([listarPaginaPacientes(params), Nav()])
  return <div className="min-h-screen p-8"><div className="mx-auto max-w-5xl">{nav}<DirectorioPacientes key={JSON.stringify(resultado.filtros)} inicial={resultado} /></div></div>
}
