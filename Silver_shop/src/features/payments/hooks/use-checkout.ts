import { useMemo, useState } from 'react';

import { DEFAULT_CURRENCY } from '@/features/marketplace/currency';
import { useCartStore } from '@/features/cart/store/cart-store';
import { toApiMessage } from '@/features/auth/services/auth-service';
import { getPaymentProvider } from '../mock-provider';
import { createOrder } from '../orders-service';
import type { Order, OrderLine, PaymentIntent } from '../types';

export type CheckoutPhase = 'idle' | 'sheet' | 'processing' | 'success' | 'error';

/**
 * Checkout state machine:
 * idle → sheet (intent ready) → processing (confirm + POST /orders)
 *   → success (order, cart cleared) | error (message, cart kept).
 * The cart is never cleared unless a PAID order exists.
 */
export function useCheckout() {
  const [phase, setPhase] = useState<CheckoutPhase>('idle');
  const [intent, setIntent] = useState<PaymentIntent | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  const items = useCartStore((s) => s.items);
  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const shipping = items.length === 0 ? 0 : 5;
    return { subtotal, shipping, total: subtotal + shipping };
  }, [items]);

  /** Step 1 — validate cart, create intent, open the card sheet. */
  const startCheckout = async () => {
    if (items.length === 0) {
      setError('Your cart is empty.');
      setPhase('error');
      return;
    }
    setError(null);
    setPhase('processing');
    try {
      const created = await getPaymentProvider().createIntent(totals.total, DEFAULT_CURRENCY);
      setIntent(created);
      setPhase('sheet');
    } catch (e) {
      setError(toApiMessage(e, 'Could not start payment. Try again.'));
      setPhase('error');
    }
  };

  const buildLines = (): OrderLine[] =>
    useCartStore.getState().items.map((i) => ({
      productId: i.productId,
      sellerId: i.sellerId,
      sellerName: i.sellerName,
      name: i.name,
      image: i.image,
      price: i.price,
      quantity: i.quantity,
    }));

  /** Step 2 — confirm the card, then create the PAID order. */
  const confirmPayment = async () => {
    if (!intent) return;
    setPhase('processing');
    setError(null);
    try {
      const result = await getPaymentProvider().confirm(intent);
      if (result.status === 'canceled') {
        setPhase('sheet');
        return;
      }
      if (result.status === 'failed') {
        setError(result.message);
        setPhase('error');
        return;
      }
      const created = await createOrder({
        paymentId: result.paymentId,
        currency: DEFAULT_CURRENCY,
        lines: buildLines(),
        ...totals,
      });
      useCartStore.getState().clearCart();
      await useCartStore.getState().flushSync();
      setOrder(created);
      setPhase('success');
    } catch (e) {
      setError(toApiMessage(e, 'Payment failed. Your cart is kept.'));
      setPhase('error');
    }
  };

  /** Test hook — "Simulate decline" in the mock sheet. */
  const declinePayment = () => {
    setError('Card declined (test). No money moved, cart is kept.');
    setPhase('error');
  };

  const closeSheet = () => {
    if (phase === 'processing') return;
    setPhase('idle');
  };

  const reset = () => {
    setPhase('idle');
    setIntent(null);
    setOrder(null);
    setError(null);
  };

  return {
    phase,
    intent,
    order,
    error,
    totals,
    itemCount: items.length,
    startCheckout,
    confirmPayment,
    declinePayment,
    closeSheet,
    reset,
  };
}
