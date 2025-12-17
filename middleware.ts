import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Rutas de admin requieren autenticación (barberías)
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Permitir acceso a /admin/login
    if (request.nextUrl.pathname === '/admin/login') {
      // Si ya está autenticado, redirigir a admin
      if (user) {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
      return response
    }

    // Permitir acceso a /admin/onboarding
    if (request.nextUrl.pathname === '/admin/onboarding') {
      // Requiere estar autenticado
      if (!user) {
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }
      return response
    }

    // Resto de rutas /admin/* requieren autenticación
    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    // Verificar si el usuario tiene barbería registrada
    const { data: barberia } = await supabase
      .from('barberias')
      .select('id')
      .eq('id', user.id)
      .single()

    // Si no tiene barbería, redirigir a onboarding
    if (!barberia) {
      return NextResponse.redirect(new URL('/admin/onboarding', request.url))
    }
  }

  // Las rutas /agenda/* son públicas (no requieren auth)

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}