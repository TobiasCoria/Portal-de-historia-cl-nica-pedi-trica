'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Sun, Users, CalendarDays, Archive, ShieldCheck, Settings2 } from 'lucide-react'

const enlaces = [
  { href: '/hoy', label: 'Hoy', icon: Sun }, { href: '/pacientes', label: 'Pacientes', icon: Users },
  { href: '/agenda', label: 'Agenda', icon: CalendarDays }, { href: '/archivo', label: 'Archivo', icon: Archive, clinico: true },
  { href: '/auditoria', label: 'Auditoría', icon: ShieldCheck, clinico: true },
  { href: '/configuracion', label: 'Consultorio', icon: Settings2, clinico: true },
]
export default function NavLinks({ doctora }: { doctora: boolean }) {
  const pathname = usePathname()
  return <nav className="nav-links" aria-label="Navegación principal">{enlaces.filter(e => !e.clinico || doctora).map(e => <Link key={e.href} href={e.href} className={`nav-item ${pathname.startsWith(e.href) ? 'active' : ''}`} aria-current={pathname.startsWith(e.href) ? 'page' : undefined}><e.icon size={18} strokeWidth={1.6} /><span>{e.label}</span></Link>)}</nav>
}
