/* eslint-disable @typescript-eslint/no-require-imports -- Pruebas aisladas de lecturas y verificación de acceso. */
const { test } = require('node:test')
const assert = require('node:assert/strict')
const { cargar } = require('./cargar-modulo.cjs')
const { NextRequest } = require('next/server')

const paciente = { id: 'demo', nombre: 'Ejemplo', apellido: 'Ficticio', dni: 'DEMO', fechaNac: new Date('2020-01-01'), consentimientoAt: null }

test('la ficha consulta únicamente la sección pedida', async () => {
  const casos = {
    datos: [], resumen: ['consulta.findMany', 'turno.findMany'], consultas: ['consulta.findMany', 'consulta.count'],
    vacunas: ['vacunaAplicada.findMany'], documentos: ['documento.findMany'], turnos: ['turno.findMany'],
  }
  for (const [seccion, esperadas] of Object.entries(casos)) {
    const llamadas = []
    const modelo = nombre => ({ findMany: async () => { llamadas.push(`${nombre}.findMany`); return [] }, count: async () => { llamadas.push(`${nombre}.count`); return 0 } })
    const Page = cargar('app/pacientes/[id]/page.tsx', {
      '@/lib/auth': { requireUser: async () => ({ rol: 'DOCTORA' }) },
      '../lecturas': { obtenerPaciente: async () => paciente },
      '@/app/components/nav': { default: async () => null },
      '@/lib/prisma': { prisma: { consulta: modelo('consulta'), turno: modelo('turno'), vacunaAplicada: modelo('vacunaAplicada'), documento: modelo('documento') } },
    }).default
    await Page({ params: Promise.resolve({ id: 'demo' }), searchParams: Promise.resolve({ seccion }) })
    assert.deepEqual(llamadas.sort(), esperadas.sort(), seccion)
  }
})

test('el listado inicia el conteo y las filas en paralelo', async () => {
  let contar, filas, inicioConteo = false, inicioFilas = false
  const Page = cargar('app/pacientes/page.tsx', {
    '@/lib/auth': { requireUser: async () => ({ rol: 'DOCTORA' }) },
    '@/app/components/nav': { default: async () => null },
    '@/lib/prisma': { prisma: { paciente: {
      count: () => { inicioConteo = true; return new Promise(resolve => { contar = resolve }) },
      findMany: () => { inicioFilas = true; return new Promise(resolve => { filas = resolve }) },
    } } },
  }).default
  const pagina = Page({ searchParams: Promise.resolve({}) })
  await new Promise(resolve => setImmediate(resolve))
  assert.ok(inicioConteo && inicioFilas, 'Ambas lecturas deben comenzar antes de esperar un resultado')
  contar(0); filas([])
  await pagina
})

test('Hoy omite la consulta de vacunas del calendario si no va a mostrarla', async () => {
  let vacunas = false
  const { leerAgenda } = cargar('lib/agenda-vista.ts', {
    '@/lib/auth': { requireUser: async () => ({ rol: 'DOCTORA' }) },
    '@/lib/prisma': { prisma: { turno: { findMany: async () => [] }, vacunaAplicada: { findMany: async () => { vacunas = true; return [] } } } },
  })
  await leerAgenda('2026-11-04', 1, false)
  assert.equal(vacunas, false)
})

test('el resumen de pendientes limita las filas y conserva el total real', async () => {
  const consultas = []
  const { obtenerResumenPendientes } = cargar('lib/agenda.ts', {
    '@/lib/auth': { requireUser: async () => ({ rol: 'DOCTORA' }) },
    '@/lib/prisma': { prisma: {
      turno: { count: async () => 27, findMany: async q => { consultas.push(q); return [] } },
      vacunaAplicada: { count: async () => 12, findMany: async q => { consultas.push(q); return [] } },
    } },
  })
  const resumen = await obtenerResumenPendientes()
  assert.equal(resumen.total, 39)
  assert.equal(consultas.length, 2)
  assert.ok(consultas.every(q => q.take === 4 && q.select && q.orderBy))
})

test('el proxy no llama a Supabase para renderizar el ingreso público', async () => {
  let invocado = false
  const { proxy } = cargar('proxy.ts', { '@supabase/ssr': { createServerClient: () => { invocado = true; throw new Error('No debería ejecutarse') } } })
  const r = await proxy(new NextRequest('http://localhost/login'))
  assert.equal(r.status, 200)
  assert.equal(invocado, false)
})

test('el proxy rechaza claims inválidos y conserva las cookies renovadas', async () => {
  const { proxy } = cargar('proxy.ts', { '@supabase/ssr': { createServerClient: (_url, _key, opciones) => ({ auth: {
    getClaims: async () => { opciones.cookies.setAll([{ name: 'cookie-prueba', value: 'ficticia', options: { path: '/' } }]); return { data: null, error: new Error('Inválido') } },
  } }) } })
  const r = await proxy(new NextRequest('http://localhost/pacientes'))
  assert.equal(r.status, 307)
  assert.equal(new URL(r.headers.get('location')).pathname, '/login')
  assert.equal(r.cookies.get('cookie-prueba').value, 'ficticia')
})
