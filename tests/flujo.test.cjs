/* eslint-disable @typescript-eslint/no-require-imports -- Pruebas aisladas sin cuentas ni base reales. */
const { test } = require('node:test')
const assert = require('node:assert/strict')
const React = require('react')
const { cargar } = require('./cargar-modulo.cjs')

test('la semana empieza el lunes incluso al cruzar mes o año', () => {
  const { inicioSemana, sumarDias } = cargar('lib/fechas.ts', {})
  for (const [dia, lunes] of [['2026-11-04', '2026-11-02'], ['2026-11-08', '2026-11-02'], ['2026-11-02', '2026-11-02'], ['2027-01-01', '2026-12-28']]) {
    assert.equal(inicioSemana(dia), lunes)
    assert.equal(new Date(sumarDias(lunes, 6)).getUTCDay(), 0)
  }
})

test('un turno vencido sigue pendiente hasta que alguien lo resuelva', () => {
  const { estadoTurno } = cargar('lib/estado-turno.ts', {})
  const ahora = new Date('2026-11-04T12:00:00Z'), antes = new Date('2026-11-04T11:00:00Z'), despues = new Date('2026-11-04T13:00:00Z')
  assert.equal(estadoTurno('PENDIENTE', antes, ahora).clase, 'vencido')
  assert.equal(estadoTurno('PENDIENTE', despues, ahora).etiqueta, 'Próximo')
  assert.equal(estadoTurno('AUSENTE', antes, ahora).etiqueta, 'Ausente')
  assert.equal(estadoTurno('CANCELADO', antes, ahora).clase, 'cancelado')
})

test('la paginación limita lecturas y recupera la última página existente', async () => {
  const { leerPagina } = cargar('lib/paginacion.ts', {})
  const lecturas = []
  const resultado = await leerPagina(3, async () => 13, async (skip, take) => { lecturas.push([skip, take]); return [skip] })
  assert.deepEqual(lecturas, [[24, 12], [12, 12]])
  assert.equal(resultado.pagina, 2)
  assert.deepEqual(resultado.filas, [12])
  assert.equal(resultado.total, 13)
})

test('cada historial pagina en servidor y el resumen limita los turnos', async () => {
  for (const [seccion, modelo] of [['vacunas', 'vacunaAplicada'], ['documentos', 'documento'], ['turnos', 'turno'], ['resumen', 'turno']]) {
    const lecturas = []
    const modelos = Object.fromEntries(['consulta', 'vacunaAplicada', 'documento', 'turno'].map(nombre => [nombre, { count: async () => 25, findMany: async args => { lecturas.push([nombre, args]); return [] } }]))
    const Page = cargar('app/pacientes/[id]/page.tsx', {
      '@/lib/auth': { requireUser: async () => ({ rol: 'DOCTORA' }) },
      '../lecturas': { obtenerPaciente: async () => ({ nombre: 'Demo', apellido: 'Ficticio', fechaNac: new Date('2020-01-01') }) },
      '@/app/components/nav': { default: async () => null }, '@/lib/prisma': { prisma: modelos },
    }).default
    await Page({ params: Promise.resolve({ id: 'paciente' }), searchParams: Promise.resolve({ seccion, pagina: '2' }) })
    const consulta = lecturas.find(([nombre]) => nombre === modelo)[1]
    assert.equal(consulta.take, seccion === 'resumen' ? 3 : 12)
    assert.equal(consulta.where.pacienteId, 'paciente')
    if (seccion === 'resumen') assert.equal(consulta.where.estado, 'PENDIENTE')
    else assert.equal(consulta.skip, 12)
    if (seccion === 'vacunas' || seccion === 'documentos') assert.equal(consulta.where.eliminadoEn, null)
  }
})

test('el aviso se limpia al confirmar guardado y vuelve con una edición nueva', () => {
  const formulario = new EventTarget(), ventana = new EventTarget(), documento = new EventTarget()
  let efecto, dependencias
  const previo = global.document
  global.document = documento
  try {
    const Componente = cargar('app/components/cambios-pendientes.tsx', {
      react: { ...React, useRef: () => ({ current: { closest: () => formulario } }), useEffect: (fn, deps) => { efecto = fn; dependencias = deps } }, $window: ventana,
    }).default
    Componente({ guardado: 0 }); let limpiar = efecto()
    const aviso = () => { const evento = new Event('beforeunload', { cancelable: true }); ventana.dispatchEvent(evento); return evento.defaultPrevented }
    assert.equal(aviso(), false)
    formulario.dispatchEvent(new Event('input')); assert.equal(aviso(), true)
    limpiar(); Componente({ guardado: 1 }); limpiar = efecto()
    assert.deepEqual(dependencias, [1]); assert.equal(aviso(), false)
    formulario.dispatchEvent(new Event('change')); assert.equal(aviso(), true)
    limpiar(); assert.equal(aviso(), false)
  } finally { global.document = previo }
})

test('el formulario confirma el guardado únicamente si el servidor lo acepta', async () => {
  for (const fallar of [true, false]) {
    const estados = []; let cursor = 0
    const Formulario = cargar('app/configuracion/formulario.tsx', {
      react: { ...React, useState: inicial => { const i = cursor++; estados[i] = inicial; return [inicial, valor => { estados[i] = typeof valor === 'function' ? valor(estados[i]) : valor }] } },
      './actions': { actualizarProfesional: async () => fallar ? { error: 'No se guardó' } : {} },
    }).default
    const elemento = Formulario({ nombre: 'Demostración', matricula: '' }), fd = new FormData()
    fd.set('nombre', 'Demostración'); fd.set('matricula', '')
    await elemento.props.action(fd)
    assert.equal(estados[3], fallar ? 0 : 1)
    assert.equal(estados[1], !fallar)
    assert.equal(estados[2], false)
  }
})

test('la consulta guardada abre su cierre y atiende solamente el turno del paciente', async () => {
  let ruta, turno
  const acciones = cargar('app/pacientes/[id]/consultas/actions.ts', {
    '@/lib/auth': { requireRole: async () => ({ email: 'demo@example.invalid' }) },
    '@/lib/registros': { requirePaciente: async () => ({}) },
    '@/lib/auditoria': { registrarAuditoria: async () => {}, mutarConAuditoria: async (_e, _a, _c, fn) => fn({ consulta: { create: async () => ({ id: 'consulta', pacienteId: 'paciente' }) }, turno: { update: async args => { turno = args; return { id: 'turno' } } } }) },
    'next/cache': { revalidatePath() {} }, 'next/navigation': { redirect: href => { ruta = href; throw new Error('Navegar') } },
  })
  await assert.rejects(acciones.crearConsulta('paciente', { motivo: 'Consulta de prueba' }, 'turno'), /Navegar/)
  assert.equal(ruta, '/pacientes/paciente/consultas/consulta/cierre')
  assert.deepEqual(turno.where, { id: 'turno', pacienteId: 'paciente', estado: 'PENDIENTE' })
  assert.equal(turno.data.consultaId, 'consulta')
})

test('la secretaria no puede abrir el cierre clínico ni consultar sus datos', async () => {
  const Page = cargar('app/pacientes/[id]/consultas/[consultaId]/cierre/page.tsx', {
    '@/lib/auth': { requireRole: async () => { throw new Error('Sin permiso') } },
    '@/lib/prisma': { prisma: {} }, '@/app/pacientes/lecturas': { obtenerPaciente: () => assert.fail('No debe leer') },
  }).default
  await assert.rejects(Page({ params: Promise.resolve({ id: 'paciente', consultaId: 'consulta' }), searchParams: Promise.resolve({}) }), /Sin permiso/)
})
