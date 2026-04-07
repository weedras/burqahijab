import { db } from '@/lib/db';
import {
  generateSlug,
  stringifyJsonField,
  parseJsonField,
  parseNumberParam,
  parseBooleanParam,
  formatProduct,
  jsonResponse,
  errorResponse,
} from '@/lib/api-utils';
import { Prisma } from '@prisma/client';

// GET /api/admin/products — List all products with pagination, search, filters
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const categorySlug = searchParams.get('category') || '';
    const collectionSlug = searchParams.get('collection') || '';
    const isNew = parseBooleanParam(searchParams.get('isNew'));
    const isFeatured = parseBooleanParam(searchParams.get('isFeatured'));
    const page = parseNumberParam(searchParams.get('page'), 1);
    const limit = parseNumberParam(searchParams.get('limit'), 20);

    // Build where clause
    const where: Prisma.ProductWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { slug: { contains: search } },
      ];
    }

    if (isNew !== undefined) {
      where.isNew = isNew;
    }

    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured;
    }

    // Filter by category slug
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

    // Filter by collection slug
    if (collectionSlug) {
      where.collections = {
        some: {
          collection: { slug: collectionSlug },
        },
      };
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          categories: {
            include: { category: true },
          },
          collections: {
            include: { collection: true },
          },
        },
      }),
      db.product.count({ where }),
    ]);

    const formattedProducts = products.map((p) => ({
      ...formatProduct(p),
      categories: p.categories.map((pc) => pc.category),
      collections: p.collections.map((pc) => pc.collection),
    }));

    return jsonResponse({
      products: formattedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error listing products:', error);
    return errorResponse('Failed to fetch products', 500);
  }
}

// POST /api/admin/products — Create a new product
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      name,
      slug,
      description,
      fabricCare,
      shipReturn,
      price,
      salePrice,
      currency,
      images,
      videoUrl,
      isNew,
      isBestSeller,
      isFeatured,
      occasion,
      fabric,
      colors,
      sizes,
      rating,
      reviewCount,
      stockCount,
      categoryIds,
      collectionIds,
    } = body;

    if (!name || !description || price === undefined) {
      return errorResponse('Name, description, and price are required');
    }

    const productSlug = slug || generateSlug(name);

    // Check if slug already exists
    const existing = await db.product.findUnique({ where: { slug: productSlug } });
    if (existing) {
      return errorResponse('A product with this slug already exists', 409);
    }

    const product = await db.product.create({
      data: {
        name,
        slug: productSlug,
        description,
        fabricCare: fabricCare || null,
        shipReturn: shipReturn || null,
        price: parseFloat(price),
        salePrice: salePrice ? parseFloat(salePrice) : null,
        currency: currency || 'PKR',
        images: stringifyJsonField(images),
        videoUrl: videoUrl || null,
        isNew: isNew ?? false,
        isBestSeller: isBestSeller ?? false,
        isFeatured: isFeatured ?? false,
        occasion: occasion || null,
        fabric: fabric || null,
        colors: stringifyJsonField(colors),
        sizes: stringifyJsonField(sizes),
        rating: rating ?? 0,
        reviewCount: reviewCount ?? 0,
        stockCount: stockCount ?? 0,
        // Create join table entries if category/collection IDs provided
        categories: categoryIds?.length
          ? {
              create: categoryIds.map((catId: string) => ({
                categoryId: catId,
              })),
            }
          : undefined,
        collections: collectionIds?.length
          ? {
              create: collectionIds.map((colId: string) => ({
                collectionId: colId,
              })),
            }
          : undefined,
      },
      include: {
        categories: { include: { category: true } },
        collections: { include: { collection: true } },
      },
    });

    return jsonResponse(
      {
        ...formatProduct(product),
        categories: product.categories.map((pc) => pc.category),
        collections: product.collections.map((pc) => pc.collection),
      },
      201,
    );
  } catch (error) {
    console.error('Error creating product:', error);
    return errorResponse('Failed to create product', 500);
  }
}
