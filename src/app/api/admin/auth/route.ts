import { jsonResponse, errorResponse } from '@/lib/api-utils';
import { createSession, getSessionToken, destroySession, SESSION_COOKIE_NAME } from '@/lib/auth';
import { getAdminCredentials } from '@/lib/password-config';

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

    const credentials = await getAdminCredentials();

    if (!credentials) {
      // If no admin user exists in DB, we use the fallback from ENV to seed it
      // This is a safety measure for the very first login
      const fallbackPassword = process.env.ADMIN_PASSWORD;
      if (!fallbackPassword || password !== fallbackPassword) {
        return errorResponse('Authentication service unavailable or incorrect password', 401);
      }
      
      // Seed the admin user now
      const { setAdminPassword } = await import('@/lib/password-config');
      await setAdminPassword(password);
    } else {
      const { safeCompare } = await import('@/lib/safe-compare');
      if (!safeCompare(password, credentials.passwordHash)) {
        return errorResponse('Incorrect password', 401);
      }
    }

    // Create a session and return Set-Cookie header
    const { setCookieHeader } = await createSession();

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
      clearCookieHeader = await destroySession(token);
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
