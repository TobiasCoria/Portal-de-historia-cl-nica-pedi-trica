export function Marca({ className = 'brand-mark' }: { className?: string }) {
  return <svg className={className} viewBox="0 0 50 50" fill="none" aria-hidden="true"><path d="M25 42V23M25 30C11 31 8 22 10 13c10-1 17 6 15 17ZM25 23C23 10 31 5 40 8c1 9-4 16-15 15Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /><circle cx="12" cy="39" r="3" fill="currentColor" opacity=".5" /><path d="M31 35c6-5 11-2 12 2-2 6-9 7-12-2Z" fill="currentColor" opacity=".3" /></svg>
}
export default function Brand() {
  return <div className="brand"><Marca /><div className="brand-name">Portal Pediatría<span className="brand-subtitle">Cuidar cada etapa</span></div></div>
}
