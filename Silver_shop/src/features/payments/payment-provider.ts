import type { CurrencyCode } from '@/features/marketplace/currency';
import type { PaymentConfirmation, PaymentIntent } from './types';

/**
 * Payment abstraction — the whole app talks to this, never to a
 * concrete SDK. Today `mock` (free, no keys), tomorrow `stripe`
 * (PaymentSheet) behind the same two methods + the env flag.
 */
export interface PaymentProvider {
  readonly name: string;
  /** Ask the backend for a payment intent for this amount. */
  createIntent: (amount: number, currency: CurrencyCode) => Promise<PaymentIntent>;
  /**
   * Collect the card + confirm. Resolves `succeeded` / `canceled` /
   * `failed` — never throws for user-facing outcomes (declined card,
   * closed sheet); throws only on programming errors.
   */
  confirm: (intent: PaymentIntent) => Promise<PaymentConfirmation>;
}
