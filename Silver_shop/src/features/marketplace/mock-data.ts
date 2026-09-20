import type { ImageSourcePropType } from "react-native";

/**
 * Static UI scaffolding (profile).
 * Categories live in beta-categories.ts (super-admin data until the API).
 * Product feed comes from the real API. Promos hidden until added.
 */

import { DEFAULT_CURRENCY } from './currency';

const priceFormatters = new Map<string, Intl.NumberFormat | null>();

function formatterFor(currency: string): Intl.NumberFormat | null {
  if (!priceFormatters.has(currency)) {
    try {
      // Dinar-family currencies read badly with forced decimals
      // ("JOD 1.000" looks like a thousand), so: no decimals by default.
      const noForcedDecimals = currency === "JOD";
      priceFormatters.set(
        currency,
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency,
          minimumFractionDigits: noForcedDecimals ? 0 : 2,
          maximumFractionDigits: noForcedDecimals ? 3 : 2,
        })
      );
    } catch {
      priceFormatters.set(currency, null);
    }
  }
  return priceFormatters.get(currency) ?? null;
}

export function formatPrice(amount: number, currency: string = DEFAULT_CURRENCY): string {
  const formatter = formatterFor(currency);
  if (formatter) return formatter.format(amount);
  return `$${amount.toFixed(2)}`;
}

/** Mock profile header/stats. No backend yet — replaced by API data later. */
export const MOCK_PROFILE = {
  name: "Ameer Ibrahim",
  stats: {
    listings: 12,
    reviews: 8,
    orders: 25,
  },
};

/**
 * Promo banner model.
 * Shape mirrors the future `GET /promos` API response managed by the
 * super-admin: later just replace MOCK_PROMOS with the API data —
 * screens and the PromoBanner component stay untouched.
 */
export interface PromoBannerData {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  image: ImageSourcePropType;
}

export const MOCK_PROMOS: PromoBannerData[] = [];
