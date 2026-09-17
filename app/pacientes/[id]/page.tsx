import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Pencil, Stethoscope, Syringe, Trash2, CalendarPlus, CalendarCheck2 } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import Documentos from '@/app/components/documentos'
import Nav from '@/app/components/nav'
import Volver from '@/app/components/volver'
import ConfirmarEliminar from '@/app/components/confirmar-eliminar'
import { eliminarConsulta } from './consultas/actions'
import { eliminarVacuna } from './vacunas/actions'
import { cancelarTurno } from './turnos/actions'

async function obtenerPacienteConConsultas(id: string) {
  return prisma.paciente.findUnique({
    where: { id },
    include: {
      consultas: { orderBy: { fecha: 'desc' }, include: { documentos: true } },
      vacunas: { orderBy: { fechaProgramada: 'asc' } },
      turnos: { orderBy: { fecha: 'asc' } },
      documentos: { where: { consultaId: null }, orderBy: { creadoEn: 'desc' } },
    },
  })
}

export default async function FichaPacientePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const paciente = await obtenerPacienteConConsultas(id)

  if (!paciente) notFound()

  const turnosPendientes = paciente.turnos.filter((t) => t.estado === 'PENDIENTE')

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-3xl">
        <Nav />
        <Volver href="/pacientes" />

        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-2xl">{paciente.nombre} {paciente.apellido}</h1>
            <p className="text-sm text-[#5b6b64]">
              DNI: {paciente.dni} · Nac.: {new Date(paciente.fechaNac).toLocaleDateString('es-AR')}
            </p>
            {paciente.alergias && (
              <p className="mt-1 text-sm font-medium" style={{ color: '#D6497B' }}>
                ⚠ Alergias: {paciente.alergias}
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <Link href={`/pacientes/${id}/editar`} className="btn btn-outline">
              <Pencil size={15} />
              Editar datos
            </Link>
            <Link href={`/pacientes/${id}/turnos/nuevo`} className="btn btn-outline">
              <CalendarPlus size={15} />
              Agendar turno
            </Link>
            <Link href={`/pacientes/${id}/consultas/nueva`} className="btn btn-primary">
              <Stethoscope size={15} />
              Nueva consulta
            </Link>
          </div>
        </div>

        <div className="mb-10">
          <h2 className="mb-3 text-lg font-medium">Turnos</h2>
          {turnosPendientes.length === 0 ? (
            <p className="text-sm text-[#5b6b64]">Sin turnos pendientes.</p>
          ) : (
            <div className="space-y-2">
              {turnosPendientes.map((t) => {
                const vencido = new Date(t.fecha) < new Date()
                return (
                  <div key={t.id} className={`card flex items-center justify-between text-sm ${vencido ? 'card-alerta-roja' : ''}`}>
                    <div>
                      <span className="font-medium">
                        {new Date(t.fecha).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {t.motivo && <span className="text-[#5b6b64]"> · {t.motivo}</span>}
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/pacientes/${id}/consultas/nueva?turnoId=${t.id}`} className="action-btn">
                        <CalendarCheck2 size={13} />
                        Atender
                      </Link>
                      <Link href={`/pacientes/${id}/turnos/${t.id}/editar`} className="action-btn">
                        <Pencil size={13} />
                        Editar
                      </Link>
                      <ConfirmarEliminar mensaje="¿Cancelar este turno?">
                        <form action={cancelarTurno.bind(null, id, t.id)}>
                          <button type="submit" className="action-btn-danger">
                            <Trash2 size={13} />
                            Cancelar
                          </button>
                        </form>
                      </ConfirmarEliminar>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="mb-10">
          <h2 className="mb-3 text-lg font-medium">Documentos</h2>
          <div className="card">
            <Documentos pacienteId={id} documentos={paciente.documentos} />
          </div>
        </div>

        <div className="mb-10">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-medium">Vacunas</h2>
            <Link href={`/pacientes/${id}/vacunas/nueva`} className="btn-link">
              <Syringe size={15} />
              Registrar vacuna
            </Link>
          </div>

          {paciente.vacunas.length === 0 ? (
            <p className="text-sm text-[#5b6b64]">Sin vacunas registradas.</p>
          ) : (
            <div className="space-y-2">
              {paciente.vacunas.map((v) => {
                const pendiente = v.fechaProgramada && !v.fechaAplicada
                const vencida = pendiente && new Date(v.fechaProgramada!) < new Date()
                return (
                  <div
                    key={v.id}
                    className={`card flex items-center justify-between text-sm ${
                      vencida ? 'card-alerta-roja' : ''
                    }`}
                  >
                    <div>
                      <span className="font-medium">{v.nombre}</span>
                      {v.dosis && <span className="text-[#5b6b64]"> · {v.dosis}</span>}
                      {v.fechaAplicada && (
                        <span className="ml-2 text-[#5b6b64]">
                          Aplicada: {new Date(v.fechaAplicada).toLocaleDateString('es-AR')}
                        </span>
                      )}
                      {pendiente && (
                        <span className={`ml-2 ${vencida ? 'font-medium text-red-600' : 'text-[#5b6b64]'}`}>
                          {vencida ? '⚠ Vencida' : 'Programada'}: {new Date(v.fechaProgramada!).toLocaleDateString('es-AR')}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/pacientes/${id}/vacunas/${v.id}/editar`} className="action-btn">
                        <Pencil size={13} />
                        Editar
                      </Link>
                      <ConfirmarEliminar mensaje={`¿Eliminar el registro de ${v.nombre}?`}>
                        <form action={eliminarVacuna.bind(null, id, v.id)}>
                          <button type="submit" className="action-btn-danger">
                            <Trash2 size={13} />
                            Eliminar
                          </button>
                        </form>
                      </ConfirmarEliminar>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <h2 className="mb-3 text-lg font-medium">Historia clínica</h2>

        {paciente.consultas.length === 0 ? (
          <div className="card text-center text-[#5b6b64]">
            Todavía no hay consultas cargadas para este paciente.
          </div>
        ) : (
          <div className="space-y-4">
            {paciente.consultas.map((c) => (
              <div key={c.id} className="card">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium">{new Date(c.fecha).toLocaleDateString('es-AR')}</span>
                  <div className="flex items-center gap-3">
                    {(c.peso || c.talla) && (
                      <span className="text-sm text-[#5b6b64]">
                        {c.peso ? `${c.peso} kg` : ''} {c.talla ? `· ${c.talla} cm` : ''}
                      </span>
                    )}
                    <div className="flex gap-2">
                      <Link href={`/pacientes/${id}/consultas/${c.id}/editar`} className="action-btn">
                        <Pencil size={13} />
                        Editar
                      </Link>
                      <ConfirmarEliminar mensaje="¿Eliminar esta consulta? Se perderá el registro completo de lo cargado.">
                        <form action={eliminarConsulta.bind(null, id, c.id)}>
                          <button type="submit" className="action-btn-danger">
                            <Trash2 size={13} />
                            Eliminar
                          </button>
                        </form>
                      </ConfirmarEliminar>
                    </div>
                  </div>
                </div>
                <p className="text-sm"><strong>Motivo:</strong> {c.motivo}</p>
                {c.diagnostico && <p className="text-sm"><strong>Diagnóstico:</strong> {c.diagnostico}</p>}
                {c.tratamiento && <p className="text-sm"><strong>Tratamiento:</strong> {c.tratamiento}</p>}
                {c.observaciones && <p className="mt-1 text-sm text-[#5b6b64]">{c.observaciones}</p>}

                <div className="mt-3 border-t border-[#e3e7e2] pt-3">
                  <Documentos pacienteId={id} consultaId={c.id} documentos={c.documentos} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}