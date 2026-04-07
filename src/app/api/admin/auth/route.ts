import { jsonResponse, errorResponse } from '@/lib/api-utils';

// POST /api/admin/auth — Verify admin password
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return errorResponse('Password is required');
    }

    const adminPassword = process.env.ADMIN_PASSWORD || 'bhq2026';

    if (password !== adminPassword) {
      return errorResponse('Incorrect password', 401);
    }

    return jsonResponse({
      success: true,
      message: 'Authentication successful',
    });
  } catch (error) {
    console.error('Auth error:', error);
    return errorResponse('Authentication failed', 500);
  }
}
