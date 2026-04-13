import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Admin routes require ADMIN role
    if (pathname.startsWith('/admin')) {
      if (token?.role !== 'ADMIN') {
        const url = req.nextUrl.clone()
        url.pathname = '/signin'
        url.searchParams.set('callbackUrl', pathname)
        return NextResponse.redirect(url)
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/signin',
    },
  }
)

export const config = {
  matcher: [
    '/staff/:path*',
    '/admin/:path*',
    '/api/requests/:path*',
    '/api/analytics/:path*',
    '/api/tables/:path*',
    '/api/settings/:path*',
    '/api/qr/:path*',
  ],
}
