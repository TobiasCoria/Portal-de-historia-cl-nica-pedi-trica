import { requireUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { fechaHoy, diaLocal } from '@/lib/fechas'

export async function obtenerAgendaProxima(opciones: { urgentes?: boolean; limite?: number } = {}) {
  const user = await requireUser()
  const ahora = new Date()
  const en24hs = new Date(ahora.getTime() + 24 * 60 * 60 * 1000)
  const en30dias = new Date(ahora.getTime() + 30 * 24 * 60 * 60 * 1000)

  const [vacunas, turnos] = await Promise.all([
    user.rol === 'DOCTORA' ? prisma.vacunaAplicada.findMany({
      where: { eliminadoEn: null, paciente: { eliminadoEn: null }, fechaAplicada: null, fechaProgramada: { not: null, lte: opciones.urgentes ? new Date(fechaHoy(en24hs)) : en30dias } },
      orderBy: [{ fechaProgramada: 'asc' }, { id: 'asc' }], take: opciones.limite,
      select: { id: true, pacienteId: true, nombre: true, dosis: true, fechaProgramada: true, paciente: { select: { id: true, nombre: true, apellido: true, dni: true } } },
    }) : Promise.resolve([]),
    prisma.turno.findMany({
      where: { paciente: { eliminadoEn: null }, estado: 'PENDIENTE', fecha: { lte: opciones.urgentes ? en24hs : en30dias } },
      orderBy: [{ fecha: 'asc' }, { id: 'asc' }], take: opciones.limite,
      select: { id: true, pacienteId: true, motivo: true, fecha: true, paciente: { select: { id: true, nombre: true, apellido: true, dni: true } } },
    }),
  ])

  const items = [
    ...vacunas.map((v) => ({
      tipo: 'vacuna' as const,
      id: v.id,
      pacienteId: v.pacienteId,
      paciente: v.paciente,
      titulo: v.nombre + (v.dosis ? ` (${v.dosis})` : ''),
      fecha: diaLocal(v.fechaProgramada!.toISOString().slice(0, 10)),
      vencido: v.fechaProgramada!.toISOString().slice(0, 10) < fechaHoy(ahora),
      urgente: v.fechaProgramada!.toISOString().slice(0, 10) >= fechaHoy(ahora) && v.fechaProgramada!.toISOString().slice(0, 10) <= fechaHoy(en24hs),
    })),
    ...turnos.map((t) => ({
      tipo: 'turno' as const,
      id: t.id,
      pacienteId: t.pacienteId,
      paciente: t.paciente,
      titulo: t.motivo || 'Turno',
      fecha: t.fecha,
      vencido: t.fecha < ahora,
      urgente: t.fecha >= ahora && t.fecha <= en24hs,
    })),
  ]

  items.sort((a, b) => a.fecha.getTime() - b.fecha.getTime())
  return items
}

export async function obtenerResumenPendientes() {
  const user = await requireUser()
  const en24hs = new Date(Date.now() + 24 * 60 * 60 * 1000)
  const [items, turnos, vacunas] = await Promise.all([
    obtenerAgendaProxima({ urgentes: true, limite: 4 }),
    prisma.turno.count({ where: { paciente: { eliminadoEn: null }, estado: 'PENDIENTE', fecha: { lte: en24hs } } }),
    user.rol === 'DOCTORA' ? prisma.vacunaAplicada.count({ where: {
      eliminadoEn: null, paciente: { eliminadoEn: null }, fechaAplicada: null,
      fechaProgramada: { not: null, lte: new Date(fechaHoy(en24hs)) },
    } }) : Promise.resolve(0),
  ])
  return { items: items.slice(0, 4), total: turnos + vacunas }
}
