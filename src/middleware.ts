import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware runs on the Edge runtime — no Firebase Admin SDK.
 * We use a session cookie set after login to detect authenticated users.
 * The cookie `auth-token` is populated by the client after successful login.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read auth cookie (set client-side after login for edge compatibility)
  const authToken = request.cookies.get('auth-token')?.value;
  const authRole = request.cookies.get('auth-role')?.value;
  const isAuthenticated = Boolean(authToken);
  const isAdmin = authRole === 'admin' || authRole === 'manager';

  // ── Protect /admin routes ────────────────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    if (!isAuthenticated) {
      const url = request.nextUrl.clone();
      url.pathname = '/auth/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
    if (!isAdmin) {
      // Logged in but not admin — redirect to home
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // ── Protect /dashboard routes ────────────────────────────────────────────
  if (pathname.startsWith('/dashboard')) {
    if (!isAuthenticated) {
      const url = request.nextUrl.clone();
      url.pathname = '/auth/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }

  // ── Redirect authenticated users away from auth pages ───────────────────
  if (pathname.startsWith('/auth/') && isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/auth/:path*'],
};
