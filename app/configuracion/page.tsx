import Nav from '@/app/components/nav'
import { requireRole } from '@/lib/auth'
import { obtenerPerfil } from '@/lib/perfiles-data'
import FormularioProfesional from './formulario'
export default async function ConfiguracionPage() {
  const user = await requireRole('DOCTORA'), perfil = await obtenerPerfil(user.email!)
  return <div className="min-h-screen p-8"><div className="mx-auto max-w-5xl"><Nav /><div className="page-heading"><div><p className="eyebrow">Tu identidad, tu espacio</p><h1>Consultorio</h1><p className="page-description">Completá los datos con los que acompañás y documentás cada atención.</p></div></div><FormularioProfesional nombre={perfil?.nombre || ''} matricula={perfil?.matricula || ''} /><p className="mt-5 text-xs text-[#8b9d92]">Cuenta profesional: {user.email}. La foto de perfil se cambia tocando el avatar.</p></div></div>
}
