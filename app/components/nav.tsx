import Form from 'next/form'
import Link from '@/app/components/enlace'
import { Search, Plus } from 'lucide-react'
import { requireUser } from '@/lib/auth'
import { obtenerPerfil } from '@/lib/perfiles-data'
import { ZONA } from '@/lib/fechas'
import Brand, { Marca } from './brand'
import NavLinks from './nav-links'
import AvatarUploader from './avatar-uploader'
import LogoutButton from './logout-button'

export default async function Nav() {
  const user = await requireUser()
  const perfil = await obtenerPerfil(user.email!)
  const nombre = perfil?.nombre || user.nombre
  const color = perfil?.color || '#3e6fa8'
  return <>
    <a href="#contenido" className="skip-link">Saltar al contenido</a>
    <aside className="sidebar"><Link href="/hoy" aria-label="Portal Pediatría, inicio"><Brand /></Link><p className="sidebar-label">Tu espacio de trabajo</p><NavLinks doctora={user.rol === 'DOCTORA'} />
      <div className="sidebar-note"><strong>Pequeños pasos.<br />Grandes historias.</strong>Un espacio para acompañar<br />cada etapa de su crecimiento.</div>
      <div className="sidebar-user"><AvatarUploader email={user.email!} nombre={nombre} color={color} avatarUrl={perfil?.avatarUrl} /><div className="user-copy"><p>{nombre}</p><small>{user.rol === 'DOCTORA' ? 'Área clínica' : 'Administración'}</small></div><LogoutButton /></div>
    </aside>
    <header className="topbar"><div className="mobile-brand"><Marca />Pediatría</div><div className="topbar-date"><strong>Tu consultorio, en orden.</strong>{new Date().toLocaleDateString('es-AR', { timeZone: ZONA, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
      <div className="topbar-actions"><Form action="/pacientes" className="topbar-search"><Search size={14} /><label className="screen-reader" htmlFor="buscar-global">Buscar pacientes</label><input id="buscar-global" name="q" className="input" placeholder="Buscá un paciente…" /></Form><Link href="/pacientes/nuevo" className="btn btn-primary"><Plus size={14} />Nuevo paciente</Link><details className="mobile-account"><summary aria-label="Abrir opciones de tu cuenta"><span className="initial-avatar blue">{nombre.charAt(0)}</span></summary><div className="mobile-account-panel"><strong>{nombre}</strong><p>{user.rol === 'DOCTORA' ? 'Área clínica' : 'Administración'}</p><div className="my-4 flex items-center gap-3"><AvatarUploader email={user.email!} nombre={nombre} color={color} avatarUrl={perfil?.avatarUrl} /><span>Cambiar foto</span></div><div className="flex items-center gap-3"><LogoutButton /><span>Cerrar sesión</span></div></div></details></div>
    </header><div id="contenido" tabIndex={-1} />
  </>
}
