import Form from 'next/form'
import Link from '@/app/components/enlace'
import { Search, Plus } from 'lucide-react'
import { requireUser } from '@/lib/auth'
import { obtenerPerfil } from '@/lib/perfiles-data'
import { ZONA } from '@/lib/fechas'
import Brand, { Marca } from './brand'
import NavLinks from './nav-links'
import MenuPerfil from './menu-perfil'

export default async function Nav() {
  const user = await requireUser()
  const perfil = await obtenerPerfil(user.email!)
  const nombre = perfil?.nombre || user.nombre
  const color = perfil?.color || '#3e6fa8'
  return <>
    <a href="#contenido" className="skip-link">Saltar al contenido</a>
    <aside className="sidebar"><Link href="/hoy" aria-label="Portal Pediatría, inicio"><Brand /></Link><p className="sidebar-label">Tu espacio de trabajo</p><NavLinks doctora={user.rol === 'DOCTORA'} />
      <div className="sidebar-note"><strong>Pequeños pasos.<br />Grandes historias.</strong>Un espacio para acompañar<br />cada etapa de su crecimiento.</div>
    </aside>
    <header className="topbar"><div className="mobile-brand"><Marca />Pediatría</div><div className="topbar-date"><strong>Tu consultorio, en orden.</strong>{new Date().toLocaleDateString('es-AR', { timeZone: ZONA, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
      <div className="topbar-actions"><Form action="/pacientes" className="topbar-search"><Search size={14} /><label className="screen-reader" htmlFor="buscar-global">Buscar pacientes</label><input id="buscar-global" name="q" className="input" placeholder="Buscá un paciente…" /></Form><Link href="/pacientes/nuevo" className="btn btn-primary"><Plus size={14} />Nuevo paciente</Link><MenuPerfil nombre={nombre} email={user.email!} rol={user.rol} color={color} avatarUrl={perfil?.avatarUrl} /></div>
    </header><div id="contenido" tabIndex={-1} />
  </>
}
