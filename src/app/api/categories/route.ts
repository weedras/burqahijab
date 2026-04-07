import { db } from '@/lib/db';
import { jsonResponse, errorResponse } from '@/lib/api-utils';

export async function GET() {
  try {
    const categories = await db.category.findMany({
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
      include: { parent: true },
    });
    return jsonResponse(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return errorResponse('Failed to fetch categories', 500);
  }
}
