import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory rate limiter for auth endpoint
const authAttempts = new Map<string, { count: number; resetTime: number }>();

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Security Headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  // Rate limiting for auth endpoint
  if (request.nextUrl.pathname === '/api/admin/auth' && request.method === 'POST') {
    const ip = request.ip || 'unknown';
    const now = Date.now();
    const attempt = authAttempts.get(ip);

    if (attempt && attempt.count >= 10 && now < attempt.resetTime) {
      return NextResponse.json(
        { success: false, error: 'Too many login attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((attempt.resetTime - now) / 1000)) } }
      );
    }

    if (!attempt || now >= attempt.resetTime) {
      authAttempts.set(ip, { count: 1, resetTime: now + 15 * 60 * 1000 });
    } else {
      attempt.count++;
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images|logo|robots.txt).*)'],
};
