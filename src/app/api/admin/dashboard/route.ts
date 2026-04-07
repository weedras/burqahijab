import { db } from '@/lib/db';
import { jsonResponse, errorResponse } from '@/lib/api-utils';
import { requireAdmin } from '@/lib/auth';

// GET /api/admin/dashboard — Comprehensive e-commerce dashboard metrics
export async function GET(request: Request) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    const now = new Date();

    // Date boundaries
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay()); // Sunday
    weekStart.setHours(0, 0, 0, 0);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // ─── Run all independent queries in parallel ─────────────────────────
    const [
      // 1. Revenue aggregates
      totalRevenueAgg,
      monthlyRevenueAgg,
      weeklyRevenueAgg,
      todayRevenueAgg,
      revenueByPaymentRaw,
      returnedOrdersAgg,
      cancelledOrdersAgg,

      // 2. Order counts & groups
      totalOrdersCount,
      ordersByStatusRaw,
      firstOrder,
      recentOrders,

      // 3. Product metrics
      totalProductsCount,
      productsForInventory,
      lowStockProducts,
      outOfStockCount,
      topSellers,
      avgRatingAgg,
      onSaleCount,

      // 4. Customer data
      allOrdersForCustomers,

      // 5. Newsletter
      totalSubscribersCount,
      newSubscribersThisMonth,
    ] = await Promise.all([
      // ── Revenue ──
      db.order.aggregate({ _sum: { totalAmount: true } }),
      db.order.aggregate({
        _sum: { totalAmount: true },
        where: { createdAt: { gte: monthStart } },
      }),
      db.order.aggregate({
        _sum: { totalAmount: true },
        where: { createdAt: { gte: weekStart } },
      }),
      db.order.aggregate({
        _sum: { totalAmount: true },
        where: { createdAt: { gte: todayStart } },
      }),
      db.order.groupBy({
        by: ['paymentMethod'],
        _sum: { totalAmount: true },
        _count: true,
      }),
      db.order.aggregate({
        _sum: { totalAmount: true },
        _count: true,
        where: { status: 'returned' },
      }),
      db.order.aggregate({
        _sum: { totalAmount: true },
        _count: true,
        where: { status: 'cancelled' },
      }),

      // ── Orders ──
      db.order.count(),
      db.order.groupBy({
        by: ['status'],
        _count: true,
      }),
      db.order.findFirst({
        orderBy: { createdAt: 'asc' },
        select: { createdAt: true },
      }),
      db.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          orderNumber: true,
          customerName: true,
          totalAmount: true,
          status: true,
          paymentMethod: true,
          city: true,
          createdAt: true,
        },
      }),

      // ── Products ──
      db.product.count(),
      db.product.findMany({
        select: { price: true, stockCount: true },
      }),
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
      }),
      db.product.count({ where: { stockCount: 0 } }),
      db.product.findMany({
        orderBy: { reviewCount: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          salePrice: true,
          stockCount: true,
          reviewCount: true,
          rating: true,
          images: true,
        },
      }),
      db.product.aggregate({ _avg: { rating: true } }),
      db.product.count({ where: { salePrice: { not: null } } }),

      // ── Customers ──
      db.order.findMany({
        select: {
          customerEmail: true,
          city: true,
          items: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),

      // ── Newsletter ──
      db.newsletterSubscriber.count(),
      db.newsletterSubscriber.count({
        where: { createdAt: { gte: monthStart } },
      }),
    ]);

    // ─── 1. Revenue & Financials ────────────────────────────────────────
    const totalRevenue = Number(totalRevenueAgg._sum.totalAmount ?? 0);
    const monthlyRevenue = Number(monthlyRevenueAgg._sum.totalAmount ?? 0);
    const weeklyRevenue = Number(weeklyRevenueAgg._sum.totalAmount ?? 0);
    const todayRevenue = Number(todayRevenueAgg._sum.totalAmount ?? 0);
    const averageOrderValue =
      totalOrdersCount > 0
        ? Math.round((totalRevenue / totalOrdersCount) * 100) / 100
        : 0;

    const revenueByPayment: Record<string, number> = {
      cod: 0,
      jazzcash: 0,
      easypaisa: 0,
      bank_transfer: 0,
      card: 0,
    };
    for (const row of revenueByPaymentRaw) {
      revenueByPayment[row.paymentMethod] = Number(row._sum.totalAmount ?? 0);
    }

    const returnedTotalValue = Number(returnedOrdersAgg._sum.totalAmount ?? 0);

    // ─── 2. Order Metrics ───────────────────────────────────────────────
    const ordersByStatus: Record<string, number> = {
      pending: 0,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      returned: 0,
    };
    for (const row of ordersByStatusRaw) {
      if (row.status in ordersByStatus) {
        ordersByStatus[row.status] = row._count;
      }
    }

    // Average daily orders
    let avgDailyOrders = 0;
    if (firstOrder && totalOrdersCount > 0) {
      const daysSinceFirst = Math.max(
        1,
        Math.ceil(
          (now.getTime() - firstOrder.createdAt.getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      );
      avgDailyOrders =
        Math.round((totalOrdersCount / daysSinceFirst) * 100) / 100;
    }

    // ─── 3. Product & Inventory ─────────────────────────────────────────
    let totalInventoryValue = 0;
    for (const p of productsForInventory) {
      totalInventoryValue += Number(p.price) * Number(p.stockCount);
    }
    totalInventoryValue = Math.round(totalInventoryValue * 100) / 100;

    const parsedLowStock = lowStockProducts.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      stockCount: p.stockCount,
      price: p.price,
      images: (() => {
        try {
          return JSON.parse(p.images);
        } catch {
          return [];
        }
      })(),
    }));

    const parsedTopSellers = topSellers.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      salePrice: p.salePrice,
      stockCount: p.stockCount,
      reviewCount: p.reviewCount,
      rating: p.rating,
      images: (() => {
        try {
          return JSON.parse(p.images);
        } catch {
          return [];
        }
      })(),
    }));

    const averageRating =
      Math.round(Number(avgRatingAgg._avg.rating ?? 0) * 10) / 10;

    // ─── 4. Customer Metrics ────────────────────────────────────────────
    const emailSet = new Set<string>();
    const emailOrderCounts = new Map<string, number>();
    const cityOrderCounts = new Map<string, number>();
    let totalItemsParsed = 0;
    let ordersParsedForItems = 0;

    for (const order of allOrdersForCustomers) {
      emailSet.add(order.customerEmail);
      emailOrderCounts.set(
        order.customerEmail,
        (emailOrderCounts.get(order.customerEmail) ?? 0) + 1,
      );

      const city = order.city || 'Unknown';
      cityOrderCounts.set(city, (cityOrderCounts.get(city) ?? 0) + 1);

      // Parse items for average items per order
      try {
        const items = JSON.parse(order.items);
        if (Array.isArray(items)) {
          totalItemsParsed += items.length;
          ordersParsedForItems++;
        }
      } catch {
        // skip unparseable items
      }
    }

    const totalUniqueCustomers = emailSet.size;
    const repeatCustomerCount = Array.from(emailOrderCounts.values()).filter(
      (c) => c > 1,
    ).length;
    const repeatCustomerRate =
      totalUniqueCustomers > 0
        ? Math.round(
            (repeatCustomerCount / totalUniqueCustomers) * 10000,
          ) / 100
        : 0;

    // Top 5 cities
    const topCities = Array.from(cityOrderCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([city, orderCount]) => ({ city, orderCount }));

    // Recent 5 unique customers
    const recentCustomers: Array<{ email: string; lastOrderAt: string }> = [];
    const seenEmails = new Set<string>();
    for (const order of allOrdersForCustomers) {
      if (!seenEmails.has(order.customerEmail)) {
        seenEmails.add(order.customerEmail);
        recentCustomers.push({
          email: order.customerEmail,
          lastOrderAt: order.createdAt.toISOString(),
        });
        if (recentCustomers.length >= 5) break;
      }
    }

    // ─── 5. Returns & Refunds ───────────────────────────────────────────
    const totalReturnedOrders = Number(returnedOrdersAgg._count ?? 0);
    const returnRate =
      totalOrdersCount > 0
        ? Math.round((totalReturnedOrders / totalOrdersCount) * 10000) / 100
        : 0;
    const totalCancelledOrders = Number(cancelledOrdersAgg._count ?? 0);
    const cancelledTotalValue = Number(cancelledOrdersAgg._sum.totalAmount ?? 0);

    // ─── 6. Newsletter & Engagement ─────────────────────────────────────
    const totalSubscribers = totalSubscribersCount;
    const newSubscribers = newSubscribersThisMonth;

    // ─── 7. Performance Indicators ──────────────────────────────────────
    const catalogEfficiency =
      totalOrdersCount + totalProductsCount > 0
        ? Math.round(
            (totalOrdersCount / (totalOrdersCount + totalProductsCount)) *
              10000,
          ) / 100
        : 0;

    const avgItemsPerOrder =
      ordersParsedForItems > 0
        ? Math.round((totalItemsParsed / ordersParsedForItems) * 100) / 100
        : 0;

    // ─── Build response ─────────────────────────────────────────────────
    return jsonResponse({
      revenue: {
        total: totalRevenue,
        thisMonth: monthlyRevenue,
        thisWeek: weeklyRevenue,
        today: todayRevenue,
        averageOrderValue,
        byPaymentMethod: revenueByPayment,
        returnedValue: returnedTotalValue,
      },
      orders: {
        total: totalOrdersCount,
        byStatus: ordersByStatus,
        averageDaily: avgDailyOrders,
        recent: recentOrders,
      },
      products: {
        total: totalProductsCount,
        inventoryValue: totalInventoryValue,
        lowStock: parsedLowStock,
        outOfStock: outOfStockCount,
        topSellers: parsedTopSellers,
        averageRating,
        onSale: onSaleCount,
      },
      customers: {
        totalUnique: totalUniqueCustomers,
        repeatRate: repeatCustomerRate,
        topCities,
        recentEmails: recentCustomers.map(c => c.email),
      },
      returns: {
        total: totalReturnedOrders,
        totalValue: returnedTotalValue,
        returnRate,
        cancelled: { count: totalCancelledOrders, value: cancelledTotalValue },
      },
      newsletter: {
        total: totalSubscribers,
        thisMonth: newSubscribers,
      },
      performance: {
        catalogEfficiency,
        averageItemsPerOrder: avgItemsPerOrder,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return errorResponse('Failed to fetch dashboard statistics', 500);
  }
}
