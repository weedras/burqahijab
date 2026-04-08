import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { db } from './db';

/** Maximum session duration: 24 hours */
const SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000;

/** Cookie name used for the session */
export const SESSION_COOKIE_NAME = 'bhq_admin_session';

/**
 * Create a new session and return the Set-Cookie header value.
 */
export async function createSession(): Promise<{ token: string; setCookieHeader: string }> {
  const token = 'sess_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_MS);
  
  // Persist to database
  await db.session.create({
    data: {
      token,
      expiresAt,
    },
  });

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
export async function isValidSession(token: string): Promise<boolean> {
  if (!token) return false;
  
  const session = await db.session.findUnique({
    where: { token },
  });

  if (!session) return false;

  if (new Date() > session.expiresAt) {
    // Session expired — clean it up
    await db.session.delete({ where: { token } }).catch(() => {});
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

  const isValid = await isValidSession(token);
  return isValid ? token : null;
}

/**
 * Destroy a session by token.
 * Returns the Set-Cookie header to clear the cookie.
 */
export async function destroySession(token: string): Promise<string> {
  if (token) {
    await db.session.delete({ where: { token } }).catch(() => {});
  }

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
