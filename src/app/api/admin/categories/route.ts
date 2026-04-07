import { db } from '@/lib/db';
import {
  generateSlug,
  jsonResponse,
  errorResponse,
} from '@/lib/api-utils';

// GET /api/admin/categories — List all categories (tree structure)
export async function GET() {
  try {
    const categories = await db.category.findMany({
      orderBy: { order: 'asc' },
      include: {
        parent: {
          select: { id: true, name: true, slug: true },
        },
        children: {
          orderBy: { order: 'asc' },
          include: {
            products: {
              select: { productId: true },
            },
          },
        },
        products: {
          select: { productId: true },
        },
      },
    });

    // Build tree structure
    const roots = categories.filter((c) => !c.parentId);
    const children = categories.filter((c) => c.parentId);

    const formattedCategories = roots.map((root) => ({
      ...root,
      productCount: root.products.length,
      children: children
        .filter((c) => c.parentId === root.id)
        .map((child) => ({
          id: child.id,
          name: child.name,
          slug: child.slug,
          description: child.description,
          parentId: child.parentId,
          order: child.order,
          productCount: child.products.length,
        })),
    }));

    return jsonResponse({
      categories: formattedCategories,
      allCategories: categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        parentId: c.parentId,
        order: c.order,
        productCount: c.products.length,
      })),
    });
  } catch (error) {
    console.error('Error listing categories:', error);
    return errorResponse('Failed to fetch categories', 500);
  }
}

// POST /api/admin/categories — Create a new category
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { name, slug, description, parentId, order } = body;

    if (!name) {
      return errorResponse('Category name is required');
    }

    const categorySlug = slug || generateSlug(name);

    // Check if slug already exists
    const existing = await db.category.findUnique({
      where: { slug: categorySlug },
    });
    if (existing) {
      return errorResponse('A category with this slug already exists', 409);
    }

    // Validate parentId if provided
    if (parentId) {
      const parent = await db.category.findUnique({ where: { id: parentId } });
      if (!parent) {
        return errorResponse('Parent category not found', 404);
      }
    }

    const category = await db.category.create({
      data: {
        name,
        slug: categorySlug,
        description: description || null,
        parentId: parentId || null,
        order: order ?? 0,
      },
      include: {
        parent: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    return jsonResponse({ category }, 201);
  } catch (error) {
    console.error('Error creating category:', error);
    return errorResponse('Failed to create category', 500);
  }
}
