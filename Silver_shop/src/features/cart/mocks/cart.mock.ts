import type { CartItem } from "../types/cart.types";

export const MOCK_CART_ITEMS: CartItem[] = [
  {
    id: "mock-1",
    productId: "p1",
    sellerId: "seller-ahmad",
    sellerName: "Ahmad SilverCrafts",
    sellerAvatar: undefined,
    name: "925 Silver Ring",
    description: "Minimal Design",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80",
    price: 28,
    quantity: 1,
  },
  {
    id: "mock-2",
    productId: "p2",
    sellerId: "seller-ahmad",
    sellerName: "Ahmad SilverCrafts",
    name: "Silver Bracelet",
    description: "Adjustable",
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=600&q=80",
    price: 42,
    quantity: 1,
  },
  {
    id: "mock-3",
    productId: "p3",
    sellerId: "seller-omar",
    sellerName: "Omar Silver",
    name: "Silver Necklace",
    description: "Elegant Design",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80",
    price: 34,
    quantity: 1,
  },
];
