import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// In-memory rate limiters for protected endpoints
const rateLimiters = new Map<string, { count: number; resetTime: number }>();

function getIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('cf-connecting-ip') ||
    request.ip ||
    'unknown'
  );
}

function checkRateLimit(ip: string, key: string, maxAttempts: number, windowMs: number): boolean {
  const rateKey = `${key}:${ip}`;
  const now = Date.now();
  const attempt = rateLimiters.get(rateKey);

  if (attempt && attempt.count >= maxAttempts && now < attempt.resetTime) {
    return false; // Rate limited
  }

  if (!attempt || now >= attempt.resetTime) {
    rateLimiters.set(rateKey, { count: 1, resetTime: now + windowMs });
  } else {
    attempt.count++;
  }

  return true; // Allowed
}

function getRetryAfter(key: string, ip: string): number {
  const attempt = rateLimiters.get(`${key}:${ip}`);
  if (!attempt) return 0;
  return Math.max(0, Math.ceil((attempt.resetTime - Date.now()) / 1000));
}

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimiters) {
    if (now >= entry.resetTime) rateLimiters.delete(key);
  }
}, 5 * 60 * 1000);

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Security Headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  // Content-Security-Policy
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https: blob:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://graph.facebook.com https://api.instagram.com https://www.instagram.com https://img.youtube.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')
  );

  const ip = getIp(request);
  const pathname = request.nextUrl.pathname;
  const method = request.method;

  // Rate limiting for login endpoint: 10 attempts per 15 minutes
  if (pathname === '/api/admin/auth' && method === 'POST') {
    if (!checkRateLimit(ip, 'auth', 10, 15 * 60 * 1000)) {
      return NextResponse.json(
        { success: false, error: 'Too many login attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(getRetryAfter('auth', ip)) } }
      );
    }
  }

  // Rate limiting for password reset: 5 attempts per 15 minutes
  if (pathname === '/api/admin/reset-password' && method === 'POST') {
    if (!checkRateLimit(ip, 'reset', 5, 15 * 60 * 1000)) {
      return NextResponse.json(
        { success: false, error: 'Too many reset attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(getRetryAfter('reset', ip)) } }
      );
    }
  }

  // Rate limiting for order creation: 20 per hour
  if (pathname === '/api/orders' && method === 'POST') {
    if (!checkRateLimit(ip, 'orders', 20, 60 * 60 * 1000)) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please slow down.' },
        { status: 429, headers: { 'Retry-After': String(getRetryAfter('orders', ip)) } }
      );
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images|logo|robots.txt).*)'],
};
