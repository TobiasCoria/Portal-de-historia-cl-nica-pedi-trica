import 'server-only'
import { requireUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'
import type { PaginaPacientes } from '@/lib/pacientes-tipos'

export async function listarPaginaPacientes(params: { q?: string; cobertura?: string; pagina?: string }): Promise<PaginaPacientes> {
  await requireUser()
  const q = (params.q || '').trim().slice(0, 100)
  const cobertura = ['particular', 'cobertura'].includes(params.cobertura || '') ? params.cobertura! : ''
  const solicitada = Math.max(1, Math.min(100000, Number.parseInt(params.pagina || '1') || 1))
  const palabras = q.split(/\s+/).filter(Boolean).slice(0, 10)
  const where: Prisma.PacienteWhereInput = { eliminadoEn: null,
    ...(palabras.length ? { AND: palabras.map(palabra => ({ OR: [
      { nombre: { contains: palabra, mode: 'insensitive' as const } },
      { apellido: { contains: palabra, mode: 'insensitive' as const } },
      { dni: { contains: /^[\d.\-]+$/.test(palabra) ? palabra.replace(/[.\-]/g, '') : palabra, mode: 'insensitive' as const } },
    ] })) } : {}),
    ...(cobertura ? { particular: cobertura === 'particular' } : {}),
  }
  const consulta = { where, take: 12, orderBy: [{ apellido: 'asc' as const }, { nombre: 'asc' as const }, { id: 'asc' as const }],
    select: { id: true, nombre: true, apellido: true, dni: true, fechaNac: true, tutorNombre: true, obraSocial: true, particular: true, esDemo: true } as const,
  }
  const [total, iniciales] = await Promise.all([prisma.paciente.count({ where }), prisma.paciente.findMany({ ...consulta, skip: (solicitada - 1) * 12 })])
  const paginas = Math.max(1, Math.ceil(total / 12)), pagina = Math.min(solicitada, paginas)
  const pacientes = pagina === solicitada ? iniciales : await prisma.paciente.findMany({ ...consulta, skip: (pagina - 1) * 12 })
  return { total, paginas, pagina, filtros: { q, cobertura, pagina }, pacientes: pacientes.map(p => ({ ...p, fechaNac: p.fechaNac.toISOString() })) }
}
