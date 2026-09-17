'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { schema, type PacienteFormData as FormData } from '../schema'
import { crearPaciente } from '../actions'

const PASOS = [
  { titulo: 'Datos del paciente', campos: ['nombre', 'apellido', 'dni', 'fechaNac', 'sexo'] },
  { titulo: 'Contacto y tutores', campos: ['tutorNombre', 'tutorDni', 'telefono', 'email', 'direccion', 'contactoEmergencia'] },
  { titulo: 'Datos médicos', campos: ['antecedentesFamiliares', 'alergias', 'pesoNacer', 'tallaNacer', 'grupoSanguineo', 'observaciones'] },
  { titulo: 'Obra social', campos: ['obraSocial', 'numeroAfiliado', 'plan', 'particular'] },
  { titulo: 'Confirmación', campos: [] },
] as const

export default function PacienteWizard() {
  const [paso, setPaso] = useState(0)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    trigger,
    getValues,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  })

  const valores = watch()

  async function siguiente() {
    const campos = [...PASOS[paso].campos] as (keyof FormData)[]
    const valido = campos.length === 0 || (await trigger(campos))
    if (valido) setPaso((p) => Math.min(p + 1, PASOS.length - 1))
  }

  function anterior() {
    setPaso((p) => Math.max(p - 1, 0))
  }

  async function confirmar() {
    setEnviando(true)
    setError(null)
    const data = schema.parse(getValues())
    const resultado = await crearPaciente(data)
    if (resultado?.error) {
      setError(resultado.error)
      setEnviando(false)
    }
  }

  return (
    <div className="card">
      <div className="mb-6 flex items-center gap-2">
        {PASOS.map((p, i) => (
          <div
            key={p.titulo}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i <= paso ? 'bg-[#3e6fa8]' : 'bg-[#e3e7e2]'
            }`}
          />
        ))}
      </div>
      <p className="mb-6 text-sm text-[#5b6b64]">
        Paso {paso + 1} de {PASOS.length} — {PASOS[paso].titulo}
      </p>

      <div className="space-y-4">
        {paso === 0 && (
          <>
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
          </>
        )}

        {paso === 1 && (
          <>
            <Campo label="Nombre del tutor"><input {...register('tutorNombre')} className="input" /></Campo>
            <Campo label="DNI del tutor"><input {...register('tutorDni')} className="input" /></Campo>
            <Campo label="Teléfono"><input {...register('telefono')} className="input" /></Campo>
            <Campo label="Email" error={errors.email?.message}>
              <input {...register('email')} className="input" />
            </Campo>
            <Campo label="Dirección"><input {...register('direccion')} className="input" /></Campo>
            <Campo label="Contacto de emergencia"><input {...register('contactoEmergencia')} className="input" /></Campo>
          </>
        )}

        {paso === 2 && (
          <>
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
          </>
        )}

        {paso === 3 && (
          <>
            <Campo label="Obra social / prepaga"><input {...register('obraSocial')} className="input" /></Campo>
            <Campo label="Número de afiliado"><input {...register('numeroAfiliado')} className="input" /></Campo>
            <Campo label="Plan"><input {...register('plan')} className="input" /></Campo>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register('particular')} />
              Paciente particular (sin cobertura)
            </label>
          </>
        )}

        {paso === 4 && (
          <div className="space-y-2 rounded border border-[#e3e7e2] p-4 text-sm">
            <p><strong>Nombre:</strong> {valores.nombre} {valores.apellido}</p>
            <p><strong>DNI:</strong> {valores.dni}</p>
            <p><strong>Fecha de nacimiento:</strong> {valores.fechaNac}</p>
            <p><strong>Tutor:</strong> {valores.tutorNombre || '—'}</p>
            <p><strong>Teléfono:</strong> {valores.telefono || '—'}</p>
            <p><strong>Alergias:</strong> {valores.alergias || '—'}</p>
            <p><strong>Obra social:</strong> {valores.obraSocial || (valores.particular ? 'Particular' : '—')}</p>
            <p className="pt-2 text-[#5b6b64]">Revisá los datos. Podés volver a cualquier paso para corregir.</p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-8 flex justify-between">
        <button type="button" onClick={anterior} disabled={paso === 0} className="btn btn-outline disabled:opacity-40">
          <ChevronLeft size={16} />
          Anterior
        </button>

        {paso < PASOS.length - 1 ? (
          <button type="button" onClick={siguiente} className="btn btn-primary">
            Siguiente
            <ChevronRight size={16} />
          </button>
        ) : (
          <button type="button" onClick={confirmar} disabled={enviando} className="btn btn-primary disabled:opacity-50">
            <Check size={16} />
            {enviando ? 'Guardando...' : 'Guardar paciente'}
          </button>
        )}
      </div>
    </div>
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