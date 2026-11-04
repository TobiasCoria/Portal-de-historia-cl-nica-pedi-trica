import 'server-only'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth'
import { diaLocal, sumarDias } from '@/lib/fechas'

export async function leerAgenda(fecha: string, dias = 1) {
  const user = await requireUser()
  const inicio = diaLocal(fecha), fin = diaLocal(sumarDias(fecha, dias))
  const [turnos, vacunas] = await Promise.all([
    prisma.turno.findMany({ where: { fecha: { gte: inicio, lt: fin }, paciente: { eliminadoEn: null } },
      orderBy: [{ fecha: 'asc' }, { id: 'asc' }], include: { paciente: { select: {
        id: true, nombre: true, apellido: true, dni: true, fechaNac: true, esDemo: true, alergias: user.rol === 'DOCTORA',
      } } },
    }),
    user.rol === 'DOCTORA' ? prisma.vacunaAplicada.findMany({
      where: { eliminadoEn: null, fechaAplicada: null, fechaProgramada: { gte: new Date(fecha), lt: new Date(sumarDias(fecha, dias)) }, paciente: { eliminadoEn: null } },
      orderBy: { fechaProgramada: 'asc' }, include: { paciente: { select: { id: true, nombre: true, apellido: true } } },
    }) : Promise.resolve([]),
  ])
  return { user, turnos, vacunas }
}
