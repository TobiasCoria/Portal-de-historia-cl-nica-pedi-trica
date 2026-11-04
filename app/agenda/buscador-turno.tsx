'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarPlus, Search } from 'lucide-react'
import { listarPacientes } from '../pacientes/actions'

type Paciente = {
  id: string
  nombre: string
  apellido: string
  dni: string
}

export default function BuscadorTurno() {
  const [abierto, setAbierto] = useState(false)
  const [query, setQuery] = useState('')
  const [resultados, setResultados] = useState<Paciente[]>([])
  const [buscando, setBuscando] = useState(false)
  const router = useRouter()
  const request = useRef(0)
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => { if (timeout.current) clearTimeout(timeout.current); request.current++ }, [])

  function onChange(valor: string) {
    setQuery(valor)
    const actual = ++request.current
    if (timeout.current) clearTimeout(timeout.current)
    if (valor.trim().length < 2) { setResultados([]); setBuscando(false); return }
    setBuscando(true)
    timeout.current = setTimeout(async () => {
      try { const pacientes = await listarPacientes(valor.trim()); if (request.current === actual) setResultados(pacientes) }
      catch { if (request.current === actual) setResultados([]) }
      finally { if (request.current === actual) setBuscando(false) }
    }, 250)
  }

  function elegirPaciente(id: string) {
    router.push(`/pacientes/${id}/turnos/nuevo`)
  }

  if (!abierto) {
    return (
      <button onClick={() => setAbierto(true)} className="btn btn-primary">
        <CalendarPlus size={16} />
        Agendar turno
      </button>
    )
  }

  return (
    <div className="relative min-w-60">
      <div className="relative max-w-sm">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa5a0]" />
        <input
          autoFocus
          value={query}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Buscar paciente por nombre, apellido o DNI..."
          className="input"
          style={{ paddingLeft: '2.25rem' }}
        />
      </div>

      {query.trim().length >= 2 && (
        <div className="card absolute right-0 z-20 mt-2 w-full min-w-64 p-1 shadow-lg">
          {buscando ? (
            <p className="p-2 text-sm text-[#5b6b64]">Buscando...</p>
          ) : resultados.length === 0 ? (
            <p className="p-2 text-sm text-[#5b6b64]">No se encontraron pacientes.</p>
          ) : (
            resultados.map((p) => (
              <button
                key={p.id}
                onClick={() => elegirPaciente(p.id)}
                className="flex w-full items-center justify-between rounded px-3 py-2 text-left text-sm hover:bg-[#f0f4f8]"
              >
                <span>{p.apellido}, {p.nombre}</span>
                <span className="text-[#5b6b64]">DNI {p.dni}</span>
              </button>
            ))
          )}
        </div>
      )}

      <button
        onClick={() => { request.current++; if (timeout.current) clearTimeout(timeout.current); setAbierto(false); setQuery(''); setResultados([]) }}
        className="btn-link mt-2 text-xs"
      >
        Cancelar
      </button>
    </div>
  )
}