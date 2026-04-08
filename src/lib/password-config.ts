import { db } from './db';

/**
 * Get admin credentials from the database.
 */
export async function getAdminCredentials() {
  return db.user.findFirst({
    where: { username: 'admin' },
  });
}

/**
 * Update admin password in the database.
 */
export async function setAdminPassword(newPasswordHash: string): Promise<boolean> {
  try {
    await db.user.upsert({
      where: { username: 'admin' },
      update: { passwordHash: newPasswordHash },
      create: { 
        id: 'admin',
        username: 'admin',
        passwordHash: newPasswordHash 
      },
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Update reset code in the database.
 */
export async function setResetCode(code: string): Promise<boolean> {
  try {
    await db.user.upsert({
      where: { username: 'admin' },
      update: { resetCode: code },
      create: { 
        id: 'admin',
        username: 'admin',
        passwordHash: 'REPLACE_ME_ON_SEED',
        resetCode: code
      },
    });
    return true;
  } catch {
    return false;
  }
}
