/* eslint-disable @typescript-eslint/no-require-imports -- El cargador CommonJS aísla las dependencias de servidor en las pruebas. */
const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')

// Ejecuta los módulos reales con sesión, base y Storage simulados; no usa la base compartida.
function cargar(archivo, mocks, cache = new Map()) {
  const absoluto = path.resolve(archivo)
  if (cache.has(absoluto)) return cache.get(absoluto).exports
  const loadedModule = { exports: {} }
  cache.set(absoluto, loadedModule)
  const codigo = ts.transpileModule(fs.readFileSync(absoluto, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText
  const importar = nombre => {
    if (Object.hasOwn(mocks, nombre)) return mocks[nombre]
    if (nombre === 'server-only') return {}
    if (nombre.startsWith('@/')) return cargar(`${nombre.slice(2)}.ts`, mocks, cache)
    if (nombre.startsWith('.')) return cargar(path.resolve(path.dirname(absoluto), `${nombre}.ts`), mocks, cache)
    return require(nombre)
  }
  vm.runInNewContext(`(function(require,module,exports){${codigo}\n})`, {
    Date, File, FormData, crypto, window: mocks.$window,
    setTimeout: mocks.$setTimeout || setTimeout, clearTimeout,
  })(importar, loadedModule, loadedModule.exports)
  return loadedModule.exports
}

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
  }), /redirect/)
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
  return { enviar: () => pagina.props.children.props.onSubmit({ preventDefault() {} }), estados, destino: () => destino }
}

test('el login autentica y navega sin depender de escrituras de perfil', async () => {
  const f = formularioLogin(async () => ({ error: null }))
  await f.enviar()
  assert.equal(f.destino(), '/pacientes')
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
