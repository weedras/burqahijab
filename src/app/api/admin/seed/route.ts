import { db } from '@/lib/db';
import { stringifyJsonField, jsonResponse, errorResponse } from '@/lib/api-utils';
import {
  categories as seedCategories,
  collections as seedCollections,
  products as seedProducts,
  testimonials as seedTestimonials,
  productCollections as seedProductCollections,
  productCategories as seedProductCategories,
} from '@/data/seed';

// POST /api/admin/seed — Seed the database with sample data
export async function POST() {
  try {
    // Clear existing data in reverse dependency order
    await db.review.deleteMany();
    await db.productCategory.deleteMany();
    await db.productCollection.deleteMany();
    await db.newsletterSubscriber.deleteMany();
    await db.testimonial.deleteMany();
    await db.product.deleteMany();
    await db.collection.deleteMany();
    await db.category.deleteMany();

    // Create categories
    const allCategories = seedCategories.flatMap((cat) => [
      {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description || null,
        parentId: null,
        order: 0,
      },
      ...(cat.children || []).map((child) => ({
        id: child.id,
        name: child.name,
        slug: child.slug,
        description: child.description || null,
        parentId: cat.id,
        order: 0,
      })),
    ]);

    await db.category.createMany({
      data: allCategories,
    });

    // Create collections
    await db.collection.createMany({
      data: seedCollections.map((col) => ({
        id: col.id,
        name: col.name,
        slug: col.slug,
        description: col.description || null,
        image: col.image || null,
        featured: col.featured ?? false,
        order: 0,
      })),
    });

    // Create products
    await db.product.createMany({
      data: seedProducts.map((prod) => ({
        id: prod.id,
        name: prod.name,
        slug: prod.slug,
        description: prod.description,
        fabricCare: prod.fabricCare || null,
        shipReturn: prod.shipReturn || null,
        price: prod.price,
        salePrice: prod.salePrice || null,
        currency: prod.currency || 'PKR',
        images: stringifyJsonField(prod.images),
        videoUrl: prod.videoUrl || null,
        isNew: prod.isNew ?? false,
        isBestSeller: prod.isBestSeller ?? false,
        isFeatured: prod.isFeatured ?? false,
        occasion: prod.occasion || null,
        fabric: prod.fabric || null,
        colors: stringifyJsonField(prod.colors),
        sizes: stringifyJsonField(prod.sizes),
        rating: prod.rating ?? 0,
        reviewCount: prod.reviewCount ?? 0,
        stockCount: prod.stockCount ?? 0,
      })),
    });

    // Create product-collection join entries
    const pcEntries: { productId: string; collectionId: string }[] = [];
    for (const [collectionId, productIds] of Object.entries(seedProductCollections)) {
      for (const productId of productIds) {
        pcEntries.push({ productId, collectionId });
      }
    }
    await db.productCollection.createMany({ data: pcEntries });

    // Create product-category join entries
    const pcatEntries: { productId: string; categoryId: string }[] = [];
    for (const [categoryId, productIds] of Object.entries(seedProductCategories)) {
      for (const productId of productIds) {
        pcatEntries.push({ productId, categoryId });
      }
    }
    await db.productCategory.createMany({ data: pcatEntries });

    // Create testimonials
    await db.testimonial.createMany({
      data: seedTestimonials.map((t, index) => ({
        id: t.id,
        author: t.author,
        location: t.location,
        text: t.text,
        rating: t.rating ?? 5,
        photoUrl: t.photoUrl || null,
        order: index,
      })),
    });

    return jsonResponse(
      {
        message: 'Database seeded successfully',
        counts: {
          categories: allCategories.length,
          collections: seedCollections.length,
          products: seedProducts.length,
          productCollections: pcEntries.length,
          productCategories: pcatEntries.length,
          testimonials: seedTestimonials.length,
        },
      },
      201,
    );
  } catch (error) {
    console.error('Error seeding database:', error);
    return errorResponse('Failed to seed database', 500);
  }
}
