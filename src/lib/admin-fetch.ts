/**
 * Wrapper around fetch for admin API calls.
 * Automatically handles 401 responses by dispatching a custom event
 * that tells the AdminPanel to force re-login.
 */

const ADMIN_AUTH_EVENT = 'bhq-admin-auth-expired';

/** Dispatch event to notify AdminPanel that auth expired */
function notifyAuthExpired() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(ADMIN_AUTH_EVENT));
  }
}

/** Register a listener for auth-expired events (used by AdminPanel) */
export function onAdminAuthExpired(callback: () => void) {
  if (typeof window === 'undefined') return;
  window.addEventListener(ADMIN_AUTH_EVENT, callback);
  return () => window.removeEventListener(ADMIN_AUTH_EVENT, callback);
}

/**
 * Admin-aware fetch wrapper.
 * Works just like fetch, but when a 401 is received,
 * it dispatches an auth-expired event so the admin panel can redirect to login.
 */
export async function adminFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const res = await fetch(input, init);

  if (res.status === 401) {
    notifyAuthExpired();
  }

  return res;
}
