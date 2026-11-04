/* eslint-disable @typescript-eslint/no-require-imports -- Herramienta local de QA; solo usa datos ficticios y un navegador temporal. */
const fs = require('node:fs')
const path = require('node:path')
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const { chromium } = require('playwright')
const { cargar } = require('../tests/cargar-modulo.cjs')
const salida = path.resolve('artifacts/qa')

const id = 'd3000000-0000-4000-8000-000000000001'
const paciente = {
  id, nombre: 'Emilia', apellido: 'Luna (Demo)', dni: 'DEMO-PORTAL-001', esDemo: true,
  fechaNac: new Date('2025-12-18'), sexo: 'FEMENINO', fotoUrl: null,
  tutorNombre: 'Familia Luna · ficticia', tutorDni: 'DEMO-TUTOR-1', tutorVinculo: 'Tutor ficticio',
  telefono: null, email: 'familia1@example.invalid', direccion: 'Domicilio ficticio · Rosario', contactoEmergencia: null,
  obraSocial: 'IAPOS · ejemplo', particular: false, numeroAfiliado: 'DEMO-AF-1', plan: null,
  alergias: 'Alerta ficticia de demostración.', antecedentesFamiliares: 'Texto ficticio para revisar la lectura de antecedentes.',
  pesoNacer: 3.2, tallaNacer: 49, grupoSanguineo: null, observaciones: 'Registro ficticio para probar el portal.',
  consentimientoAt: null, consentimientoPor: null, creadoEn: new Date(), actualizadoEn: new Date(), eliminadoEn: null,
}
const hoy = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
const turnos = [9, 10, 14].map((h, i) => ({ id: `turno-${i}`, pacienteId: id, fecha: new Date(`${hoy}T${String(h).padStart(2, '0')}:00:00-03:00`), motivo: 'Encuentro de demostración', estado: 'PENDIENTE', duracion: 30, paciente, consultaId: null, observaciones: null, creadoEn: new Date() }))
const consulta = { id: 'consulta-demo', pacienteId: id, fecha: new Date('2026-10-20T13:00:00Z'), motivo: 'Encuentro de demostración', diagnostico: 'Texto ficticio para revisar la historia clínica.', tratamiento: 'Contenido de ejemplo, sin indicaciones reales.', observaciones: 'Datos ficticios para la revisión visual.', peso: 8.4, talla: 72, version: 1, autorEmail: 'demo@portal.invalid', documentos: [], revisiones: [], eliminadoEn: null, creadoEn: new Date(), creadoPorId: null }
const vacuna = { id: 'vacuna-demo', pacienteId: id, nombre: 'Vacuna de demostración', dosis: 'Ejemplo', fechaAplicada: new Date('2026-10-01'), fechaProgramada: null, observaciones: 'No acredita vacunación real.', paciente, eliminadoEn: null, creadoEn: new Date() }

function mocks(ruta) {
  const nombres = ['Emilia', 'Mateo', 'Sofía', 'Benjamín', 'Olivia']
  const personas = nombres.map((nombre, i) => ({ ...paciente, id: `${id.slice(0, -1)}${i + 1}`, nombre, apellido: ['Luna', 'Ríos', 'Vega', 'Soler', 'Paz'][i] + ' (Demo)' }))
  return {
    '@/lib/auth': { requireUser: async () => ({ email: 'demo@portal.invalid', nombre: 'Doctora', rol: 'DOCTORA' }), requireRole: async () => ({ email: 'demo@portal.invalid', nombre: 'Doctora', rol: 'DOCTORA' }), requireDoctora: async () => ({}), esDoctora: () => true },
    '@/lib/perfiles-data': { obtenerPerfil: async () => ({ nombre: 'Doctora · demostración', color: '#3e6fa8', avatarUrl: null, rol: 'DOCTORA', matricula: null }) },
    '@/lib/prisma': { prisma: {
      paciente: { findUnique: async () => paciente, findFirst: async () => paciente, findMany: async () => personas, count: async () => 5 },
      consulta: { findMany: async () => [consulta], count: async () => 1, findFirst: async () => consulta },
      documento: { findMany: async () => [] },
      vacunaAplicada: { count: async () => 1, findMany: async q => q.where?.fechaAplicada === null ? [{ ...vacuna, fechaAplicada: null, fechaProgramada: new Date(hoy) }] : [vacuna] },
      turno: { findMany: async () => turnos, count: async () => 3 }, perfil: { findUnique: async () => ({ nombre: 'Doctora · demostración', matricula: null }) },
      logAuditoria: { findMany: async () => [] },
    } },
    'next/navigation': { usePathname: () => ruta, useRouter: () => ({ push() {}, refresh() {} }), notFound() { throw new Error('404') } },
    'next/form': { default: ({ children, ...props }) => React.createElement('form', props, children) },
    'next/link': { useLinkStatus: () => ({ pending: false }), default: ({ href, children, prefetch: _p, ...props }) => { void _p; return React.createElement('a', { href, ...props }, children) } },
    'next/cache': { revalidatePath() {} },
  }
}

async function resolver(elemento) {
  if (!React.isValidElement(elemento)) return elemento
  if (typeof elemento.type === 'function' && elemento.type.constructor.name === 'AsyncFunction') return resolver(await elemento.type(elemento.props))
  if (elemento.props.children) {
    const children = await Promise.all(React.Children.toArray(elemento.props.children).map(async (hijo, i) => {
      const resuelto = await resolver(hijo)
      return React.isValidElement(resuelto) ? React.cloneElement(resuelto, { key: hijo.key || `qa-${i}` }) : resuelto
    }))
    return React.cloneElement(elemento, { children })
  }
  return elemento
}

async function ejecutar() {
  fs.mkdirSync(salida, { recursive: true })
  const browser = await chromium.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true })
  try {
    const page = await browser.newPage()
    const respuesta = await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' })
    if (!respuesta.ok() || !(await page.getByText('¿Quién ingresa hoy?').count())) throw new Error('El login no cargó correctamente; no se acepta la revisión visual.')
    const styles = await page.locator('link[rel="stylesheet"]').evaluateAll(nodes => nodes.map(n => n.href))
    const fontClasses = await page.locator('html').getAttribute('class')
    for (const width of [1440, 768, 390]) {
      await page.setViewportSize({ width, height: 1000 })
      const cargada = await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' })
      if (!cargada.ok()) throw new Error('El login devolvió un error de servidor.')
      await page.screenshot({ path: path.join(salida, `login-${width}.png`), fullPage: true })
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
      if (overflow) throw new Error(`Desborde horizontal en login, ancho ${width}`)
      await page.getByRole('button', { name: /Doctora/ }).click()
      if (!(await page.getByLabel('Contraseña', { exact: true }).isVisible())) throw new Error('El selector no abrió el formulario de ingreso.')
      await page.screenshot({ path: path.join(salida, `ingreso-${width}.png`), fullPage: true })
      await page.getByRole('link', { name: 'Olvidé mi contraseña' }).click()
      await page.getByRole('heading', { name: '¿Olvidaste tu contraseña?' }).waitFor()
      await page.screenshot({ path: path.join(salida, `recuperacion-${width}.png`), fullPage: true })
      for (const [nombre, archivo, parametros, ruta] of [
        ['hoy', 'app/hoy/page.tsx', {}, '/hoy'],
        ['pacientes', 'app/pacientes/page.tsx', { searchParams: Promise.resolve({}) }, '/pacientes'],
        ['ficha', 'app/pacientes/[id]/page.tsx', { params: Promise.resolve({ id }), searchParams: Promise.resolve({}) }, '/pacientes'],
        ['agenda', 'app/agenda/page.tsx', { searchParams: Promise.resolve({ vista: 'semana' }) }, '/agenda'],
        ['consulta', 'app/pacientes/[id]/consultas/nueva/page.tsx', { params: Promise.resolve({ id }), searchParams: Promise.resolve({}) }, '/pacientes'],
      ]) {
        const Page = cargar(archivo, mocks(ruta)).default
        const elemento = await resolver(await Page(parametros))
        const body = renderToStaticMarkup(elemento)
        await page.setContent(`<!doctype html><html lang="es" class="${fontClasses}"><head><meta name="viewport" content="width=device-width,initial-scale=1">${styles.map(h => `<link rel="stylesheet" href="${h}">`).join('')}</head><body>${body}</body></html>`, { waitUntil: 'networkidle' })
        await page.evaluate(() => document.fonts.ready)
        await page.screenshot({ path: path.join(salida, `${nombre}-${width}.png`), fullPage: true })
        const desborde = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
        if (desborde) throw new Error(`Desborde horizontal en ${nombre}, ancho ${width}`)
      }
    }
    console.log('Revisión visual: 24 capturas, escritorio, tablet y celular. Login y navegación a recuperación probados en el servidor real. Las pantallas protegidas usan dependencias simuladas con datos ficticios; no se accede a sesiones ni datos reales.')
  } finally { await browser.close() }
}
ejecutar().catch(e => { console.error(e.message); process.exitCode = 1 })
