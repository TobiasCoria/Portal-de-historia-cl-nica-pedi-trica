import { z } from 'zod'
import { fechaValida } from '@/lib/fechas'

const fecha = z.string().refine(fechaValida, 'Ingresá una fecha válida.')
export const consultaSchema = z.object({
  motivo: z.string().trim().min(1, 'Completá este campo.'), diagnostico: z.string().optional(), tratamiento: z.string().optional(),
  peso: z.number().finite('Ingresá un número válido.').positive('Ingresá un valor mayor a cero.').optional(), talla: z.number().finite('Ingresá un número válido.').positive('Ingresá un valor mayor a cero.').optional(),
  observaciones: z.string().optional(),
})
const vacunaBase = z.object({
  nombre: z.string().trim().min(1, 'Completá este campo.'), dosis: z.string().optional(),
  fechaAplicada: fecha.optional().or(z.literal('')), fechaProgramada: fecha.optional().or(z.literal('')),
  observaciones: z.string().optional(),
})
export const vacunaSchema = vacunaBase.refine(d => Boolean(d.fechaAplicada || d.fechaProgramada), { message: 'Ingresá una fecha aplicada o una fecha programada.', path: ['fechaAplicada'] })
export const vacunaConProximaSchema = vacunaBase.extend({
  fechaAplicada: fecha, proximaDosis: z.string().optional(), proximaFecha: fecha.optional().or(z.literal('')),
})
export const turnoSchema = z.object({ fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, 'Ingresá fecha y hora.').refine(v => fechaValida(v.slice(0, 10)) && !Number.isNaN(Date.parse(v + '-03:00')), 'Ingresá fecha y hora válidas.'), duracion: z.number().int('Ingresá minutos enteros.').min(5, 'La duración mínima es de 5 minutos.').max(240, 'La duración máxima es de 240 minutos.').optional(), motivo: z.string().optional(), observaciones: z.string().optional() })
