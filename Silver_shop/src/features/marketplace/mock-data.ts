import type { ImageSourcePropType } from "react-native";

/**
 * Static UI scaffolding (profile).
 * Categories live in beta-categories.ts (super-admin data until the API).
 * Product feed comes from the real API. Promos hidden until added.
 */

export function formatPrice(amount: number): string {
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
