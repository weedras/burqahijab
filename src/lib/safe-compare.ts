import { timingSafeEqual } from 'crypto';

/**
 * Timing-safe string comparison to prevent timing attacks.
 * Returns true if both strings are equal, false otherwise.
 */
export function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf-8');
  const bufB = Buffer.from(b, 'utf-8');
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}
