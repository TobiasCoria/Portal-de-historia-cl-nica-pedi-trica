import Link from '@/app/components/enlace'
import { CalendarDays, Users, ArrowUpRight, Clock3, Sprout, Syringe, CheckCircle2 } from 'lucide-react'
import Nav from '@/app/components/nav'
import TurnoFila from '@/app/components/turno-fila'
import { leerAgenda } from '@/lib/agenda-vista'
import { fechaHoy, fechaCorta } from '@/lib/fechas'
import { requireUser } from '@/lib/auth'
import { obtenerResumenPendientes } from '@/lib/agenda'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export default async function HoyPage() {
  const hoy = fechaHoy()
  await requireUser()
  const [{ user, turnos }, pacientes, resumen, nav] = await Promise.all([leerAgenda(hoy, 1, false), prisma.paciente.count({ where: { eliminadoEn: null } }), obtenerResumenPendientes(), Nav()])
  const pendientes = turnos.filter(t => t.estado === 'PENDIENTE')
  const alertas = resumen.items
  const atendidos = turnos.filter(t => t.estado === 'ATENDIDO')
  return <div className="min-h-screen p-8"><div className="mx-auto max-w-5xl">{nav}
    <section className="hero-panel"><div><span className="eyebrow">{fechaCorta(hoy)} · Un nuevo día para acompañar</span><h1>Todo listo para<br />cuidar sus historias.</h1><p>{user.rol === 'DOCTORA' ? 'Tu jornada, tus pacientes y lo que necesita atención. Empezá por el próximo encuentro.' : 'Organizá los turnos, recibí a cada familia y mantené el consultorio en movimiento.'}</p><Link href="/agenda" className="btn btn-outline mt-6">Ver agenda completa<ArrowUpRight size={13} /></Link></div><svg className="hero-art" viewBox="0 0 150 140" fill="none" aria-hidden="true"><path d="M72 130V55M72 91C21 94 15 61 25 35c29-3 52 20 47 56ZM73 60C66 18 94 4 124 15c5 31-12 52-51 45Z" stroke="currentColor" strokeWidth="1.3" /><path d="M78 111c17-26 39-21 48-5-6 22-33 28-48 5Z" fill="currentColor" opacity=".2" /><circle cx="34" cy="114" r="10" stroke="currentColor" opacity=".5" /></svg></section>
    <div className="metric-grid">{[{ icon: CalendarDays, value: turnos.filter(t => t.estado !== 'CANCELADO').length, label: 'Turnos para hoy' }, { icon: CheckCircle2, value: atendidos.length, label: 'Encuentros atendidos' }, { icon: Users, value: pacientes, label: 'Historias que acompañamos' }].map(m => <div className="card metric-card" key={m.label}><span className="metric-icon"><m.icon size={21} strokeWidth={1.5} /></span><div><p className="metric-value">{m.value}</p><p className="metric-label">{m.label}</p></div></div>)}</div>
    <div className="dashboard-columns"><section className="card"><div className="section-heading"><div><p className="eyebrow">El ritmo del consultorio</p><h2>Próximos encuentros</h2></div><span className="badge">{pendientes.length} pendientes</span></div>{pendientes.length ? pendientes.map(t => <TurnoFila key={t.id} turno={t} doctora={user.rol === 'DOCTORA'} compacto />) : <div className="empty-state"><Sprout size={30} /><h3>Un espacio para lo que viene</h3><p>No hay turnos pendientes para hoy. Podés agendar un nuevo encuentro desde la agenda.</p><Link href="/agenda" className="btn btn-outline mt-5">Organizar agenda</Link></div>}<div className="mt-5 border-t border-[#edf0eb] pt-4"><Link href={`/agenda?fecha=${hoy}`} className="btn-link">Ver el día completo<ArrowUpRight size={13} /></Link></div></section>
    <aside><section className="card mb-5"><div className="section-heading"><div><p className="eyebrow">Para tener presente</p><h2>Necesitan atención</h2></div><Clock3 size={18} className="text-[#a28d66]" /></div>{alertas.length ? alertas.slice(0, 4).map(i => <Link key={`${i.tipo}-${i.id}`} className="block border-b border-[#edf0eb] py-4 last:border-0" href={`/pacientes/${i.pacienteId}?seccion=${i.tipo === 'vacuna' ? 'vacunas' : 'turnos'}`}><span className={`badge ${i.vencido ? 'badge-pink' : 'badge-amber'}`}>{i.tipo === 'vacuna' ? <Syringe size={10} /> : <CalendarDays size={10} />}{i.vencido ? 'Pendiente vencido' : 'En las próximas 24 h'}</span><p className="mt-2 text-xs font-medium">{i.paciente.nombre} {i.paciente.apellido}</p><p className="mt-1 text-[11px] text-[#8c9994]">{i.titulo} · {fechaCorta(i.fecha)}</p></Link>) : <p className="py-4 text-xs text-[#82958b]">No hay pendientes urgentes. Todo en orden por acá.</p>}{resumen.total > 4 && <Link href="/agenda?pendientes=1" className="btn-link mt-4">Ver los {resumen.total} pendientes</Link>}</section><div className="rounded-2xl border border-[#e1e7dc] bg-[#eef1e6] p-6"><Sprout size={23} className="mb-3 text-[#8a9c77]" /><h2 className="text-xl">Cuidar también es acompañar.</h2><p className="mt-3 text-xs leading-6 text-[#85937a]">Cada encuentro suma una página a una historia que crece.</p></div></aside></div>
  </div></div>
}
