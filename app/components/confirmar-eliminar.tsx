'use client'

export default function ConfirmarEliminar({
  children,
  mensaje = '¿Estás seguro que querés eliminar esto? Esta acción no se puede deshacer.',
}: {
  children: React.ReactNode
  mensaje?: string
}) {
  return (
    <div
      onSubmit={(e) => {
        if (!confirm(mensaje)) {
          e.preventDefault()
        }
      }}
    >
      {children}
    </div>
  )
}