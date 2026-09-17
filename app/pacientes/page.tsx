import Link from 'next/link'
import { UserPlus, Search, Pencil, Trash2, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { listarPacientes, eliminarPaciente } from './actions'
import { obtenerAgendaProxima } from '@/lib/agenda'
import Nav from '../components/nav'
import ConfirmarEliminar from '../components/confirmar-eliminar'

export default async function PacientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const supabase = await createClient()

  const [{ data: { user } }, pacientes, agenda] = await Promise.all([
    supabase.auth.getUser(),
    listarPacientes(q),
    obtenerAgendaProxima(),
  ])

  const cantidadUrgentes = agenda.filter((i) => i.vencido || i.urgente).length

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <Nav />

        {cantidadUrgentes > 0 && (
          <Link
            href="/agenda"
            className="card card-alerta-roja mb-8 flex items-center justify-between text-sm text-[#1c2521] hover:opacity-90"
          >
            <span>
              ⚠ Tenés {cantidadUrgentes} pendiente{cantidadUrgentes > 1 ? 's' : ''} vencido
              {cantidadUrgentes > 1 ? 's' : ''} o por vencer en menos de 24hs
            </span>
            <span className="flex items-center gap-1 font-medium text-[#c4433a]">
              Ver agenda <ArrowRight size={14} />
            </span>
          </Link>
        )}

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl">Pacientes</h1>
            <p className="text-sm text-[#5b6b64]">Sesión iniciada como: {user?.email}</p>
          </div>
          <Link href="/pacientes/nuevo" className="btn btn-primary">
            <UserPlus size={16} />
            Nuevo paciente
          </Link>
        </div>

        <form method="GET" className="relative mb-6 max-w-sm">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa5a0]" />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Buscar por nombre, apellido o DNI..."
            className="input"
            style={{ paddingLeft: '2.25rem' }}
          />
        </form>

        {pacientes.length === 0 ? (
          <div className="card text-center text-[#5b6b64]">
            {q
              ? `No se encontraron pacientes para "${q}".`
              : 'Todavía no hay pacientes cargados. Hacé click en "Nuevo paciente" para empezar.'}
          </div>
        ) : (
          <div className="card overflow-hidden p-0">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[#e3e7e2] text-[#5b6b64]">
                  <th className="px-4 py-3 font-medium">Apellido</th>
                  <th className="px-4 py-3 font-medium">Nombre</th>
                  <th className="px-4 py-3 font-medium">DNI</th>
                  <th className="px-4 py-3 font-medium">Fecha nac.</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {pacientes.map((p) => (
                  <tr key={p.id} className="border-b border-[#e3e7e2] last:border-0">
                    <td className="px-4 py-3">
                      <Link href={`/pacientes/${p.id}`} className="btn-link">
                        {p.apellido}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{p.nombre}</td>
                    <td className="px-4 py-3">{p.dni}</td>
                    <td className="px-4 py-3">{new Date(p.fechaNac).toLocaleDateString('es-AR')}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/pacientes/${p.id}/editar`} className="action-btn">
                          <Pencil size={13} />
                          Editar
                        </Link>
                        <ConfirmarEliminar mensaje={`¿Eliminar a ${p.nombre} ${p.apellido}? El paciente y su historia clínica quedarán ocultos, pero se conservan en el sistema.`}>
                          <form action={eliminarPaciente.bind(null, p.id)}>
                            <button type="submit" className="action-btn-danger">
                              <Trash2 size={13} />
                              Eliminar
                            </button>
                          </form>
                        </ConfirmarEliminar>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}