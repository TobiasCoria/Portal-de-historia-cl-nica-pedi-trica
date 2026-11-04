import { requireRole } from '@/lib/auth'
import { obtenerUrlDocumento } from '@/lib/documentos'
export async function GET(_request: Request, { params }: { params: Promise<{ documentoId: string }> }) {
  await requireRole('DOCTORA')
  const { documentoId } = await params
  try {
    const url = await obtenerUrlDocumento(documentoId)
    if (!url) return new Response('No se pudo abrir el documento.', { status: 404 })
    return new Response(null, { status: 302, headers: { Location: url, 'Cache-Control': 'private, no-store', 'Referrer-Policy': 'no-referrer' } })
  } catch { return new Response('El documento no está disponible o está oculto.', { status: 404, headers: { 'Cache-Control': 'no-store' } }) }
}
