/**
 * Utility functions for admin API routes
 */

/**
 * Generate a URL-friendly slug from a name string
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Stringify JSON fields (images, colors, sizes) if they are arrays
 * Prisma stores these as String type (JSON array as string)
 */
export function stringifyJsonField(value: unknown): string {
  if (value === undefined || value === null) return '[]';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return JSON.stringify(value);
  return JSON.stringify(value);
}

/**
 * Parse JSON string fields back into arrays
 */
export function parseJsonField<T = unknown>(value: string | null | undefined): T[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Safely parse a number from query string
 */
export function parseNumberParam(value: string | null, defaultValue: number): number {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Safely parse a boolean from query string
 */
export function parseBooleanParam(value: string | null): boolean | undefined {
  if (!value) return undefined;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
}

/**
 * Format a product for API response (parse JSON string fields)
 */
export function formatProduct(product: Record<string, unknown>) {
  return {
    ...product,
    images: parseJsonField<string>(product.images as string),
    colors: parseJsonField<string>(product.colors as string),
    sizes: parseJsonField<string>(product.sizes as string),
  };
}

/**
 * Build a NextResponse JSON with proper status
 */
export function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Build an error response
 */
export function errorResponse(message: string, status = 400) {
  return jsonResponse({ error: message }, status);
}
