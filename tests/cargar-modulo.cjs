/* eslint-disable @typescript-eslint/no-require-imports -- Cargador de módulos para pruebas aisladas. */
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')

// Ejecuta los módulos reales con sesión, base y Storage simulados; no usa la base compartida.
function cargar(archivo, mocks, cache = new Map()) {
  let absoluto = path.resolve(archivo)
  if (!fs.existsSync(absoluto) && absoluto.endsWith('.ts')) absoluto += 'x'
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
  vm.compileFunction(codigo, ['require', 'module', 'exports', 'window', 'setTimeout', 'clearTimeout'], { filename: absoluto })(
    importar, loadedModule, loadedModule.exports, mocks.$window, mocks.$setTimeout || setTimeout, clearTimeout,
  )
  return loadedModule.exports
}

module.exports = { cargar }
