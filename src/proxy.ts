import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

const { auth } = NextAuth(authConfig);

export const proxy = auth((req) => {
  const isLoggedIn = !!req.auth
  const isOnDashboard = req.nextUrl.pathname.startsWith('/dashboard')
  const isAuthPage = req.nextUrl.pathname.startsWith('/auth')

  if (isAuthPage) {
    if (isLoggedIn) {
      return Response.redirect(new URL('/dashboard', req.nextUrl))
    }
    return null
  }

  if (isOnDashboard) {
    if (!isLoggedIn) {
      return Response.redirect(new URL('/auth/login', req.nextUrl))
    }
  }

  if (req.nextUrl.pathname === '/dashboard') {
     const role = req.auth?.user?.role
     if (role === 'client') {
       return Response.redirect(new URL('/dashboard/client', req.nextUrl))
     } else if (role === 'freelancer') {
       return Response.redirect(new URL('/dashboard/freelancer', req.nextUrl))
     }
  }

  return null
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
