import { z } from 'zod'

const fecha = z.string().refine(v => !Number.isNaN(new Date(v).getTime()), 'Ingresá una fecha válida.')
export const consultaSchema = z.object({
  motivo: z.string().trim().min(1), diagnostico: z.string().optional(), tratamiento: z.string().optional(),
  peso: z.number().finite().positive().optional(), talla: z.number().finite().positive().optional(),
  observaciones: z.string().optional(),
})
export const vacunaSchema = z.object({
  nombre: z.string().trim().min(1), dosis: z.string().optional(),
  fechaAplicada: fecha.optional().or(z.literal('')), fechaProgramada: fecha.optional().or(z.literal('')),
  observaciones: z.string().optional(),
})
export const vacunaConProximaSchema = vacunaSchema.extend({
  fechaAplicada: fecha, proximaDosis: z.string().optional(), proximaFecha: fecha.optional().or(z.literal('')),
})
export const turnoSchema = z.object({ fecha, motivo: z.string().optional(), observaciones: z.string().optional() })
