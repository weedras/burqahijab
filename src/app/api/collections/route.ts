import { db } from '@/lib/db';
import { jsonResponse, errorResponse } from '@/lib/api-utils';

export async function GET() {
  try {
    const collections = await db.collection.findMany({
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
    });
    return jsonResponse(collections);
  } catch (error) {
    console.error('Error fetching collections:', error);
    return errorResponse('Failed to fetch collections', 500);
  }
}
