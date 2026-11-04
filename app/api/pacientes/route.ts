import { listarPaginaPacientes } from '@/lib/listado-pacientes'

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams
  const resultado = await listarPaginaPacientes({ q: query.get('q') || '', cobertura: query.get('cobertura') || '', pagina: query.get('pagina') || '1' })
  return Response.json(resultado, { headers: { 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' } })
}
