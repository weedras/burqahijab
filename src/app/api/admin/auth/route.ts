import { jsonResponse, errorResponse } from '@/lib/api-utils';
import { createSession, getSessionToken, destroySession, SESSION_COOKIE_NAME } from '@/lib/auth';

// POST /api/admin/auth — Verify admin password and create session
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return errorResponse('Password is required');
    }

    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      console.error('ADMIN_PASSWORD environment variable is not configured');
      return errorResponse('Server configuration error. Admin password not set.', 500);
    }

    if (password !== adminPassword) {
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
      // Even if no session found, still clear the cookie
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
