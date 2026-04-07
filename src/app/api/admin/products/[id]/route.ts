import { db } from '@/lib/db';
import {
  generateSlug,
  stringifyJsonField,
  formatProduct,
  jsonResponse,
  errorResponse,
} from '@/lib/api-utils';

// GET /api/admin/products/[id] — Get a single product
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const product = await db.product.findUnique({
      where: { id },
      include: {
        categories: { include: { category: true } },
        collections: { include: { collection: true } },
        reviews: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) {
      return errorResponse('Product not found', 404);
    }

    return jsonResponse({
      ...formatProduct(product),
      categories: product.categories.map((pc) => pc.category),
      collections: product.collections.map((pc) => pc.collection),
      reviews: product.reviews,
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return errorResponse('Failed to fetch product', 500);
  }
}

// PUT /api/admin/products/[id] — Update a product (partial update)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Check if product exists
    const existing = await db.product.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse('Product not found', 404);
    }

    // Build update data with only provided fields
    const data: Record<string, unknown> = {};

    if (body.name !== undefined) {
      data.name = body.name;
    }
    if (body.slug !== undefined) {
      // If slug changed, check uniqueness
      if (body.slug !== existing.slug) {
        const slugExists = await db.product.findUnique({
          where: { slug: body.slug },
        });
        if (slugExists) {
          return errorResponse('A product with this slug already exists', 409);
        }
      }
      data.slug = body.slug;
    } else if (body.name !== undefined) {
      // Auto-generate slug from new name only if slug not explicitly provided
      const newSlug = generateSlug(body.name);
      if (newSlug !== existing.slug) {
        const slugExists = await db.product.findUnique({
          where: { slug: newSlug },
        });
        if (!slugExists) {
          data.slug = newSlug;
        }
      }
    }
    if (body.description !== undefined) data.description = body.description;
    if (body.fabricCare !== undefined) data.fabricCare = body.fabricCare || null;
    if (body.shipReturn !== undefined) data.shipReturn = body.shipReturn || null;
    if (body.price !== undefined) data.price = parseFloat(body.price);
    if (body.salePrice !== undefined)
      data.salePrice = body.salePrice ? parseFloat(body.salePrice) : null;
    if (body.currency !== undefined) data.currency = body.currency;
    if (body.images !== undefined) data.images = stringifyJsonField(body.images);
    if (body.videoUrl !== undefined) data.videoUrl = body.videoUrl || null;
    if (body.isNew !== undefined) data.isNew = body.isNew;
    if (body.isBestSeller !== undefined) data.isBestSeller = body.isBestSeller;
    if (body.isFeatured !== undefined) data.isFeatured = body.isFeatured;
    if (body.occasion !== undefined) data.occasion = body.occasion || null;
    if (body.fabric !== undefined) data.fabric = body.fabric || null;
    if (body.colors !== undefined) data.colors = stringifyJsonField(body.colors);
    if (body.sizes !== undefined) data.sizes = stringifyJsonField(body.sizes);
    if (body.rating !== undefined) data.rating = parseFloat(body.rating);
    if (body.reviewCount !== undefined) data.reviewCount = parseInt(body.reviewCount, 10);
    if (body.stockCount !== undefined) data.stockCount = parseInt(body.stockCount, 10);

    // Handle category updates
    if (body.categoryIds !== undefined) {
      // Delete existing category links and create new ones
      await db.productCategory.deleteMany({ where: { productId: id } });
      if (body.categoryIds.length > 0) {
        data.categories = {
          create: body.categoryIds.map((catId: string) => ({
            categoryId: catId,
          })),
        };
      }
    }

    // Handle collection updates
    if (body.collectionIds !== undefined) {
      await db.productCollection.deleteMany({ where: { productId: id } });
      if (body.collectionIds.length > 0) {
        data.collections = {
          create: body.collectionIds.map((colId: string) => ({
            collectionId: colId,
          })),
        };
      }
    }

    const product = await db.product.update({
      where: { id },
      data,
      include: {
        categories: { include: { category: true } },
        collections: { include: { collection: true } },
      },
    });

    return jsonResponse({
      ...formatProduct(product),
      categories: product.categories.map((pc) => pc.category),
      collections: product.collections.map((pc) => pc.collection),
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return errorResponse('Failed to update product', 500);
  }
}

// DELETE /api/admin/products/[id] — Delete a product
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const product = await db.product.findUnique({ where: { id } });
    if (!product) {
      return errorResponse('Product not found', 404);
    }

    await db.product.delete({ where: { id } });

    return jsonResponse({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return errorResponse('Failed to delete product', 500);
  }
}
