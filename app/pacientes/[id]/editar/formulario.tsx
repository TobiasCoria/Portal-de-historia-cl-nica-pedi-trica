'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check } from 'lucide-react'
import { schema, type PacienteFormData } from '../../schema'
import { actualizarPaciente } from '../../actions'
import type { Paciente } from '@prisma/client'

export default function FormularioEdicion({ paciente }: { paciente: Paciente }) {
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PacienteFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: paciente.nombre,
      apellido: paciente.apellido,
      dni: paciente.dni,
      fechaNac: new Date(paciente.fechaNac).toISOString().split('T')[0],
      sexo: paciente.sexo ?? undefined,
      tutorNombre: paciente.tutorNombre ?? '',
      tutorDni: paciente.tutorDni ?? '',
      telefono: paciente.telefono ?? '',
      email: paciente.email ?? '',
      direccion: paciente.direccion ?? '',
      contactoEmergencia: paciente.contactoEmergencia ?? '',
      antecedentesFamiliares: paciente.antecedentesFamiliares ?? '',
      alergias: paciente.alergias ?? '',
      pesoNacer: paciente.pesoNacer ?? undefined,
      tallaNacer: paciente.tallaNacer ?? undefined,
      grupoSanguineo: paciente.grupoSanguineo ?? '',
      observaciones: paciente.observaciones ?? '',
      obraSocial: paciente.obraSocial ?? '',
      numeroAfiliado: paciente.numeroAfiliado ?? '',
      plan: paciente.plan ?? '',
      particular: paciente.particular,
    },
  })

  async function onSubmit(data: PacienteFormData) {
    setEnviando(true)
    setError(null)
    const resultado = await actualizarPaciente(paciente.id, data)
    if (resultado?.error) {
      setError(resultado.error)
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4">
      <Campo label="Nombre" error={errors.nombre?.message}>
        <input {...register('nombre')} className="input" />
      </Campo>
      <Campo label="Apellido" error={errors.apellido?.message}>
        <input {...register('apellido')} className="input" />
      </Campo>
      <Campo label="DNI" error={errors.dni?.message}>
        <input {...register('dni')} className="input" />
      </Campo>
      <Campo label="Fecha de nacimiento" error={errors.fechaNac?.message}>
        <input type="date" {...register('fechaNac')} className="input" />
      </Campo>
      <Campo label="Sexo">
        <select {...register('sexo')} className="input">
          <option value="">Sin especificar</option>
          <option value="MASCULINO">Masculino</option>
          <option value="FEMENINO">Femenino</option>
        </select>
      </Campo>

      <hr className="my-4 border-[#e3e7e2]" />

      <Campo label="Nombre del tutor"><input {...register('tutorNombre')} className="input" /></Campo>
      <Campo label="DNI del tutor"><input {...register('tutorDni')} className="input" /></Campo>
      <Campo label="Teléfono"><input {...register('telefono')} className="input" /></Campo>
      <Campo label="Email" error={errors.email?.message}>
        <input {...register('email')} className="input" />
      </Campo>
      <Campo label="Dirección"><input {...register('direccion')} className="input" /></Campo>
      <Campo label="Contacto de emergencia"><input {...register('contactoEmergencia')} className="input" /></Campo>

      <hr className="my-4 border-[#e3e7e2]" />

      <Campo label="Antecedentes familiares">
        <textarea {...register('antecedentesFamiliares')} className="input" rows={3} />
      </Campo>
      <Campo label="Alergias">
        <textarea {...register('alergias')} className="input" rows={2} />
      </Campo>
      <div className="grid grid-cols-2 gap-4">
        <Campo label="Peso al nacer (kg)"><input type="number" step="0.01" {...register('pesoNacer')} className="input" /></Campo>
        <Campo label="Talla al nacer (cm)"><input type="number" step="0.1" {...register('tallaNacer')} className="input" /></Campo>
      </div>
      <Campo label="Grupo sanguíneo"><input {...register('grupoSanguineo')} className="input" /></Campo>
      <Campo label="Observaciones"><textarea {...register('observaciones')} className="input" rows={2} /></Campo>

      <hr className="my-4 border-[#e3e7e2]" />

      <Campo label="Obra social / prepaga"><input {...register('obraSocial')} className="input" /></Campo>
      <Campo label="Número de afiliado"><input {...register('numeroAfiliado')} className="input" /></Campo>
      <Campo label="Plan"><input {...register('plan')} className="input" /></Campo>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...register('particular')} />
        Paciente particular (sin cobertura)
      </label>

      {error && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="pt-4">
        <button type="submit" disabled={enviando} className="btn btn-primary disabled:opacity-50">
          <Check size={16} />
          {enviando ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  )
}

function Campo({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#1c2521]">{label}</label>
      <div className="mt-1">{children}</div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}