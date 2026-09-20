import { z } from 'zod';

/**
 * Category schemas — same style as the backend (zod enums, server mirrors).
 * UI names are the single source of truth; the backend mapping collapses
 * them until the backend gains real subcategories.
 */

export const UI_CATEGORY_NAMES = [
  'Rings',
  'Necklaces',
  'Bracelets',
  'Earrings',
  'Anklets',
  'Other Items',
  'Others',
] as const;

export const uiCategorySchema = z.enum(UI_CATEGORY_NAMES);

export type UiCategory = z.infer<typeof uiCategorySchema>;

export const BACKEND_CATEGORY_NAMES = [
  'Jewelry',
  'Watches',
  'Coins',
  'Tableware',
  'Decor',
  'Vintage',
  ...UI_CATEGORY_NAMES,
] as const;

export const backendCategorySchema = z.enum(BACKEND_CATEGORY_NAMES);

export type BackendCategory = z.infer<typeof backendCategorySchema>;

/**
 * No invented mapping: UI names go to the backend as-is
 * (the backend enum mirrors the app grid). Unknown strings
 * fall back to "Other Items" instead of failing validation.
 */
export function mapCategoryToBackend(category: string): BackendCategory {
  const parsed = uiCategorySchema.safeParse(category);
  if (!parsed.success) return 'Other Items';
  return parsed.data;
}
