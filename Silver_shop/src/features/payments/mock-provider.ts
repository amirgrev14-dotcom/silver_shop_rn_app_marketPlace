import type { CurrencyCode } from '@/features/marketplace/currency';
import type { PaymentConfirmation, PaymentIntent } from './types';
import type { PaymentProvider } from './payment-provider';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Free test provider — no keys, no network, no real money.
 * Mimics the Stripe flow (intent → sheet → confirmation) so every
 * screen, hook and the orders endpoint work unchanged when Stripe
 * is plugged in behind the same interface.
 */
export class MockPaymentProvider implements PaymentProvider {
  readonly name = 'mock';

  async createIntent(amount: number, currency: CurrencyCode): Promise<PaymentIntent> {
    await delay(600);
    const id = `mock_pi_${Date.now().toString(36)}${Math.floor(Math.random() * 1e4)}`;
    return { id, amount, currency };
  }

  async confirm(intent: PaymentIntent): Promise<PaymentConfirmation> {
    await delay(1200);
    return { status: 'succeeded', paymentId: intent.id };
  }
}

let cached: PaymentProvider | null = null;

/** Factory — reads EXPO_PUBLIC_PAYMENT_PROVIDER once (`mock` default). */
export function getPaymentProvider(): PaymentProvider {
  if (!cached) {
    // 'stripe' branch lands here later: `new StripePaymentProvider()`.
    cached = new MockPaymentProvider();
  }
  return cached;
}
