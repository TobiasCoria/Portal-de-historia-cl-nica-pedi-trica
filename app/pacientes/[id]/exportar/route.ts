import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { registrarAuditoria } from '@/lib/auditoria'
import { crearPdf, type DatosPdf } from '@/lib/pdf'
import { fechaCorta } from '@/lib/fechas'
import { z } from 'zod'

export const runtime = 'nodejs'
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole('DOCTORA')
  const { id } = await params
  if (!z.string().uuid().safeParse(id).success) return new Response('No encontrado', { status: 404 })
  const tipo = new URL(request.url).searchParams.get('tipo') === 'vacunas' ? 'vacunas' : 'historia'
  const p = await prisma.paciente.findFirst({ where: { id, eliminadoEn: null }, include: {
    consultas: tipo === 'historia' ? { where: { eliminadoEn: null }, orderBy: { fecha: 'asc' } } : false,
    vacunas: { where: { eliminadoEn: null }, orderBy: [{ fechaAplicada: 'asc' }, { fechaProgramada: 'asc' }] },
  } })
  if (!p) return new Response('No encontrado', { status: 404 })
  const profesional = await prisma.perfil.findUnique({ where: { email: user.email! }, select: { nombre: true, matricula: true } })
  const campos = (datos: [string, string | null | undefined][]) => datos.map(([etiqueta, valor]) => ({ etiqueta, valor: valor || 'Sin registrar' }))
  const secciones: DatosPdf['secciones'] = []
  if (tipo === 'historia') {
    secciones.push({ titulo: 'Datos del paciente y su entorno', campos: campos([
      ['Tutor', p.tutorNombre], ['Vínculo', p.tutorVinculo], ['Teléfono', p.telefono], ['Email', p.email],
      ['Cobertura', p.particular ? 'Particular' : p.obraSocial], ['Afiliación', p.numeroAfiliado],
      ['Alergias', p.alergias], ['Antecedentes familiares', p.antecedentesFamiliares], ['Observaciones', p.observaciones],
      ['Peso al nacer', p.pesoNacer ? `${p.pesoNacer} kg` : null], ['Talla al nacer', p.tallaNacer ? `${p.tallaNacer} cm` : null], ['Grupo sanguíneo', p.grupoSanguineo],
    ]) })
    for (const c of p.consultas) secciones.push({ titulo: `Consulta · ${fechaCorta(c.fecha)}${c.version > 0 ? ` · Rectificada, versión ${c.version}` : ''}`, campos: campos([
      ['Motivo', c.motivo], ['Diagnóstico', c.diagnostico], ['Tratamiento', c.tratamiento], ['Observaciones', c.observaciones],
      ['Peso / talla', [c.peso ? `${c.peso} kg` : '', c.talla ? `${c.talla} cm` : ''].filter(Boolean).join(' / ')], ['Registrada por', c.autorEmail],
    ]) })
    if (!p.consultas.length) secciones.push({ titulo: 'Consultas', campos: [{ etiqueta: 'Estado', valor: 'No hay consultas visibles registradas.' }] })
  }
  for (const v of p.vacunas) secciones.push({ titulo: `Vacuna · ${v.nombre}`, campos: campos([
    ['Dosis', v.dosis], ['Aplicada', v.fechaAplicada ? fechaCorta(v.fechaAplicada.toISOString().slice(0, 10)) : 'No aplicada'],
    ['Programada', v.fechaProgramada ? fechaCorta(v.fechaProgramada.toISOString().slice(0, 10)) : 'Sin programación'], ['Observaciones', v.observaciones],
  ]) })
  if (!p.vacunas.length) secciones.push({ titulo: 'Vacunas', campos: [{ etiqueta: 'Estado', valor: 'No hay vacunas visibles registradas.' }] })
  const bytes = await crearPdf({ titulo: tipo === 'vacunas' ? 'Carnet de vacunación' : 'Historia clínica pediátrica', profesional: profesional?.nombre || user.nombre, matricula: profesional?.matricula || null,
    paciente: `${p.nombre} ${p.apellido}`, dni: p.dni, nacimiento: p.fechaNac.toISOString().slice(0, 10), demo: p.esDemo, secciones,
  })
  await registrarAuditoria(prisma, user.email!, { entidad: 'Paciente', entidadId: id, pacienteId: id, accion: 'EXPORTACION', campos: tipo === 'historia' ? ['datos', 'consultas', 'vacunas'] : ['vacunas'] })
  return new Response(new Uint8Array(bytes), { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${tipo}-${id}.pdf"`, 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' } })
}
