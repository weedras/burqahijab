import { db } from '@/lib/db';
import { jsonResponse, errorResponse } from '@/lib/api-utils';

// GET /api/admin/dashboard — Dashboard statistics
export async function GET() {
  try {
    const [
      totalProducts,
      totalCollections,
      totalCategories,
      totalTestimonials,
      totalReviews,
      totalSubscribers,
      lowStockProducts,
      featuredProducts,
      newProducts,
      recentReviews,
    ] = await Promise.all([
      // Total products
      db.product.count(),

      // Total collections
      db.collection.count(),

      // Total categories
      db.category.count(),

      // Total testimonials
      db.testimonial.count(),

      // Total reviews
      db.review.count(),

      // Total newsletter subscribers
      db.newsletterSubscriber.count(),

      // Low stock products (stock < 10)
      db.product.findMany({
        where: { stockCount: { lt: 10 } },
        select: {
          id: true,
          name: true,
          slug: true,
          stockCount: true,
          price: true,
          images: true,
        },
        orderBy: { stockCount: 'asc' },
        take: 20,
      }),

      // Featured products count
      db.product.count({ where: { isFeatured: true } }),

      // New products count
      db.product.count({ where: { isNew: true } }),

      // Recent reviews (last 10)
      db.review.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          product: {
            select: { id: true, name: true, slug: true },
          },
        },
      }),
    ]);

    // Revenue estimate: sum of (price * reviewCount) as a proxy
    // Since we don't have actual orders, use (price * reviewCount) as estimate
    const revenueData = await db.product.aggregate({
      _sum: { price: true },
      _avg: { price: true, rating: true },
    });

    const formattedLowStock = lowStockProducts.map((p) => ({
      ...p,
      images: p.images ? JSON.parse(p.images) : [],
    }));

    return jsonResponse({
      stats: {
        totalProducts,
        totalCollections,
        totalCategories,
        totalTestimonials,
        totalReviews,
        totalSubscribers,
        featuredProducts,
        newProducts,
      },
      revenue: {
        totalInventoryValue: revenueData._sum.price || 0,
        averagePrice: Math.round((revenueData._avg.price || 0) * 100) / 100,
        averageRating: Math.round((revenueData._avg.rating || 0) * 10) / 10,
      },
      lowStockAlerts: formattedLowStock,
      recentReviews,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return errorResponse('Failed to fetch dashboard statistics', 500);
  }
}
