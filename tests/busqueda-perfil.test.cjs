/* eslint-disable @typescript-eslint/no-require-imports -- Pruebas aisladas, sin base compartida. */
const { test } = require('node:test')
const assert = require('node:assert/strict')
const { cargar } = require('./cargar-modulo.cjs')

test('la búsqueda combina nombre y apellido y devuelve solamente datos administrativos', async () => {
  let consulta
  const { listarPaginaPacientes } = cargar('lib/listado-pacientes.ts', {
    '@/lib/auth': { requireUser: async () => ({ rol: 'SECRETARIA' }) },
    '@/lib/prisma': { prisma: { paciente: {
      count: async () => 1,
      findMany: async args => { consulta = args; return [{ id: 'demo', fechaNac: new Date('2020-01-01') }] },
    } } },
  })
  const resultado = await listarPaginaPacientes({ q: ' Emilia Luna ', cobertura: 'particular' })
  assert.equal(consulta.where.eliminadoEn, null)
  assert.equal(consulta.where.particular, true)
  assert.equal(consulta.where.AND.length, 2)
  assert.equal(consulta.where.AND[0].OR[0].nombre.contains, 'Emilia')
  assert.equal(consulta.where.AND[1].OR[1].apellido.contains, 'Luna')
  assert.equal(consulta.take, 12)
  assert.deepEqual(Object.keys(consulta.select).sort(), ['apellido', 'dni', 'esDemo', 'fechaNac', 'id', 'nombre', 'obraSocial', 'particular', 'tutorNombre'].sort())
  assert.equal(resultado.pacientes[0].fechaNac, '2020-01-01T00:00:00.000Z')
})

test('normaliza DNI y corrige páginas fuera de rango', async () => {
  const consultas = []
  const { listarPaginaPacientes } = cargar('lib/listado-pacientes.ts', {
    '@/lib/auth': { requireUser: async () => ({}) },
    '@/lib/prisma': { prisma: { paciente: { count: async () => 13, findMany: async args => { consultas.push(args); return [] } } } },
  })
  const resultado = await listarPaginaPacientes({ q: '12.345.678', pagina: '999', cobertura: 'invalida' })
  assert.equal(resultado.pagina, 2)
  assert.equal(resultado.filtros.cobertura, '')
  assert.equal(consultas[1].skip, 12)
  assert.equal(consultas[0].where.AND[0].OR[2].dni.contains, '12345678')
})

test('sin sesión la búsqueda no consulta pacientes', async () => {
  const { listarPaginaPacientes } = cargar('lib/listado-pacientes.ts', {
    '@/lib/auth': { requireUser: async () => { throw new Error('Sin sesión') } },
    '@/lib/prisma': { prisma: { paciente: { count: () => assert.fail('No debe leer'), findMany: () => assert.fail('No debe leer') } } },
  })
  await assert.rejects(listarPaginaPacientes({ q: 'Ejemplo' }), /Sin sesión/)
})
