import { jsonResponse, errorResponse } from '@/lib/api-utils';
import { requireAdmin } from '@/lib/auth';
import { getAdminCredentials, setAdminPassword } from '@/lib/password-config';

// POST /api/admin/change-password — Change admin password (requires auth)
export async function POST(request: Request) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword?.trim()) return errorResponse('Current password is required', 400);
    if (!newPassword?.trim()) return errorResponse('New password is required', 400);
    if (newPassword.trim().length < 8) return errorResponse('New password must be at least 8 characters', 400);

    const credentials = await getAdminCredentials();
    if (!credentials) return errorResponse('Server configuration error.', 500);

    const { safeCompare } = await import('@/lib/safe-compare');
    if (!safeCompare(currentPassword, credentials.passwordHash)) {
      return errorResponse('Current password is incorrect.', 401);
    }

    const success = await setAdminPassword(newPassword.trim());
    if (!success) {
      return errorResponse('Could not update password in configuration.', 500);
    }

    return jsonResponse(
      { success: true, message: 'Password changed successfully.' },
      200
    );
  } catch (error) {
    console.error('Change password error:', error);
    return errorResponse('Failed to change password. Please try again.', 500);
  }
}
