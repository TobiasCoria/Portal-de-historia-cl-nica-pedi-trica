import Link from '@/app/components/enlace'
import { ArrowUpRight, Check, CalendarClock } from 'lucide-react'
import { horaLocal } from '@/lib/fechas'
import { cancelarTurno, marcarAusente } from '@/app/pacientes/[id]/turnos/actions'
import ConfirmarEliminar from './confirmar-eliminar'

export type TurnoVista = {
  id: string; pacienteId: string; fecha: Date; motivo: string | null; duracion: number;
  estado: string; paciente: { nombre: string; apellido: string; alergias?: string | null; esDemo?: boolean }
}
export default function TurnoFila({ turno: t, doctora, compacto = false }: { turno: TurnoVista; doctora: boolean; compacto?: boolean }) {
  return <article className="appointment-row"><div className="appointment-time">{horaLocal(t.fecha)}<small>{t.duracion} min</small></div><span className="initial-avatar blue">{t.paciente.nombre.charAt(0)}{t.paciente.apellido.charAt(0)}</span><div className="appointment-info"><Link href={`/pacientes/${t.pacienteId}`}><strong>{t.paciente.nombre} {t.paciente.apellido}</strong></Link><p>{t.motivo || 'Consulta pediátrica'}{t.paciente.esDemo ? ' · Demostración' : ''}</p>{doctora && t.paciente.alergias && <span className="badge badge-pink mt-2">Alergias: {t.paciente.alergias}</span>}</div>
    {t.estado === 'PENDIENTE' ? <div className="patient-actions">
      {doctora ? <Link className="action-btn" href={`/pacientes/${t.pacienteId}/consultas/nueva?turnoId=${t.id}`}>Atender<ArrowUpRight size={12} /></Link> : <Link className="action-btn" href={`/pacientes/${t.pacienteId}`}>Ver ficha<ArrowUpRight size={12} /></Link>}
      {!compacto && <><Link className="action-btn" href={`/pacientes/${t.pacienteId}/turnos/${t.id}/editar`} title="Reprogramar turno"><CalendarClock size={12} />Reprogramar</Link><ConfirmarEliminar mensaje="¿Cancelar este turno? Va a quedar registrado como cancelado."><form action={cancelarTurno.bind(null, t.pacienteId, t.id)}><button className="action-btn-danger">Cancelar</button></form></ConfirmarEliminar>{t.fecha < new Date() && <ConfirmarEliminar mensaje="¿Marcar este turno como ausente?"><form action={marcarAusente.bind(null, t.pacienteId, t.id)}><button className="action-btn">Ausente</button></form></ConfirmarEliminar>}</>}
    </div> : <span className={`badge ${t.estado === 'ATENDIDO' ? 'badge-green' : 'badge-muted'}`}>{t.estado === 'ATENDIDO' && <Check size={11} />}{({ ATENDIDO: 'Atendido', CANCELADO: 'Cancelado', AUSENTE: 'Ausente' } as Record<string, string>)[t.estado] || t.estado}</span>}
  </article>
}
