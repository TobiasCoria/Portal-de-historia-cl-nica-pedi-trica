import Link from 'next/link'
import { Syringe, CalendarDays } from 'lucide-react'
import { obtenerAgendaProxima } from '@/lib/agenda'
import Nav from '../components/nav'
import Volver from '../components/volver'
import BuscadorTurno from './buscador-turno'

export default async function AgendaPage() {
  const items = await obtenerAgendaProxima()

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-3xl">
        <Nav />
        <Volver href="/pacientes" />

        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl">Agenda</h1>
        </div>

        <BuscadorTurno />

        {items.length === 0 ? (
          <div className="card text-center text-[#5b6b64]">
            No hay vacunas ni turnos pendientes en los próximos 30 días.
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <Link
                key={`${item.tipo}-${item.id}`}
                href={`/pacientes/${item.pacienteId}`}
                className={`card flex items-center justify-between text-sm hover:opacity-90 ${
                  item.vencido ? 'card-alerta-roja' : item.urgente ? 'card-alerta-amarilla' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.tipo === 'vacuna' ? (
                    <Syringe size={16} className="text-[#5b6b64]" />
                  ) : (
                    <CalendarDays size={16} className="text-[#5b6b64]" />
                  )}
                  <div>
                    <span className="font-medium">{item.paciente.nombre} {item.paciente.apellido}</span>
                    <span className="ml-2 text-[#5b6b64]">— {item.titulo}</span>
                  </div>
                </div>
                <span
                  className={
                    item.vencido
                      ? 'font-medium text-red-600'
                      : item.urgente
                      ? 'font-medium text-[#c99a2e]'
                      : 'text-[#5b6b64]'
                  }
                >
                  {item.vencido ? '⚠ Vencido' : item.urgente ? '⏰ En menos de 24hs' : 'Próximo'}
                  {' — '}
                  {item.tipo === 'turno'
                    ? new Date(item.fecha).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
                    : new Date(item.fecha).toLocaleDateString('es-AR')}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}