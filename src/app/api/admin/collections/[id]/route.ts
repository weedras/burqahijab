import { db } from '@/lib/db';
import {
  generateSlug,
  jsonResponse,
  errorResponse,
} from '@/lib/api-utils';

// GET /api/admin/collections/[id] — Get a single collection
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const collection = await db.collection.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!collection) {
      return errorResponse('Collection not found', 404);
    }

    const formattedCollection = {
      ...collection,
      products: collection.products.map((pc) => ({
        ...pc.product,
        images: pc.product.images ? JSON.parse(pc.product.images) : [],
        colors: pc.product.colors ? JSON.parse(pc.product.colors) : [],
        sizes: pc.product.sizes ? JSON.parse(pc.product.sizes) : [],
      })),
    };

    return jsonResponse({ collection: formattedCollection });
  } catch (error) {
    console.error('Error fetching collection:', error);
    return errorResponse('Failed to fetch collection', 500);
  }
}

// PUT /api/admin/collections/[id] — Update a collection
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await db.collection.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse('Collection not found', 404);
    }

    const data: Record<string, unknown> = {};

    if (body.name !== undefined) {
      data.name = body.name;
    }
    if (body.slug !== undefined) {
      if (body.slug !== existing.slug) {
        const slugExists = await db.collection.findUnique({
          where: { slug: body.slug },
        });
        if (slugExists) {
          return errorResponse('A collection with this slug already exists', 409);
        }
      }
      data.slug = body.slug;
    } else if (body.name !== undefined && body.name !== existing.name) {
      const newSlug = generateSlug(body.name);
      if (newSlug !== existing.slug) {
        const slugExists = await db.collection.findUnique({
          where: { slug: newSlug },
        });
        if (!slugExists) {
          data.slug = newSlug;
        }
      }
    }
    if (body.description !== undefined) data.description = body.description || null;
    if (body.image !== undefined) data.image = body.image || null;
    if (body.featured !== undefined) data.featured = body.featured;
    if (body.order !== undefined) data.order = body.order;

    const collection = await db.collection.update({
      where: { id },
      data,
    });

    return jsonResponse({ collection });
  } catch (error) {
    console.error('Error updating collection:', error);
    return errorResponse('Failed to update collection', 500);
  }
}

// DELETE /api/admin/collections/[id] — Delete a collection
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const collection = await db.collection.findUnique({ where: { id } });
    if (!collection) {
      return errorResponse('Collection not found', 404);
    }

    await db.collection.delete({ where: { id } });

    return jsonResponse({ message: 'Collection deleted successfully' });
  } catch (error) {
    console.error('Error deleting collection:', error);
    return errorResponse('Failed to delete collection', 500);
  }
}
