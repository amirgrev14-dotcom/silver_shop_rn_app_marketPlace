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
