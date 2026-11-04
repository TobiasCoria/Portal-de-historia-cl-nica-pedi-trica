/* eslint-disable @typescript-eslint/no-require-imports -- Genera una muestra ficticia para control visual local. */
const fs = require('node:fs')
const path = require('node:path')
const { cargar } = require('../tests/cargar-modulo.cjs')
async function ejecutar() {
  const { crearPdf } = cargar('lib/pdf.ts', {})
  const bytes = await crearPdf({ titulo: 'Historia clínica pediátrica', profesional: 'Profesional de demostración', matricula: 'DEMO - sin validez', paciente: 'Emilia Luna (Demo)', dni: 'DEMO-PORTAL-001', nacimiento: '2025-12-18', demo: true,
    secciones: [
      { titulo: 'Datos del paciente y su entorno', campos: [
        { etiqueta: 'Tutor', valor: 'Familia Luna - ficticia' }, { etiqueta: 'Alergias', valor: 'Alerta ficticia para probar la visualización.' },
        { etiqueta: 'Antecedentes familiares', valor: 'Contenido íntegramente ficticio para la revisión del documento.' },
      ] },
      ...Array.from({ length: 6 }, (_, i) => ({ titulo: `Encuentro de demostración ${i + 1}`, campos: [
        { etiqueta: 'Motivo', valor: 'Consulta ficticia para probar el diseño de la historia.' },
        { etiqueta: 'Observaciones', valor: 'Texto de demostración, con acentos y eñes. No corresponde a una persona ni a una atención real. '.repeat(5) },
      ] })),
    ],
  })
  const salida = path.resolve('artifacts/qa/historia-demostracion.pdf')
  fs.mkdirSync(path.dirname(salida), { recursive: true })
  fs.writeFileSync(salida, bytes)
  console.log('PDF ficticio de control visual generado.')
}
ejecutar().catch(() => { console.error('No se pudo generar la muestra.'); process.exitCode = 1 })
