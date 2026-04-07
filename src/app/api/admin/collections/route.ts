import { db } from '@/lib/db';
import {
  generateSlug,
  jsonResponse,
  errorResponse,
} from '@/lib/api-utils';

// GET /api/admin/collections — List all collections
export async function GET() {
  try {
    const collections = await db.collection.findMany({
      orderBy: { order: 'asc' },
      include: {
        products: {
          include: {
            product: {
              select: { id: true, name: true, slug: true, price: true, salePrice: true, images: true },
            },
          },
        },
      },
    });

    const formattedCollections = collections.map((col) => ({
      ...col,
      products: col.products.map((pc) => ({
        ...pc.product,
        images: pc.product.images ? JSON.parse(pc.product.images) : [],
      })),
      productCount: col.products.length,
    }));

    return jsonResponse({ collections: formattedCollections });
  } catch (error) {
    console.error('Error listing collections:', error);
    return errorResponse('Failed to fetch collections', 500);
  }
}

// POST /api/admin/collections — Create a new collection
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { name, slug, description, image, featured, order } = body;

    if (!name) {
      return errorResponse('Collection name is required');
    }

    const collectionSlug = slug || generateSlug(name);

    // Check if slug already exists
    const existing = await db.collection.findUnique({
      where: { slug: collectionSlug },
    });
    if (existing) {
      return errorResponse('A collection with this slug already exists', 409);
    }

    const collection = await db.collection.create({
      data: {
        name,
        slug: collectionSlug,
        description: description || null,
        image: image || null,
        featured: featured ?? false,
        order: order ?? 0,
      },
    });

    return jsonResponse({ collection }, 201);
  } catch (error) {
    console.error('Error creating collection:', error);
    return errorResponse('Failed to create collection', 500);
  }
}
