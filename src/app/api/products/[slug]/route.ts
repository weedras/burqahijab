import { db } from '@/lib/db';
import { formatProduct, jsonResponse, errorResponse } from '@/lib/api-utils';

// GET /api/products/[slug] — Get single product by slug
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const product = await db.product.findUnique({
      where: { slug },
      include: {
        categories: { include: { category: true } },
        collections: { include: { collection: true } },
      },
    });

    if (!product) {
      return errorResponse('Product not found', 404);
    }

    return jsonResponse({
      ...formatProduct(product),
      categories: product.categories.map((pc) => pc.category),
      collections: product.collections.map((pc) => pc.collection),
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return errorResponse('Failed to fetch product', 500);
  }
}
