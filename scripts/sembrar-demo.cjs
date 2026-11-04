/* eslint-disable @typescript-eslint/no-require-imports -- Script administrativo CommonJS, no se incluye en el cliente. */
/* Datos íntegramente ficticios. Ejecución administrativa explícita; nunca se expone como endpoint. */
require('dotenv').config({ quiet: true })
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const uid = n => `d3000000-0000-4000-8000-${String(n).padStart(12, '0')}`
const hoy = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
const datos = [
  { nombre: 'Emilia', apellido: 'Luna (Demo)', fechaNac: '2025-12-18', sexo: 'FEMENINO', tutor: 'Familia Luna · ficticia', cobertura: 'IAPOS · ejemplo', hora: '09:00', estado: 'ATENDIDO', peso: 8.4, talla: 72 },
  { nombre: 'Mateo', apellido: 'Ríos (Demo)', fechaNac: '2022-06-07', sexo: 'MASCULINO', tutor: 'Familia Ríos · ficticia', cobertura: null, hora: '10:00', estado: 'PENDIENTE', peso: 17, talla: 105 },
  { nombre: 'Sofía', apellido: 'Vega (Demo)', fechaNac: '2019-04-22', sexo: 'FEMENINO', tutor: 'Familia Vega · ficticia', cobertura: 'Cobertura de ejemplo', hora: '11:00', estado: 'PENDIENTE', peso: 24, talla: 122 },
  { nombre: 'Benjamín', apellido: 'Soler (Demo)', fechaNac: '2015-09-03', sexo: 'MASCULINO', tutor: 'Familia Soler · ficticia', cobertura: 'IAPOS · ejemplo', hora: '14:00', estado: 'AUSENTE', peso: 37, talla: 144 },
  { nombre: 'Olivia', apellido: 'Paz (Demo)', fechaNac: '2024-03-11', sexo: 'FEMENINO', tutor: 'Familia Paz · ficticia', cobertura: null, hora: '15:00', estado: 'PENDIENTE', peso: 12, talla: 89 },
]

async function ejecutar() {
  if (!process.argv.includes('--confirmar-demo')) throw new Error('Indicá --confirmar-demo para cargar los cinco registros ficticios.')
  let creados = 0, existentes = 0
  await prisma.$transaction(async tx => {
    for (let i = 0; i < datos.length; i++) {
      const d = datos[i], numero = i + 1, id = uid(numero), dni = `DEMO-PORTAL-${String(numero).padStart(3, '0')}`
      const anterior = await tx.paciente.findFirst({ where: { OR: [{ id }, { dni }] }, select: { id: true, esDemo: true } })
      if (anterior) {
        if (anterior.id !== id || !anterior.esDemo) throw new Error('Un identificador reservado está ocupado. No se modificó el registro existente.')
        existentes++; continue
      }
      await tx.paciente.create({ data: {
        id, dni, nombre: d.nombre, apellido: d.apellido, fechaNac: new Date(d.fechaNac), sexo: d.sexo, esDemo: true,
        tutorNombre: d.tutor, tutorDni: `DEMO-TUTOR-${numero}`, tutorVinculo: 'Tutor ficticio',
        email: `familia${numero}@example.invalid`, direccion: 'Domicilio ficticio · Rosario',
        particular: !d.cobertura, obraSocial: d.cobertura, numeroAfiliado: d.cobertura ? `DEMO-AF-${numero}` : null,
        antecedentesFamiliares: 'Contenido de demostración. No corresponde a una persona real.',
        observaciones: 'Paciente ficticio para probar el portal. No usar para atención real.',
        alergias: i === 1 ? 'Alerta ficticia para probar la visualización de alergias.' : null,
        pesoNacer: 3.2, tallaNacer: 49,
        // No se simula una aceptación legal: el consentimiento queda pendiente.
      } })
      const consultaId = uid(100 + numero)
      await tx.consulta.create({ data: {
        id: consultaId, pacienteId: id, fecha: new Date(i === 0 ? `${hoy}T09:00:00-03:00` : '2026-10-20T10:00:00-03:00'),
        motivo: 'Encuentro de demostración', diagnostico: 'Texto ficticio para revisar la historia clínica.',
        tratamiento: 'Contenido de ejemplo, sin indicaciones médicas reales.', peso: d.peso, talla: d.talla,
        observaciones: 'Registro de prueba. No corresponde a una atención real.', autorEmail: 'demo@portal.invalid',
      } })
      await tx.turno.create({ data: {
        id: uid(200 + numero), pacienteId: id, fecha: new Date(`${hoy}T${d.hora}:00-03:00`), duracion: 30,
        motivo: 'Turno ficticio · demostración', estado: d.estado, consultaId: i === 0 ? consultaId : null,
      } })
      await tx.vacunaAplicada.create({ data: {
        id: uid(300 + numero), pacienteId: id, nombre: 'Vacuna de demostración', dosis: 'Ejemplo de registro',
        fechaAplicada: new Date('2026-10-01'), observaciones: 'Dato ficticio; no acredita vacunación real.',
      } })
      const siguiente = new Date(`${hoy}T12:00:00-03:00`)
      siguiente.setUTCDate(siguiente.getUTCDate() + (i === 1 ? -2 : i + 1))
      await tx.vacunaAplicada.create({ data: {
        id: uid(400 + numero), pacienteId: id, nombre: 'Dosis programada de ejemplo', dosis: 'Demostración',
        fechaProgramada: new Date(siguiente.toISOString().slice(0, 10)), observaciones: 'Programación ficticia para probar pendientes.',
      } })
      for (const [entidad, entidadId] of [['Paciente', id], ['Consulta', consultaId], ['Turno', uid(200 + numero)], ['VacunaAplicada', uid(300 + numero)], ['VacunaAplicada', uid(400 + numero)]]) {
        await tx.logAuditoria.create({ data: { usuarioEmail: 'demo@portal.invalid', accion: 'ALTA', entidad, entidadId, pacienteId: id, detalle: JSON.stringify({ campos: ['demostracion'] }) } })
      }
      creados++
    }
  }, { timeout: 60000, isolationLevel: 'Serializable' })
  console.log(`Demostración: ${creados} pacientes ficticios creados; ${existentes} ya existían. No se modificaron registros previos.`)
}
ejecutar().catch(() => { console.error('No se completó la carga de demostración. No se aplicaron cambios parciales.'); process.exitCode = 1 }).finally(() => prisma.$disconnect())
