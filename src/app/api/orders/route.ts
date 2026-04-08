import { db } from '@/lib/db';
import { jsonResponse, errorResponse, stringifyJsonField } from '@/lib/api-utils';
import { NextRequest } from 'next/server';

// POST /api/orders — Create a new order (public)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      customerName,
      customerEmail,
      customerPhone,
      address,
      city,
      items,
      totalAmount,
      currency = 'PKR',
      paymentMethod = 'cod',
      notes,
    } = body;

    // Validate required fields
    if (!customerName?.trim()) return errorResponse('Customer name is required', 400);
    if (!customerEmail?.trim()) return errorResponse('Email is required', 400);
    if (!address?.trim()) return errorResponse('Address is required', 400);
    if (!city?.trim()) return errorResponse('City is required', 400);
    if (!items || !Array.isArray(items) || items.length === 0) return errorResponse('Order must have at least one item', 400);
    if (!totalAmount || totalAmount <= 0) return errorResponse('Invalid total amount', 400);

    const validPaymentMethods = ['cod', 'jazzcash', 'easypaisa', 'bank_transfer', 'card'];
    if (!validPaymentMethods.includes(paymentMethod)) {
      return errorResponse('Invalid payment method', 400);
    }

    // Generate order number
    const orderCount = await db.order.count();
    const orderNumber = 'BHQ-' + String(orderCount + 1).padStart(5, '0');

    // Create order
    const order = await db.order.create({
      data: {
        orderNumber,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone?.trim() || null,
        address: address.trim(),
        city: city.trim(),
        items: stringifyJsonField(items),
        totalAmount: parseFloat(totalAmount),
        currency,
        paymentMethod,
        paymentStatus: 'pending',
        status: 'pending',
        notes: notes?.trim() || null,
      },
    });

    return jsonResponse(
      {
        message: 'Order placed successfully',
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          totalAmount: order.totalAmount,
          currency: order.currency,
          status: order.status,
          paymentMethod: order.paymentMethod,
        },
      },
      201
    );
  } catch (error) {
    console.error('Error creating order:', error);
    return errorResponse('Failed to create order. Please try again.', 500);
  }
}
