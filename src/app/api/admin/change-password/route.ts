import { jsonResponse, errorResponse } from '@/lib/api-utils';
import { requireAdmin } from '@/lib/auth';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

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

    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) return errorResponse('Server configuration error.', 500);

    if (currentPassword !== adminPassword) {
      return errorResponse('Current password is incorrect.', 401);
    }

    // Read the .env file, update the password, write it back
    const envPath = join(process.cwd(), '.env');
    let envContent: string;

    try {
      envContent = readFileSync(envPath, 'utf-8');
    } catch {
      return errorResponse('Could not read server configuration.', 500);
    }

    const updatedEnv = envContent.replace(
      /^ADMIN_PASSWORD=.*$/m,
      `ADMIN_PASSWORD=${newPassword.trim()}`
    );

    if (updatedEnv === envContent) {
      return errorResponse('Could not update password in configuration.', 500);
    }

    writeFileSync(envPath, updatedEnv, 'utf-8');
    process.env.ADMIN_PASSWORD = newPassword.trim();

    return jsonResponse(
      {
        success: true,
        message: 'Password changed successfully.',
      },
      200
    );
  } catch (error) {
    console.error('Change password error:', error);
    return errorResponse('Failed to change password. Please try again.', 500);
  }
}
