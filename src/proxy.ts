/**
 * Proxy (Next.js 16) — handles i18n locale routing + admin auth protection.
 */
import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { verifySessionToken, SESSION_COOKIE } from '@/lib/auth';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware({ ...routing, localeDetection: false });

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Admin auth protection ──────────────────────────────────────────────────
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (!token || !(await verifySessionToken(token))) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    return NextResponse.next();
  }

  // Skip next-intl for static assets, API routes, and admin
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/_vercel') ||
    pathname.startsWith('/admin') ||
    /\.(.+)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // ── i18n locale routing ────────────────────────────────────────────────────
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
