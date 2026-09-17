import { z } from 'zod'

export const schema = z.object({
  // Paso 1
  nombre: z.string().min(1, 'Requerido'),
  apellido: z.string().min(1, 'Requerido'),
  dni: z.string().min(1, 'Requerido'),
  fechaNac: z.string().min(1, 'Requerido').refine((val) => {
    const fecha = new Date(val)
    const anio = fecha.getFullYear()
    return anio > 1900 && anio <= new Date().getFullYear()
  }, 'Fecha de nacimiento inválida'),
  sexo: z.enum(['MASCULINO', 'FEMENINO']).optional(),

  // Paso 2
  tutorNombre: z.string().optional(),
  tutorDni: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  direccion: z.string().optional(),
  contactoEmergencia: z.string().optional(),

  // Paso 3
  antecedentesFamiliares: z.string().optional(),
  alergias: z.string().optional(),
  pesoNacer: z.coerce.number().optional(),
  tallaNacer: z.coerce.number().optional(),
  grupoSanguineo: z.string().optional(),
  observaciones: z.string().optional(),

  // Paso 4
  obraSocial: z.string().optional(),
  numeroAfiliado: z.string().optional(),
  plan: z.string().optional(),
  particular: z.boolean().optional(),
})

export type PacienteFormData = z.infer<typeof schema>