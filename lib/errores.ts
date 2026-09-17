import { Prisma } from '@prisma/client'

export function mensajeError(error: unknown): string {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Violación de campo único (ej: DNI repetido)
    if (error.code === 'P2002') {
      const campo = (error.meta?.target as string[])?.[0]
      if (campo === 'dni') return 'Ya existe un paciente con ese DNI.'
      if (campo === 'email') return 'Ese email ya está registrado.'
      return 'Ya existe un registro con ese dato.'
    }
    // Referencia a un registro que no existe (ej: paciente eliminado)
    if (error.code === 'P2025') {
      return 'El registro que intentás modificar ya no existe.'
    }
    // Clave foránea inválida
    if (error.code === 'P2003') {
      return 'No se pudo completar la operación: hay datos relacionados inválidos.'
    }
  }

  // Error de conexión a la base de datos
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return 'No se pudo conectar con la base de datos. Intentá de nuevo en unos segundos.'
  }

  // Cualquier otro error no contemplado
  return 'Ocurrió un error inesperado. Si el problema persiste, contactá al soporte técnico.'
}