import { db } from '@/lib/db';
import { formatProduct, jsonResponse, errorResponse, parseBooleanParam } from '@/lib/api-utils';
import { Prisma } from '@prisma/client';

// GET /api/products — Public product listing
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const categorySlug = searchParams.get('category') || '';
    const collectionSlug = searchParams.get('collection') || '';
    const isNew = parseBooleanParam(searchParams.get('isNew'));
    const isFeatured = parseBooleanParam(searchParams.get('isFeatured'));

    const where: Prisma.ProductWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (isNew !== undefined) where.isNew = isNew;
    if (isFeatured !== undefined) where.isFeatured = isFeatured;

    if (categorySlug) {
      where.categories = {
        some: {
          category: {
            OR: [
              { slug: categorySlug },
              { parent: { slug: categorySlug } },
            ],
          },
        },
      };
    }

    if (collectionSlug) {
      where.collections = {
        some: { collection: { slug: collectionSlug } },
      };
    }

    const products = await db.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        categories: { include: { category: true } },
        collections: { include: { collection: true } },
      },
    });

    const formatted = products.map((p) => ({
      ...formatProduct(p),
      categories: p.categories.map((pc) => pc.category),
      collections: p.collections.map((pc) => pc.collection),
    }));

    return jsonResponse(formatted);
  } catch (error) {
    console.error('Error fetching public products:', error);
    return errorResponse('Failed to fetch products', 500);
  }
}
