import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

/**
 * Read ADMIN_PASSWORD directly from .env file.
 * This bypasses Next.js/Turbopack env caching so password changes take effect immediately.
 */
export function getAdminPassword(): string | null {
  try {
    const envPath = join(process.cwd(), '.env');
    const envContent = readFileSync(envPath, 'utf-8');
    const match = envContent.match(/^ADMIN_PASSWORD=(.+)$/m);
    return match ? match[1].trim() : null;
  } catch {
    return null;
  }
}

/**
 * Write ADMIN_PASSWORD directly to .env file.
 * Returns true on success, false on failure.
 */
export function setAdminPassword(newPassword: string): boolean {
  try {
    const envPath = join(process.cwd(), '.env');
    const envContent = readFileSync(envPath, 'utf-8');
    const updatedEnv = envContent.replace(
      /^ADMIN_PASSWORD=.*$/m,
      `ADMIN_PASSWORD=${newPassword}`
    );
    if (updatedEnv === envContent) return false;
    writeFileSync(envPath, updatedEnv, 'utf-8');
    process.env.ADMIN_PASSWORD = newPassword;
    return true;
  } catch {
    return false;
  }
}

/**
 * Read RESET_CODE directly from .env file.
 * This bypasses Next.js/Turbopack env caching.
 */
export function getResetCode(): string | null {
  try {
    const envPath = join(process.cwd(), '.env');
    const envContent = readFileSync(envPath, 'utf-8');
    const match = envContent.match(/^RESET_CODE=(.+)$/m);
    return match ? match[1].trim() : null;
  } catch {
    return null;
  }
}
