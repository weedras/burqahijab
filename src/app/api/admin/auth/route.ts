import { jsonResponse, errorResponse } from '@/lib/api-utils';
import { createSession, getSessionToken, destroySession, SESSION_COOKIE_NAME } from '@/lib/auth';
import { getAdminPassword } from '@/lib/password-config';

// GET /api/admin/auth — Validate existing session (used by admin panel to check auth on mount)
export async function GET(request: Request) {
  try {
    const token = await getSessionToken(request);
    if (!token) {
      return errorResponse('Not authenticated', 401);
    }
    return jsonResponse({ success: true, authenticated: true });
  } catch (error) {
    console.error('Session validation error:', error);
    return errorResponse('Session validation failed', 500);
  }
}

// POST /api/admin/auth — Verify admin password and create session
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return errorResponse('Password is required');
    }

    const adminPassword = getAdminPassword();

    if (!adminPassword) {
      return errorResponse('Authentication service unavailable', 503);
    }

    const { safeCompare } = await import('@/lib/safe-compare');
    if (!safeCompare(password, adminPassword)) {
      return errorResponse('Incorrect password', 401);
    }

    // Create a session and return Set-Cookie header
    const { setCookieHeader } = createSession();

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Authentication successful',
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': setCookieHeader,
        },
      },
    );
  } catch (error) {
    console.error('Auth error:', error);
    return errorResponse('Authentication failed', 500);
  }
}

// DELETE /api/admin/auth — Logout: destroy the session and clear the cookie
export async function DELETE(request: Request) {
  try {
    const token = await getSessionToken(request);

    let clearCookieHeader: string;

    if (token) {
      clearCookieHeader = destroySession(token);
    } else {
      clearCookieHeader = [
        `${SESSION_COOKIE_NAME}=`,
        'HttpOnly',
        'SameSite=Strict',
        'Path=/',
        'Max-Age=0',
      ].join('; ');
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Logged out successfully',
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': clearCookieHeader,
        },
      },
    );
  } catch (error) {
    console.error('Logout error:', error);
    return errorResponse('Logout failed', 500);
  }
}
