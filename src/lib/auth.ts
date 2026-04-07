/**
 * Server-side session-based authentication for admin routes.
 *
 * After a successful login, a session token is stored in a cookie (httpOnly, SameSite=Strict).
 * The session token maps to a server-side session entry stored in memory via globalThis
 * to ensure a single shared Map across all Turbopack/Next.js route handlers.
 */

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// ---- In-memory session store (shared via globalThis) ----
interface SessionEntry {
  token: string;
  createdAt: number;
}

const SESSION_KEY = '__bhq_admin_sessions__';

function getSessions(): Map<string, SessionEntry> {
  if (!(globalThis as Record<string, unknown>)[SESSION_KEY]) {
    (globalThis as Record<string, unknown>)[SESSION_KEY] = new Map<string, SessionEntry>();
  }
  return (globalThis as Record<string, unknown>)[SESSION_KEY] as Map<string, SessionEntry>;
}

/** Maximum session duration: 24 hours */
const SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000;

/** Cookie name used for the session */
export const SESSION_COOKIE_NAME = 'bhq_admin_session';

/** Clean up expired sessions (call periodically) */
function cleanExpiredSessions() {
  const sessions = getSessions();
  const now = Date.now();
  for (const [key, entry] of sessions) {
    if (now - entry.createdAt > SESSION_MAX_AGE_MS) {
      sessions.delete(key);
    }
  }
}

// Clean sessions every 10 minutes
const CLEANUP_KEY = '__bhq_cleanup_interval__';
if (!(globalThis as Record<string, unknown>)[CLEANUP_KEY]) {
  (globalThis as Record<string, unknown>)[CLEANUP_KEY] = true;
  setInterval(cleanExpiredSessions, 10 * 60 * 1000);
}

/**
 * Create a new session and return the Set-Cookie header value.
 */
export function createSession(): { token: string; setCookieHeader: string } {
  const token = 'sess_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  getSessions().set(token, { token, createdAt: Date.now() });

  const isProduction = process.env.NODE_ENV === 'production';
  const setCookieHeader = [
    `${SESSION_COOKIE_NAME}=${token}`,
    'HttpOnly',
    isProduction ? 'Secure' : '',
    'SameSite=Strict',
    'Path=/',
    `Max-Age=${Math.floor(SESSION_MAX_AGE_MS / 1000)}`,
  ].filter(Boolean).join('; ');

  return { token, setCookieHeader };
}

/**
 * Validate a session token and return whether it is valid.
 */
export function isValidSession(token: string): boolean {
  const entry = getSessions().get(token);
  if (!entry) return false;
  if (Date.now() - entry.createdAt > SESSION_MAX_AGE_MS) {
    getSessions().delete(token);
    return false;
  }
  return true;
}

/**
 * Get the session token from the request cookies.
 * Returns null if no valid session cookie is found.
 */
export async function getSessionToken(request?: Request): Promise<string | null> {
  let cookieHeader: string | undefined;

  if (request) {
    cookieHeader = request.headers.get('cookie') || undefined;
  } else {
    const cookieStore = await cookies();
    cookieHeader = cookieStore.get(SESSION_COOKIE_NAME)?.value || undefined;
  }

  if (!cookieHeader) return null;

  const match = cookieHeader
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${SESSION_COOKIE_NAME}=`));

  if (!match) return null;

  const token = match.substring(SESSION_COOKIE_NAME.length + 1);
  if (!token) return null;

  return isValidSession(token) ? token : null;
}

/**
 * Destroy a session by token.
 * Returns the Set-Cookie header to clear the cookie.
 */
export function destroySession(token: string): string {
  getSessions().delete(token);

  return [
    `${SESSION_COOKIE_NAME}=`,
    'HttpOnly',
    'SameSite=Strict',
    'Path=/',
    'Max-Age=0',
  ].join('; ');
}

/**
 * Auth guard for admin API routes.
 * Returns null if authenticated, or a 401 Response if not.
 */
export async function requireAdmin(request: Request): Promise<NextResponse | null> {
  const token = await getSessionToken(request);

  if (!token) {
    return NextResponse.json(
      { success: false, error: 'Authentication required. Please log in.' },
      { status: 401 },
    );
  }

  return null;
}
