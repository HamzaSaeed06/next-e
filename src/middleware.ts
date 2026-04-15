import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware runs on the Edge runtime — no Firebase Admin SDK.
 * We use session cookies set after login for auth detection.
 * auth-token = Firebase UID (set client-side after login)
 * auth-role  = user role (may be missing if Firestore rules block reads)
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const authToken = request.cookies.get('auth-token')?.value;
  const authRole = request.cookies.get('auth-role')?.value;
  const isAuthenticated = Boolean(authToken);

  // ── Protect /admin routes ────────────────────────────────────────────────
  // Allow if authenticated (role check is done inside admin pages,
  // since role may not load if Firestore rules are restrictive)
  if (pathname.startsWith('/admin')) {
    if (!isAuthenticated) {
      const url = request.nextUrl.clone();
      url.pathname = '/auth/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
    // If role is explicitly 'user' (not admin/manager), block access
    if (authRole === 'user') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    // If role is 'admin', 'manager', or undefined (Firestore not readable yet), allow through
  }

  // ── Protect /account routes ──────────────────────────────────────────────
  if (pathname.startsWith('/account')) {
    if (!isAuthenticated) {
      const url = request.nextUrl.clone();
      url.pathname = '/auth/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }

  // ── Protect /dashboard routes (redirect to /account) ────────────────────
  if (pathname.startsWith('/dashboard')) {
    if (!isAuthenticated) {
      const url = request.nextUrl.clone();
      url.pathname = '/auth/login';
      url.searchParams.set('redirect', '/account/orders');
      return NextResponse.redirect(url);
    }
    // Redirect /dashboard to /account/orders
    return NextResponse.redirect(new URL('/account/orders', request.url));
  }

  // ── Redirect authenticated users away from auth pages ───────────────────
  if (pathname.startsWith('/auth/') && isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/account/:path*', '/dashboard/:path*', '/auth/:path*'],
};
