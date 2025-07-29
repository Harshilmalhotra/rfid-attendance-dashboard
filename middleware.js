import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res = NextResponse.next()
  
  // Check if auth is disabled (only in development)
  const isAuthDisabled = process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true'
  const isProduction = process.env.NODE_ENV === 'production'
  
  // Never disable auth in production
  if (isAuthDisabled && !isProduction) {
    // If accessing /auth while auth is disabled, redirect to dashboard
    if (req.nextUrl.pathname === '/auth') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    return res
  }

  try {
    const supabase = createMiddlewareClient({ req, res })

    const {
      data: { session },
      error
    } = await supabase.auth.getSession()

    if (error) {
      console.error('Auth error:', error)
      // Redirect to auth page on error
      if (!req.nextUrl.pathname.startsWith('/auth')) {
        return NextResponse.redirect(new URL('/auth', req.url))
      }
      return res
    }

    // If user is not signed in and the current path is not /auth redirect the user to /auth
    if (!session && !req.nextUrl.pathname.startsWith('/auth')) {
      return NextResponse.redirect(new URL('/auth', req.url))
    }

    // If user is signed in and the current path is /auth redirect the user to /dashboard
    if (session && req.nextUrl.pathname === '/auth') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return res
  } catch (error) {
    console.error('Middleware error:', error)
    // On any error, allow access to auth page
    if (!req.nextUrl.pathname.startsWith('/auth')) {
      return NextResponse.redirect(new URL('/auth', req.url))
    }
    return res
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|auth/callback).*)'],
}