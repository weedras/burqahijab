import { db } from '@/lib/db';
import { jsonResponse, errorResponse } from '@/lib/api-utils';

// GET /api/admin/testimonials/[id] — Get a single testimonial
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const testimonial = await db.testimonial.findUnique({
      where: { id },
    });

    if (!testimonial) {
      return errorResponse('Testimonial not found', 404);
    }

    return jsonResponse({ testimonial });
  } catch (error) {
    console.error('Error fetching testimonial:', error);
    return errorResponse('Failed to fetch testimonial', 500);
  }
}

// PUT /api/admin/testimonials/[id] — Update a testimonial
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await db.testimonial.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse('Testimonial not found', 404);
    }

    const data: Record<string, unknown> = {};

    if (body.author !== undefined) data.author = body.author;
    if (body.location !== undefined) data.location = body.location;
    if (body.text !== undefined) data.text = body.text;
    if (body.rating !== undefined) {
      if (body.rating < 1 || body.rating > 5) {
        return errorResponse('Rating must be between 1 and 5');
      }
      data.rating = body.rating;
    }
    if (body.photoUrl !== undefined) data.photoUrl = body.photoUrl || null;
    if (body.order !== undefined) data.order = body.order;

    const testimonial = await db.testimonial.update({
      where: { id },
      data,
    });

    return jsonResponse({ testimonial });
  } catch (error) {
    console.error('Error updating testimonial:', error);
    return errorResponse('Failed to update testimonial', 500);
  }
}

// DELETE /api/admin/testimonials/[id] — Delete a testimonial
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const testimonial = await db.testimonial.findUnique({ where: { id } });
    if (!testimonial) {
      return errorResponse('Testimonial not found', 404);
    }

    await db.testimonial.delete({ where: { id } });

    return jsonResponse({ message: 'Testimonial deleted successfully' });
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    return errorResponse('Failed to delete testimonial', 500);
  }
}
