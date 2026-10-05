import { AppError, HttpStatus } from "../../common/AppError.js";
import { prisma } from "../../lib/prisma.js";
import type { CreateOrderDto } from "./schema.js";

/**
 * Verifies a payment before an order is stored.
 * Mock phase: only `mock_pi_*` ids are accepted (free testing).
 * Stripe phase: look the PaymentIntent up via stripe-node and
 * require `status === "succeeded"` here instead.
 */
async function verifyPayment(paymentId: string): Promise<void> {
  if (paymentId.startsWith("mock_pi_")) return;
  throw new AppError(HttpStatus.PAYMENT_REQUIRED, "Payment not verified");
}

function toOrderJson(order: any) {
  return {
    ...order,
    subtotal: Number(order.subtotal),
    shipping: Number(order.shipping),
    total: Number(order.total),
    lines: order.lines.map((l: any) => ({ ...l, price: Number(l.price) })),
  };
}

export class OrdersService {
  async createOrder(userId: string, data: CreateOrderDto) {
    await verifyPayment(data.paymentId);

    // Recompute the total server-side — a tampered client payload fails here.
    const subtotal = data.lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
    const total = subtotal + data.shipping;
    if (Math.abs(total - data.total) > 0.01 || Math.abs(subtotal - data.subtotal) > 0.01) {
      throw new AppError(HttpStatus.BAD_REQUEST, "Order totals do not match");
    }

    try {
      const order = await prisma.order.create({
        data: {
          userId,
          paymentId: data.paymentId,
          currency: data.currency,
          subtotal: data.subtotal,
          shipping: data.shipping,
          total: data.total,
          status: "PAID",
          lines: {
            create: data.lines.map((l) => ({
              productId: l.productId,
              sellerId: l.sellerId,
              sellerName: l.sellerName,
              name: l.name,
              image: l.image,
              price: l.price,
              quantity: l.quantity,
            })),
          },
        },
        include: { lines: true },
      });
      return toOrderJson(order);
    } catch (error: any) {
      // Retry with the same paymentId (double-tap, flaky network) —
      // return the existing PAID order instead of a duplicate.
      if (error?.code === "P2002") {
        const existing = await prisma.order.findUnique({
          where: { paymentId: data.paymentId },
          include: { lines: true },
        });
        if (existing) return toOrderJson(existing);
      }
      throw error;
    }
  }
}
