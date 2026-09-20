/**
 * ═══════════════════════════════════════════════════════════════════
 *  BETA CATEGORY DATA — TEMPORARY.
 *  Categories are super-admin managed data (add / hide per region,
 *  e.g. when a category is banned in some country).
 *  TODO: DELETE this file when `GET /categories` API is connected —
 *  screens read through these exports, so swapping means changing
 *  only the import source. Names come from the zod category schema.
 * ═══════════════════════════════════════════════════════════════════
 */
import type { ImageSourcePropType } from "react-native";

import {
  UI_CATEGORY_NAMES,
  type UiCategory,
} from "@/features/products/schemas/categories.schema";

export interface BetaCategory {
  id: string;
  name: UiCategory;
  image: ImageSourcePropType;
}

const img = (id: string): ImageSourcePropType => ({
  uri: `https://images.unsplash.com/${id}?auto=format&fit=crop&w=600&q=80`,
});

const BETA_IMAGES: Record<UiCategory, ImageSourcePropType> = {
  Rings: img("photo-1515562141207-7a88fb7ce338"),
  Necklaces: img("photo-1599643478518-a784e5dc4c8f"),
  Bracelets: img("photo-1611591437281-460bfbe1220a"),
  Earrings: img("photo-1573408301185-9146fe634ad0"),
  Anklets: img("photo-1601121141461-9d6647bca1ed"),
  "Other Items": img("photo-1617038220319-276d3cfab638"),
  Others: img("photo-1617038220319-276d3cfab638"),
};

const slug = (name: string) => name.toLowerCase().replace(/\s+/g, "-");

/** Full catalog grid (Categories screen, Sell picker). */
export const BETA_CATEGORIES: BetaCategory[] = UI_CATEGORY_NAMES.filter(
  (name) => name !== "Others",
).map((name) => ({ id: slug(name), name, image: BETA_IMAGES[name] }));

/** Compact row for Home (first categories + Others shortcut). */
export const BETA_HOME_CATEGORIES: BetaCategory[] = [
  ...BETA_CATEGORIES.slice(0, 4),
  { id: "others", name: "Others", image: BETA_IMAGES["Others"] },
];

/** Names only — Sell form picker. */
export const BETA_SELL_CATEGORY_NAMES: string[] = BETA_CATEGORIES.map((c) => c.name);
