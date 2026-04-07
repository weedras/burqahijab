import { jsonResponse, errorResponse } from '@/lib/api-utils';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// POST /api/admin/reset-password — Reset admin password using recovery code (no auth required)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { resetCode, newPassword } = body;

    if (!resetCode?.trim()) return errorResponse('Reset code is required', 400);
    if (!newPassword?.trim()) return errorResponse('New password is required', 400);
    if (newPassword.trim().length < 8) return errorResponse('Password must be at least 8 characters', 400);

    const validResetCode = process.env.RESET_CODE;

    if (!validResetCode) {
      console.error('RESET_CODE environment variable is not configured');
      return errorResponse('Password reset is not configured on this server.', 500);
    }

    if (resetCode.trim() !== validResetCode) {
      return errorResponse('Invalid reset code. Please check and try again.', 401);
    }

    // Read the .env file, update the password, write it back
    const envPath = join(process.cwd(), '.env');
    let envContent: string;

    try {
      envContent = readFileSync(envPath, 'utf-8');
    } catch {
      return errorResponse('Could not read server configuration.', 500);
    }

    // Replace the ADMIN_PASSWORD line
    const updatedEnv = envContent.replace(
      /^ADMIN_PASSWORD=.*$/m,
      `ADMIN_PASSWORD=${newPassword.trim()}`
    );

    if (updatedEnv === envContent) {
      return errorResponse('Could not update password in configuration.', 500);
    }

    writeFileSync(envPath, updatedEnv, 'utf-8');

    // Update the in-memory env for current session
    process.env.ADMIN_PASSWORD = newPassword.trim();

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
