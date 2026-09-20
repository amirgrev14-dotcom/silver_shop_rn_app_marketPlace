/**
 * Currency catalog — foundation for multi-currency.
 * For now the seller picks explicitly in the Sell form (no geo,
 * no location permission); later the app can pre-select by region
 * and the backend can store/convert per product.
 */

export const CURRENCY_CODES = ['USD', 'JOD', 'EUR', 'SAR', 'AED'] as const;

export type CurrencyCode = (typeof CURRENCY_CODES)[number];

export const CURRENCIES: { code: CurrencyCode; symbol: string; label: string }[] = [
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'JOD', symbol: 'د.ا', label: 'Jordanian Dinar' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'SAR', symbol: '﷼', label: 'Saudi Riyal' },
  { code: 'AED', symbol: 'د.إ', label: 'UAE Dirham' },
];

export const DEFAULT_CURRENCY: CurrencyCode = 'USD';

export function currencySymbol(code: string): string {
  return CURRENCIES.find((c) => c.code === code)?.symbol ?? '$';
}
