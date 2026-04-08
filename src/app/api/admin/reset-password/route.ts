import { jsonResponse, errorResponse } from '@/lib/api-utils';
import { getAdminPassword, getResetCode, setAdminPassword } from '@/lib/password-config';

// POST /api/admin/reset-password — Reset admin password using recovery code (no auth required)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { resetCode, newPassword } = body;

    if (resetCode.trim().length < 1) return errorResponse('Reset code is required', 400);
    if (!newPassword?.trim()) return errorResponse('New password is required', 400);
    if (newPassword.trim().length < 8) return errorResponse('Password must be at least 8 characters', 400);

    const validResetCode = getResetCode();

    if (!validResetCode) {
      console.error('RESET_CODE is not configured in .env file');
      return errorResponse('Password reset service unavailable.', 503);
    }

    const { safeCompare } = await import('@/lib/safe-compare');
    if (!safeCompare(resetCode.trim(), validResetCode)) {
      return errorResponse('Invalid reset code. Please check and try again.', 401);
    }

    const success = setAdminPassword(newPassword.trim());
    if (!success) {
      return errorResponse('Could not update password in configuration.', 500);
    }

    return jsonResponse(
      {
        success: true,
        message: 'Password has been reset successfully. You can now log in with your new password.',
      },
      200
    );
  } catch (error) {
    console.error('Password reset error:', error);
    return errorResponse('Failed to reset password. Please try again.', 500);
  }
}
