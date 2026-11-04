/* eslint-disable @typescript-eslint/no-require-imports -- Verificación administrativa de solo lectura, sin imprimir filas clínicas. */
require('dotenv').config({ quiet: true })
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
async function ejecutar() {
  const ids = Array.from({ length: 5 }, (_, i) => `d3000000-0000-4000-8000-${String(i + 1).padStart(12, '0')}`)
  const [pacientes, consultas, vacunas, turnos, proteccion] = await Promise.all([
    prisma.paciente.count({ where: { id: { in: ids }, esDemo: true } }),
    prisma.consulta.count({ where: { pacienteId: { in: ids } } }),
    prisma.vacunaAplicada.count({ where: { pacienteId: { in: ids } } }),
    prisma.turno.count({ where: { pacienteId: { in: ids } } }),
    prisma.$queryRaw`SELECT c.relrowsecurity AS rls,
      has_table_privilege('anon', c.oid, 'SELECT, INSERT, UPDATE, DELETE') AS anon,
      has_table_privilege('authenticated', c.oid, 'SELECT, INSERT, UPDATE, DELETE') AS authenticated
      FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relname = 'ConsultaRevision'`,
  ])
  if (pacientes !== 5 || consultas < 5 || vacunas < 10 || turnos < 5) throw new Error('Demostración incompleta')
  if (proteccion.length !== 1 || !proteccion[0].rls || proteccion[0].anon || proteccion[0].authenticated) throw new Error('Protección de revisiones incompleta')
  console.log(`Verificación de solo lectura: ${pacientes} pacientes, ${consultas} consultas, ${vacunas} vacunas y ${turnos} turnos ficticios. ConsultaRevision tiene RLS y no permite acceso a anon/authenticated.`)
}
ejecutar().catch(() => { console.error('La verificación de estructura o demostración no pasó.'); process.exitCode = 1 }).finally(() => prisma.$disconnect())
