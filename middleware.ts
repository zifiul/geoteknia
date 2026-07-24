import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { auth } from '@/lib/auth/auth-edge';
import {
  applySecurityHeadersToNextResponse,
} from '@/lib/security/headers';

const LOGIN_PATH = '/admin/login';

function isApiAdminPath(pathname: string): boolean {
  return pathname.startsWith('/api/admin');
}

function logUnauthorized(pathname: string, request: NextRequest): void {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() ?? 'unknown';
  const ipHint = ip.length > 8 ? `${ip.slice(0, 4)}…` : ip;
  console.info(
    JSON.stringify({
      event: 'admin_middleware_unauthorized',
      path: pathname,
      ipHint,
    }),
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await auth();

  if (!session?.user) {
    logUnauthorized(pathname, request);

    if (isApiAdminPath(pathname)) {
      const json = NextResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Sesión no válida' },
        },
        { status: 401 },
      );
      return applySecurityHeadersToNextResponse(json);
    }

    const loginUrl = new URL(LOGIN_PATH, request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    const redirect = NextResponse.redirect(loginUrl);
    return applySecurityHeadersToNextResponse(redirect);
  }

  const next = NextResponse.next();
  return applySecurityHeadersToNextResponse(next);
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
