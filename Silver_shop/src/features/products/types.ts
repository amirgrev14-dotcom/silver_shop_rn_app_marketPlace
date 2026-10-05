export const PRODUCT_CATEGORIES = [
  'Jewelry',
  'Watches',
  'Coins',
  'Tableware',
  'Decor',
  'Vintage',
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export interface Product {
  id: string;
  title: string;
  price: number;
  /** ISO currency code. Optional until the backend stores it. */
  currency?: string;
  /** Units available. Unique pieces default to 1. */
  stock: number;
  description: string | null;
  images: string[];
  categories: string[];
  status: 'DRAFT' | 'ACTIVE' | 'SOLD' | 'ARCHIVED';
  sellerId: string;
  sellerName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductValues {
  title: string;
  price: number;
  /** Sent along; backend ignores unknown keys until it supports currency. */
  currency?: string;
  stock?: number;
  description?: string;
  images: string[];
  categories: string[];
}

export interface ProductFeed {
  items: Product[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}
