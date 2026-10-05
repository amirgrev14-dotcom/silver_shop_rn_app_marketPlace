export type CartItem = {
  id: string;
  productId: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar?: string;
  name: string;
  description?: string;
  image: string;
  price: number;
  quantity: number;
  /** Stock snapshot at add time — instant cap without a server round-trip. */
  stock?: number;
};

export type CartSellerGroup = {
  sellerId: string;
  sellerName: string;
  sellerAvatar?: string;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
};
