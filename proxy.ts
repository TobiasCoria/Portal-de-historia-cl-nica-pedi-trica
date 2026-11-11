import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })
  const publicas = ['/login', '/recuperar-clave', '/actualizar-clave', '/auth/callback', '/fondo-botanico.svg']
  if (publicas.includes(request.nextUrl.pathname)) return response

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Verifica firma y vencimiento; con claves asimétricas reutiliza el JWKS.
  // Las lecturas/acciones sensibles siguen verificando el usuario con getUser().
  const { data, error } = await supabase.auth.getClaims()

  // Si no hay usuario logueado y no está en /login, lo mandamos a /login
  if (error || !data?.claims?.sub) {
    const destino = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.getAll().forEach(cookie => destino.cookies.set(cookie))
    return destino
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
