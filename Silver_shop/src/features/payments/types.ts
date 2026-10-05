import type { CurrencyCode } from '@/features/marketplace/currency';

/** One payment attempt for the current cart total. */
export interface PaymentIntent {
  /** Provider-side id (`mock_pi_…`, later `pi_…` from Stripe). */
  id: string;
  amount: number;
  currency: CurrencyCode;
}

/** Outcome of the card sheet (mock today, PaymentSheet with Stripe). */
export type PaymentConfirmation =
  | { status: 'succeeded'; paymentId: string }
  | { status: 'canceled' }
  | { status: 'failed'; message: string };

/** Line sent to POST /orders — a snapshot, prices fixed at checkout time. */
export interface OrderLine {
  productId: string;
  sellerId: string;
  sellerName: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export interface CreateOrderPayload {
  paymentId: string;
  currency: CurrencyCode;
  lines: OrderLine[];
  subtotal: number;
  shipping: number;
  total: number;
}

export interface Order extends CreateOrderPayload {
  id: string;
  status: 'PAID';
  createdAt: string;
}
