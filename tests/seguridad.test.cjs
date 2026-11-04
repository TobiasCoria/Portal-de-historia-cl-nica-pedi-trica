/* eslint-disable @typescript-eslint/no-require-imports -- El cargador CommonJS aísla las dependencias de servidor en las pruebas. */
const { test } = require('node:test')
const assert = require('node:assert/strict')

const { cargar } = require('./cargar-modulo.cjs')

function entorno({ fallaLog = false, sesion = true } = {}) {
  let estado = { consulta: { id: 'consulta-1', pacienteId: 'paciente-1', eliminadoEn: null }, logs: [] }
  const prisma = { $transaction: async ejecutar => {
    const copia = structuredClone(estado)
    const resultado = await ejecutar({
      consulta: { update: async ({ where, data }) => {
        if (where.id !== copia.consulta.id || where.pacienteId !== copia.consulta.pacienteId || copia.consulta.eliminadoEn) throw new Error('Registro no disponible')
        Object.assign(copia.consulta, data)
        return copia.consulta
      } },
      logAuditoria: { create: async ({ data }) => {
        if (fallaLog) throw new Error('Auditoría no disponible')
        copia.logs.push(data)
      } },
    })
    estado = copia
    return resultado
  } }
  const mocks = {
    '@/lib/prisma': { prisma },
    '@/lib/auth': { requireUser: async () => {
      if (!sesion) throw new Error('Sin sesión')
      return { email: 'cuenta-validada@example.test', rol: 'DOCTORA' }
    } },
    '@/lib/registros': { requirePaciente: async () => ({}) },
    'next/cache': { revalidatePath() {} },
    'next/navigation': { redirect() { throw new Error('redirect') } },
  }
  mocks['@/lib/auth'].requireRole = mocks['@/lib/auth'].requireUser
  return { mocks, estado: () => estado }
}

test('ocultar conserva la consulta y registra la cuenta de la sesión sin contenido clínico', async () => {
  const e = entorno()
  const { eliminarConsulta } = cargar('app/pacientes/[id]/consultas/actions.ts', e.mocks)
  await eliminarConsulta('paciente-1', 'consulta-1')
  assert.ok(e.estado().consulta.eliminadoEn)
  assert.equal(e.estado().logs.length, 1)
  const log = e.estado().logs[0]
  assert.equal(log.usuarioEmail, 'cuenta-validada@example.test')
  assert.equal(log.accion, 'BAJA')
  assert.deepEqual(JSON.parse(log.detalle), { campos: ['eliminadoEn'] })
})

test('un ID de otro paciente no permite ocultar ni crea auditoría', async () => {
  const e = entorno()
  await assert.rejects(cargar('app/pacientes/[id]/consultas/actions.ts', e.mocks).eliminarConsulta('paciente-2', 'consulta-1'))
  assert.equal(e.estado().consulta.eliminadoEn, null)
  assert.equal(e.estado().logs.length, 0)
})

test('si falla la auditoría se revierte la mutación', async () => {
  const e = entorno({ fallaLog: true })
  await assert.rejects(cargar('app/pacientes/[id]/consultas/actions.ts', e.mocks).eliminarConsulta('paciente-1', 'consulta-1'), /Auditoría/)
  assert.equal(e.estado().consulta.eliminadoEn, null)
})

test('sin sesión no se ejecuta la mutación', async () => {
  const e = entorno({ sesion: false })
  await assert.rejects(cargar('app/pacientes/[id]/consultas/actions.ts', e.mocks).eliminarConsulta('paciente-1', 'consulta-1'), /Sin sesión/)
  assert.equal(e.estado().consulta.eliminadoEn, null)
})

test('un documento oculto no permite generar una URL firmada', async () => {
  let storage = false
  const e = entorno()
  e.mocks['@/lib/prisma'].prisma.documento = { findFirstOrThrow: async ({ where }) => {
    assert.equal(where.eliminadoEn, null)
    assert.equal(where.paciente.eliminadoEn, null)
    assert.ok(where.OR.some(filtro => filtro.consulta?.eliminadoEn === null))
    throw new Error('Documento no disponible')
  } }
  e.mocks['@/lib/supabase/admin'] = { createAdminClient: () => { storage = true } }
  await assert.rejects(cargar('lib/documentos.ts', e.mocks).obtenerUrlDocumento('a0000000-0000-4000-8000-000000000001'))
  assert.equal(storage, false)
})

test('la secretaria no puede acceder a auditoría aunque abra la ruta directamente', async () => {
  const auth = cargar('lib/auth.ts', {
    '@/lib/supabase/server': { createClient: async () => ({ auth: { getUser: async () => ({ data: { user: { email: 'secretaria@gmail.com' } } }) } }) },
    'next/navigation': { notFound() { throw new Error('404') }, redirect() { throw new Error('login') } },
  })
  await assert.rejects(auth.requireDoctora(), /404/)
})

const altaValida = {
  nombre: 'Paciente ficticio', apellido: 'Prueba', dni: '90000001', fechaNac: '2020-01-01',
  tutorNombre: 'Tutor ficticio', tutorDni: '90000002', tutorVinculo: 'Madre', consentimiento: true,
}

test('el servidor rechaza el alta sin consentimiento y no escribe datos', async () => {
  const e = entorno()
  let escribio = false
  e.mocks['@/lib/auditoria'] = { mutarConAuditoria: async () => { escribio = true } }
  const acciones = cargar('app/pacientes/actions.ts', e.mocks)
  for (const consentimiento of [false, undefined, 'true']) {
    const resultado = await acciones.crearPaciente({ ...altaValida, consentimiento })
    assert.ok(resultado.error)
  }
  assert.equal(escribio, false)
})

test('fecha y responsable del consentimiento se obtienen del servidor, ignorando valores del navegador', async () => {
  const e = entorno()
  let guardado
  e.mocks['@/lib/auditoria'] = { mutarConAuditoria: async (_entidad, _accion, _campos, mutacion) =>
    mutacion({ paciente: { create: async ({ data }) => { guardado = data; return { ...data, id: 'nuevo' } } } }) }
  const acciones = cargar('app/pacientes/actions.ts', e.mocks)
  const antes = Date.now()
  await assert.rejects(acciones.crearPaciente({ ...altaValida, consentimientoAt: '1999-01-01', consentimientoPor: 'cuenta-falsa', eliminadoEn: '1999-01-01' }), /redirect/)
  assert.equal(guardado.consentimientoPor, 'cuenta-validada@example.test')
  assert.ok(guardado.consentimientoAt.getTime() >= antes)
  assert.equal(guardado.eliminadoEn, undefined)
  assert.equal(guardado.consentimiento, undefined)
})

test('editar una ficha no permite reescribir el consentimiento desde el navegador', async () => {
  const e = entorno()
  let guardado
  e.mocks['@/lib/auditoria'] = { mutarConAuditoria: async (_entidad, _accion, _campos, mutacion) =>
    mutacion({ paciente: { update: async ({ data }) => { guardado = data; return { ...data, id: 'existente' } } } }) }
  await assert.rejects(cargar('app/pacientes/actions.ts', e.mocks).actualizarPaciente('existente', {
    ...altaValida, consentimientoAt: '1999-01-01', consentimientoPor: 'cuenta-falsa',
  }, new Date().toISOString()), /redirect/)
  assert.equal(guardado.consentimientoAt, undefined)
  assert.equal(guardado.consentimientoPor, undefined)
})

function formularioLogin(signInWithPassword, timeoutInmediato = false) {
  const estados = []
  let destino
  const mocks = {
    react: { useState: valor => {
      const indice = estados.length
      estados.push(indice === 0 ? { email: 'cuenta@example.test', nombre: 'Doctora', color: '#3e6fa8' } : valor)
      return [estados[indice], nuevo => { estados[indice] = nuevo }]
    } },
    '@/lib/supabase/client': { createClient: () => ({ auth: { signInWithPassword } }) },
    '@/lib/perfiles': new Proxy({}, { get() { throw new Error('El login no debe escribir perfiles') } }),
    'next/navigation': { useRouter: () => ({ push: url => { destino = url }, refresh() {} }) },
    ...(timeoutInmediato ? { $setTimeout: callback => { queueMicrotask(callback); return undefined } } : {}),
  }
  const pagina = cargar('app/login/page.tsx', mocks).default()
  function buscarFormulario(node) {
    if (!node || typeof node !== 'object') return null
    if (node.type === 'form') return node
    const hijos = Array.isArray(node.props?.children) ? node.props.children : [node.props?.children]
    for (const h of hijos) { const f = buscarFormulario(h); if (f) return f }
    return null
  }
  const form = buscarFormulario(pagina)
  return { enviar: () => form.props.onSubmit({ preventDefault() {} }), estados, destino: () => destino }
}

test('el login autentica y navega sin depender de escrituras de perfil', async () => {
  const f = formularioLogin(async () => ({ error: null }))
  await f.enviar()
  assert.equal(f.destino(), '/hoy')
  assert.equal(f.estados[3], false)
})

test('una falla de red libera el botón y muestra un error sin exponer detalles', async () => {
  const f = formularioLogin(async () => { throw new Error('detalle interno') })
  await f.enviar()
  assert.match(f.estados[2], /No se pudo conectar/)
  assert.equal(f.estados[3], false)
  assert.equal(f.destino(), undefined)
})

test('una solicitud que no responde libera el botón al agotar el tiempo', async () => {
  const f = formularioLogin(() => new Promise(() => {}), true)
  await f.enviar()
  assert.match(f.estados[2], /tardando demasiado/)
  assert.equal(f.estados[3], false)
})

function sesionReal(email) {
  return {
    '@/lib/supabase/server': { createClient: async () => ({ auth: { getUser: async () => ({ data: { user: { email } } }) } }) },
    'next/navigation': { notFound() { throw new Error('404') }, redirect() { throw new Error('login') } },
  }
}

test('una cuenta autenticada ajena al consultorio no está autorizada', async () => {
  await assert.rejects(cargar('lib/auth.ts', sesionReal('cuenta-ajena@example.invalid')).requireUser(), /404/)
})

test('la secretaria no puede invocar acciones clínicas, restaurar registros ni exportar PDF', async () => {
  const mocks = sesionReal('secretaria@gmail.com')
  mocks['@/lib/prisma'] = new Proxy({}, { get() { throw new Error('No se debe consultar la base') } })
  for (const [archivo, funcion, args] of [
    ['app/pacientes/[id]/consultas/actions.ts', 'crearConsulta', ['paciente', { motivo: 'Intento' }]],
    ['app/pacientes/[id]/vacunas/actions.ts', 'crearVacuna', ['paciente', { nombre: 'Intento' }]],
    ['lib/documentos.ts', 'obtenerUrlDocumento', ['documento']],
    ['app/archivo/actions.ts', 'restaurarRegistro', ['Paciente', 'paciente']],
    ['app/pacientes/[id]/exportar/route.ts', 'GET', [null, { params: Promise.resolve({ id: 'paciente' }) }]],
  ]) {
    await assert.rejects(cargar(archivo, { ...mocks, 'next/cache': { revalidatePath() {} } })[funcion](...args), /404/)
  }
})

test('la agenda de secretaria no consulta vacunas ni selecciona alergias', async () => {
  const e = entorno()
  let consultaTurnos, vacunas = false
  e.mocks['@/lib/auth'] = { requireUser: async () => ({ email: 'secretaria@gmail.com', rol: 'SECRETARIA' }) }
  e.mocks['@/lib/prisma'] = { prisma: {
    turno: { findMany: async query => { consultaTurnos = query; return [] } },
    vacunaAplicada: { findMany: async () => { vacunas = true; return [] } },
  } }
  await cargar('lib/agenda-vista.ts', e.mocks).leerAgenda('2026-11-04')
  assert.equal(vacunas, false)
  assert.equal(consultaTurnos.include.paciente.select.alergias, false)
  assert.equal(consultaTurnos.include.paciente.select.observaciones, undefined)
  await cargar('lib/agenda.ts', e.mocks).obtenerAgendaProxima()
  assert.equal(vacunas, false)
  assert.notEqual(consultaTurnos.select.paciente, true)
  assert.equal(consultaTurnos.select.paciente.select.alergias, undefined)
})

test('la edición administrativa ignora campos clínicos enviados por la secretaria', async () => {
  const e = entorno()
  e.mocks['@/lib/auth'] = { requireUser: async () => ({ email: 'secretaria@gmail.com', rol: 'SECRETARIA' }) }
  let guardado
  e.mocks['@/lib/auditoria'] = { mutarConAuditoria: async (_e, _a, _c, fn) => fn({ paciente: { update: async ({ data, where }) => { guardado = data; assert.ok(where.actualizadoEn); return { ...data, id: 'id' } } } }) }
  await assert.rejects(cargar('app/pacientes/actions.ts', e.mocks).actualizarPaciente('id', { ...altaValida, alergias: 'No debe guardarse', observaciones: 'Tampoco', pesoNacer: 3.2 }, new Date().toISOString()), /redirect/)
  assert.equal(guardado.alergias, undefined)
  assert.equal(guardado.observaciones, undefined)
  assert.equal(guardado.pesoNacer, undefined)
  assert.equal(guardado.tutorNombre, altaValida.tutorNombre)
})

test('rectificar conserva snapshot, responsable, motivo y versión anterior', async () => {
  const e = entorno()
  let revision, cambio
  const anterior = { id: 'consulta', pacienteId: 'paciente', version: 2, motivo: 'Anterior', diagnostico: 'Previo', tratamiento: null, peso: 12, talla: 88, observaciones: null }
  e.mocks['@/lib/auditoria'] = { mutarConAuditoria: async (_e, _a, _c, fn) => fn({
    consulta: { findFirstOrThrow: async () => anterior, updateMany: async q => { cambio = q; return { count: 1 } }, findUniqueOrThrow: async () => ({ ...anterior, version: 3 }) },
    consultaRevision: { create: async ({ data }) => { revision = data } },
  }) }
  await assert.rejects(cargar('app/pacientes/[id]/consultas/actions.ts', e.mocks).actualizarConsulta('paciente', 'consulta', { motivo: 'Corregido' }, 2, 'Corrección de prueba'), /redirect/)
  assert.equal(revision.snapshot.motivo, 'Anterior')
  assert.equal(revision.snapshot.diagnostico, 'Previo')
  assert.equal(revision.usuarioEmail, 'cuenta-validada@example.test')
  assert.equal(revision.version, 2)
  assert.equal(revision.motivo, 'Corrección de prueba')
  assert.equal(cambio.where.version, 2)
  assert.equal(cambio.data.version.increment, 1)
  assert.equal(cambio.data.diagnostico, null)
  assert.equal(cambio.data.peso, null)
})

test('una rectificación sobre una versión vieja se rechaza sin escribir', async () => {
  const e = entorno()
  let escribio = false
  e.mocks['@/lib/auditoria'] = { mutarConAuditoria: async (_e, _a, _c, fn) => fn({ consulta: {
    findFirstOrThrow: async () => ({ version: 4 }), updateMany: async () => { escribio = true },
  } }) }
  const r = await cargar('app/pacientes/[id]/consultas/actions.ts', e.mocks).actualizarConsulta('paciente', 'consulta', { motivo: 'Intento' }, 3, 'Motivo de prueba')
  assert.match(r.error, /cambió/)
  assert.equal(escribio, false)
})

test('se rechazan vacunas sin fechas, números en cero y nacimientos futuros', () => {
  const v = cargar('lib/validaciones.ts', {})
  assert.equal(v.vacunaSchema.safeParse({ nombre: 'Ejemplo' }).success, false)
  assert.equal(v.vacunaSchema.safeParse({ nombre: 'Ejemplo', fechaProgramada: '2026-02-30' }).success, false)
  const { schema } = cargar('app/pacientes/schema.ts', {})
  assert.equal(schema.safeParse({ ...altaValida, pesoNacer: 0 }).success, false)
  assert.equal(schema.safeParse({ ...altaValida, fechaNac: '2099-01-01' }).success, false)
  assert.equal(schema.safeParse({ ...altaValida, pesoNacer: undefined, sexo: undefined }).success, true)
})

test('los horarios se comparan en Argentina y los turnos adyacentes no se superponen', async () => {
  const { verificarHorario } = cargar('lib/horarios.ts', {})
  const tx = { turno: { findMany: async () => [{ fecha: new Date('2026-11-04T09:00:00-03:00'), duracion: 30 }] } }
  await assert.rejects(verificarHorario(tx, new Date('2026-11-04T09:15:00-03:00'), 30), /superpone/)
  await verificarHorario(tx, new Date('2026-11-04T09:30:00-03:00'), 30)
  const f = cargar('lib/fechas.ts', {})
  assert.equal(f.inputFechaHora(new Date('2026-11-04T12:00:00Z')), '2026-11-04T09:00')
})

test('el generador PDF conserva textos extensos en varias páginas válidas', async () => {
  const { crearPdf } = cargar('lib/pdf.ts', {})
  const bytes = await crearPdf({ titulo: 'Historia clínica pediátrica', profesional: 'Profesional de demostración', matricula: null,
    paciente: 'Niña ficticia · Demostración', dni: 'DEMO-001', nacimiento: '2020-01-01', demo: true,
    secciones: [{ titulo: 'Consulta de ejemplo', campos: [{ etiqueta: 'Observaciones', valor: 'Texto ficticio con ñ y acentos. '.repeat(1200) }] }],
  })
  const doc = await require('pdf-lib').PDFDocument.load(bytes)
  assert.ok(doc.getPageCount() > 1)
  assert.equal(doc.getTitle(), 'Historia clínica pediátrica')
})
