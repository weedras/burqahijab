import { db } from '@/lib/db';
import {
  generateSlug,
  jsonResponse,
  errorResponse,
} from '@/lib/api-utils';

// GET /api/admin/categories/[id] — Get a single category
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const category = await db.category.findUnique({
      where: { id },
      include: {
        parent: {
          select: { id: true, name: true, slug: true },
        },
        children: {
          orderBy: { order: 'asc' },
        },
        products: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!category) {
      return errorResponse('Category not found', 404);
    }

    const formattedCategory = {
      ...category,
      products: category.products.map((pc) => ({
        ...pc.product,
        images: pc.product.images ? JSON.parse(pc.product.images) : [],
        colors: pc.product.colors ? JSON.parse(pc.product.colors) : [],
        sizes: pc.product.sizes ? JSON.parse(pc.product.sizes) : [],
      })),
    };

    return jsonResponse({ category: formattedCategory });
  } catch (error) {
    console.error('Error fetching category:', error);
    return errorResponse('Failed to fetch category', 500);
  }
}

// PUT /api/admin/categories/[id] — Update a category
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await db.category.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse('Category not found', 404);
    }

    const data: Record<string, unknown> = {};

    if (body.name !== undefined) data.name = body.name;
    if (body.slug !== undefined) {
      if (body.slug !== existing.slug) {
        const slugExists = await db.category.findUnique({
          where: { slug: body.slug },
        });
        if (slugExists) {
          return errorResponse('A category with this slug already exists', 409);
        }
      }
      data.slug = body.slug;
    } else if (body.name !== undefined && body.name !== existing.name) {
      const newSlug = generateSlug(body.name);
      if (newSlug !== existing.slug) {
        const slugExists = await db.category.findUnique({
          where: { slug: newSlug },
        });
        if (!slugExists) {
          data.slug = newSlug;
        }
      }
    }
    if (body.description !== undefined) data.description = body.description || null;
    if (body.parentId !== undefined) {
      if (body.parentId) {
        const parent = await db.category.findUnique({ where: { id: body.parentId } });
        if (!parent) {
          return errorResponse('Parent category not found', 404);
        }
        // Prevent setting self as parent
        if (body.parentId === id) {
          return errorResponse('Category cannot be its own parent', 400);
        }
      }
      data.parentId = body.parentId || null;
    }
    if (body.order !== undefined) data.order = body.order;

    const category = await db.category.update({
      where: { id },
      data,
      include: {
        parent: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    return jsonResponse({ category });
  } catch (error) {
    console.error('Error updating category:', error);
    return errorResponse('Failed to update category', 500);
  }
}

// DELETE /api/admin/categories/[id] — Delete a category
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const category = await db.category.findUnique({
      where: { id },
      include: { children: true },
    });

    if (!category) {
      return errorResponse('Category not found', 404);
    }

    // Check if category has children
    if (category.children.length > 0) {
      return errorResponse(
        'Cannot delete category with child categories. Delete children first.',
        400,
      );
    }

    await db.category.delete({ where: { id } });

    return jsonResponse({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return errorResponse('Failed to delete category', 500);
  }
}
