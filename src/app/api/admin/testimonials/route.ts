import { db } from '@/lib/db';
import { jsonResponse, errorResponse } from '@/lib/api-utils';
import { requireAdmin } from '@/lib/auth';

// GET /api/admin/testimonials — List all testimonials
export async function GET(request: Request) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;
    const testimonials = await db.testimonial.findMany({
      orderBy: { order: 'asc' },
    });

    return jsonResponse({ testimonials });
  } catch (error) {
    console.error('Error listing testimonials:', error);
    return errorResponse('Failed to fetch testimonials', 500);
  }
}

// POST /api/admin/testimonials — Create a new testimonial
export async function POST(request: Request) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    const body = await request.json();

    const { author, location, text, rating, photoUrl, order } = body;

    if (!author || !text || !location) {
      return errorResponse('Author, location, and text are required');
    }

    if (rating < 1 || rating > 5) {
      return errorResponse('Rating must be between 1 and 5');
    }

    const testimonial = await db.testimonial.create({
      data: {
        author,
        location,
        text,
        rating: rating ?? 5,
        photoUrl: photoUrl || null,
        order: order ?? 0,
      },
    });

    return jsonResponse({ testimonial }, 201);
  } catch (error) {
    console.error('Error creating testimonial:', error);
    return errorResponse('Failed to create testimonial', 500);
  }
}
