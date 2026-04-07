/**
 * Server-side session-based authentication for admin routes.
 *
 * After a successful login, a session token is stored in a cookie (httpOnly, secure, SameSite=Strict).
 * The session token maps to a server-side session entry stored in memory.
 */

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// ---- In-memory session store ----
interface SessionEntry {
  token: string;
  createdAt: number;
}

const sessions = new Map<string, SessionEntry>();

/** Maximum session duration: 24 hours */
const SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000;

/** Cookie name used for the session */
export const SESSION_COOKIE_NAME = 'bhq_admin_session';

/** Clean up expired sessions (call periodically) */
function cleanExpiredSessions() {
  const now = Date.now();
  for (const [key, entry] of sessions) {
    if (now - entry.createdAt > SESSION_MAX_AGE_MS) {
      sessions.delete(key);
    }
  }
}

// Clean sessions every 10 minutes
setInterval(cleanExpiredSessions, 10 * 60 * 1000);

/**
 * Create a new session and return the Set-Cookie header value.
 */
export function createSession(): { token: string; setCookieHeader: string } {
  // Generate a random session token without relying on node:crypto
  // which may not be available in Turbopack edge-like runtime
  const token = 'sess_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  sessions.set(token, { token, createdAt: Date.now() });

  const setCookieHeader = [
    `${SESSION_COOKIE_NAME}=${token}`,
    'HttpOnly',
    'Secure',
    'SameSite=Strict',
    'Path=/',
    `Max-Age=${Math.floor(SESSION_MAX_AGE_MS / 1000)}`,
  ].join('; ');

  return { token, setCookieHeader };
}

/**
 * Validate a session token and return whether it is valid.
 */
export function isValidSession(token: string): boolean {
  const entry = sessions.get(token);
  if (!entry) return false;
  if (Date.now() - entry.createdAt > SESSION_MAX_AGE_MS) {
    sessions.delete(token);
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
    // Prefer reading from the request directly
    cookieHeader = request.headers.get('cookie') || undefined;
  } else {
    // Fallback: use next/headers for App Router server components
    const cookieStore = await cookies();
    cookieHeader = cookieStore.get(SESSION_COOKIE_NAME)?.value || undefined;
  }

  if (!cookieHeader) return null;

  // Parse cookie string to find our cookie
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
  sessions.delete(token);

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
 * Call this at the top of every admin handler (except the auth route itself).
 *
 * Returns null if the request is authenticated (continue processing).
 * Returns a 401 Response if authentication fails.
 */
export async function requireAdmin(request: Request): Promise<NextResponse | null> {
  const token = await getSessionToken(request);

  if (!token) {
    return NextResponse.json(
      { success: false, error: 'Authentication required. Please log in.' },
      { status: 401 },
    );
  }

  // Session is valid — return null to indicate the request may proceed
  return null;
}
