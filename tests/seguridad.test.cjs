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
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  const importar = nombre => {
    if (Object.hasOwn(mocks, nombre)) return mocks[nombre]
    if (nombre === 'server-only') return {}
    if (nombre.startsWith('@/')) return cargar(`${nombre.slice(2)}.ts`, mocks, cache)
    if (nombre.startsWith('.')) return cargar(path.resolve(path.dirname(absoluto), `${nombre}.ts`), mocks, cache)
    return require(nombre)
  }
  vm.runInNewContext(`(function(require,module,exports){${codigo}\n})`, { Date, File, FormData, crypto })(importar, loadedModule, loadedModule.exports)
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
      return { email: 'cuenta-validada@example.test' }
    } },
    '@/lib/registros': { requirePaciente: async () => ({}) },
    'next/cache': { revalidatePath() {} },
    'next/navigation': { redirect() { throw new Error('redirect') } },
  }
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
