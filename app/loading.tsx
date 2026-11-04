export default function Cargando() {
  return <div className="mx-auto w-full max-w-4xl p-8" role="status" aria-live="polite"><p className="eyebrow">Portal Pediatría</p><p className="mb-6 text-sm text-[#7c9487]">Estamos preparando tu espacio…</p><div className="card min-h-36 animate-pulse mb-5" /><div className="grid grid-cols-3 gap-4">{[1, 2, 3].map(i => <div className="card min-h-24 animate-pulse" key={i} />)}</div></div>
}
