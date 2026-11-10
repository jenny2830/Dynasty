import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { detectLocale, LOCALE_COOKIE, LOCALE_MAX_AGE, parseLocale } from '@/lib/i18n/locale'

function applyLocale(request: NextRequest): { locale: 'en' | 'es'; shouldSet: boolean } {
  const existing = parseLocale(request.cookies.get(LOCALE_COOKIE)?.value)
  if (existing) return { locale: existing, shouldSet: false }
  const locale = detectLocale(request.headers.get('accept-language'))
  request.cookies.set(LOCALE_COOKIE, locale)
  return { locale, shouldSet: true }
}

function withLocaleCookie(response: NextResponse, locale: 'en' | 'es', shouldSet: boolean) {
  if (shouldSet) {
    response.cookies.set(LOCALE_COOKIE, locale, {
      path: '/',
      maxAge: LOCALE_MAX_AGE,
      sameSite: 'lax',
    })
  }
  return response
}

export async function proxy(request: NextRequest) {
  const { locale, shouldSet } = applyLocale(request)
  let supabaseResponse = NextResponse.next({ request })

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
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — do not add any code between createServerClient and getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isStaticAsset = /\.[a-zA-Z0-9]+$/.test(pathname)

  const isAuthPage = pathname === '/login' || pathname === '/signup'
  // Reachable whether or not a session exists (email links, recovery)
  const isAuthFlowPage =
    pathname === '/auth/confirm' ||
    pathname === '/auth/reset-password' ||
    pathname === '/forgot-password'
  const isPublicPath =
    isAuthPage ||
    isAuthFlowPage ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/webhooks') ||
    pathname.startsWith('/images/') ||
    isStaticAsset ||
    pathname === '/favicon.ico'

  // Redirect unauthenticated users to login
  if (!user && !isPublicPath) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('next', pathname)
    return withLocaleCookie(NextResponse.redirect(loginUrl), locale, shouldSet)
  }

  // Redirect authenticated users away from auth pages
  if (user && isAuthPage) {
    const dashboardUrl = request.nextUrl.clone()
    dashboardUrl.pathname = '/'
    return withLocaleCookie(NextResponse.redirect(dashboardUrl), locale, shouldSet)
  }

  return withLocaleCookie(supabaseResponse, locale, shouldSet)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/webhooks).*)',
  ],
}
