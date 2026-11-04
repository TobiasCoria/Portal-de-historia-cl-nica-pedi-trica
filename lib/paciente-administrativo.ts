import type { Prisma } from '@prisma/client'

export const pacienteAdministrativo = {
  esDemo: true, id: true, nombre: true, apellido: true, dni: true, fechaNac: true, sexo: true, fotoUrl: true,
  tutorNombre: true, tutorDni: true, tutorVinculo: true, telefono: true, email: true, direccion: true,
  contactoEmergencia: true, obraSocial: true, numeroAfiliado: true, plan: true, particular: true,
  consentimientoAt: true, consentimientoPor: true, creadoEn: true, actualizadoEn: true, eliminadoEn: true,
} satisfies Prisma.PacienteSelect

export const camposClinicosVacios = {
  antecedentesFamiliares: null, alergias: null, pesoNacer: null, tallaNacer: null,
  grupoSanguineo: null, observaciones: null,
}
