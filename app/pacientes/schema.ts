import { z } from 'zod'
import { fechaValida, fechaHoy } from '@/lib/fechas'

export const schema = z.object({
  // Paso 1
  nombre: z.string().min(1, 'Requerido'),
  apellido: z.string().min(1, 'Requerido'),
  dni: z.string().min(1, 'Requerido'),
  fechaNac: z.string().refine(v => fechaValida(v) && v >= '1901-01-01' && v <= fechaHoy(), 'Ingresá una fecha de nacimiento válida, hasta hoy.'),
  sexo: z.enum(['MASCULINO', 'FEMENINO']).optional(),

  // Paso 2
  tutorNombre: z.string().optional(),
  tutorDni: z.string().optional(),
  tutorVinculo: z.string().trim().optional(),
  telefono: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  direccion: z.string().optional(),
  contactoEmergencia: z.string().optional(),

  // Paso 3
  antecedentesFamiliares: z.string().optional(),
  alergias: z.string().optional(),
  pesoNacer: z.number().finite().positive('Ingresá un valor mayor a cero.').optional(),
  tallaNacer: z.number().finite().positive('Ingresá un valor mayor a cero.').optional(),
  grupoSanguineo: z.string().optional(),
  observaciones: z.string().optional(),

  // Paso 4
  obraSocial: z.string().optional(),
  numeroAfiliado: z.string().optional(),
  plan: z.string().optional(),
  particular: z.boolean().optional(),
})

export type PacienteFormData = z.infer<typeof schema>

export const schemaAlta = schema.extend({
  tutorNombre: z.string().trim().min(1, 'Ingresá el nombre del tutor.'),
  tutorDni: z.string().trim().min(1, 'Ingresá el DNI del tutor.'),
  tutorVinculo: z.string().trim().min(1, 'Ingresá el vínculo con el paciente.'),
  consentimiento: z.boolean().refine(valor => valor, 'Confirmá el consentimiento del tutor para guardar.'),
})

export type PacienteAltaData = z.infer<typeof schemaAlta>
