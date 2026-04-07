import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/admin/orders - list all orders
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where = status ? { status } : {};

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.order.count({ where }),
    ]);

    // Get status counts for dashboard
    const allOrders = await db.order.findMany();
    const statusCounts = {
      total: allOrders.length,
      pending: allOrders.filter(o => o.status === 'pending').length,
      confirmed: allOrders.filter(o => o.status === 'confirmed').length,
      processing: allOrders.filter(o => o.status === 'processing').length,
      shipped: allOrders.filter(o => o.status === 'shipped').length,
      delivered: allOrders.filter(o => o.status === 'delivered').length,
      cancelled: allOrders.filter(o => o.status === 'cancelled').length,
      returned: allOrders.filter(o => o.status === 'returned').length,
    };

    return NextResponse.json({ orders, total, page, limit, statusCounts });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

// POST /api/admin/orders - create an order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Generate order number
    const count = await db.order.count();
    const orderNumber = `BHQ-${String(count + 1).padStart(5, '0')}`;

    const order = await db.order.create({
      data: {
        orderNumber,
        customerName: body.customerName || 'Guest',
        customerEmail: body.customerEmail || '',
        customerPhone: body.customerPhone || '',
        address: body.address || '',
        city: body.city || '',
        items: JSON.stringify(body.items || []),
        totalAmount: body.totalAmount || 0,
        paymentMethod: body.paymentMethod || 'cod',
        status: body.status || 'pending',
        notes: body.notes || '',
      },
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

// PATCH /api/admin/orders - update order status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
    }

    const order = await db.order.update({
      where: { id },
      data: {
        status: updateData.status,
        paymentStatus: updateData.paymentStatus,
        trackingNumber: updateData.trackingNumber,
        notes: updateData.notes,
      },
    });

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

// DELETE /api/admin/orders - delete an order
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
    }

    await db.order.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}
