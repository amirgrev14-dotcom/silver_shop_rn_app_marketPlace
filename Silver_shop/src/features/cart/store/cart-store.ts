import { create } from "zustand";
import * as SecureStore from "expo-secure-store";

import type { CartItem, CartSellerGroup } from "../types/cart.types";
import { getItemsGroupedBySeller, getSubtotal, getTotalItems, getEstimatedShipping } from "../utils/cart-utils";

/**
 * Cart store — two layers, one rule:
 *  - UI layer (memory): every mutation updates `items` instantly,
 *    so +/−/trash buttons never wait for IO.
 *  - Sync layer (disk/server): `scheduleFlush` debounces writes,
 *    `flushSync` persists the whole snapshot ONCE (modal exit).
 */
const CART_KEY = "marketplace.cart.v2";
const MAX_ITEMS = 100;
const FLUSH_DELAY_MS = 600;

let flushTimer: ReturnType<typeof setTimeout> | null = null;

/** Item payload for `addItem` — quantity defaults to 1 when omitted. */
export type NewCartItem = Omit<CartItem, "quantity"> & { quantity?: number };

type CartState = {
  items: CartItem[];
  _hydrated: boolean;

  // Mutations — memory only, UI updates instantly.
  addItem: (item: NewCartItem) => void;
  removeItem: (id: string) => void;
  increaseQuantity: (id: string) => void;
  decreaseQuantity: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setItems: (items: CartItem[]) => void;

  // Derived values — pure functions over `items` (see cart-utils).
  getItemQuantity: (id: string) => number;
  getSubtotal: () => number;
  getTotalItems: () => number;
  getEstimatedShipping: () => number;
  getTotalWithShipping: () => number;
  getItemsGroupedBySeller: () => CartSellerGroup[];

  // Persistence — load once on start, save in one batch on exit.
  hydrate: () => Promise<void>;
  scheduleFlush: () => void;
  flushSync: () => Promise<void>;
};

function changeQuantity(items: CartItem[], id: string, delta: number): CartItem[] {
  return items.map((item) =>
    item.id === id ? { ...item, quantity: item.quantity + delta } : item
  );
}

function isValidStoredItem(item: unknown): item is CartItem {
  if (typeof item !== "object" || item === null) return false;
  const line = item as Record<string, unknown>;
  return (
    typeof line.id === "string" &&
    typeof line.productId === "string" &&
    typeof line.sellerId === "string" &&
    typeof line.name === "string" &&
    typeof line.image === "string" &&
    typeof line.price === "number" &&
    typeof line.quantity === "number" &&
    line.quantity > 0
  );
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  _hydrated: false,

  addItem: (raw) => {
    const quantity = raw.quantity ?? 1;
    set((state) => {
      const existing = state.items.find(
        (item) => item.id === raw.id || item.productId === raw.productId
      );
      if (existing) {
        return { items: changeQuantity(state.items, existing.id, quantity) };
      }
      const item: CartItem = {
        id: raw.id,
        productId: raw.productId,
        sellerId: raw.sellerId,
        sellerName: raw.sellerName,
        sellerAvatar: raw.sellerAvatar,
        name: raw.name,
        description: raw.description,
        image: raw.image,
        price: raw.price,
        quantity,
      };
      return { items: [...state.items, item] };
    });
    get().scheduleFlush();
  },

  removeItem: (id) => {
    set((state) => ({ items: state.items.filter((item) => item.id !== id) }));
    get().scheduleFlush();
  },

  increaseQuantity: (id) => {
    set((state) => ({ items: changeQuantity(state.items, id, 1) }));
    get().scheduleFlush();
  },

  decreaseQuantity: (id) => {
    const item = get().items.find((line) => line.id === id);
    if (!item) return;
    if (item.quantity <= 1) {
      get().removeItem(id);
      return;
    }
    set((state) => ({ items: changeQuantity(state.items, id, -1) }));
    get().scheduleFlush();
  },

  updateQuantity: (id, quantity) => {
    if (quantity < 1) {
      get().removeItem(id);
      return;
    }
    set((state) => ({
      items: state.items.map((item) => (item.id === id ? { ...item, quantity } : item)),
    }));
    get().scheduleFlush();
  },

  clearCart: () => {
    set({ items: [] });
    get().scheduleFlush();
  },

  setItems: (items) => {
    set({ items });
    get().scheduleFlush();
  },

  getItemQuantity: (id) => get().items.find((item) => item.id === id)?.quantity ?? 0,

  getSubtotal: () => getSubtotal(get().items),
  getTotalItems: () => getTotalItems(get().items),
  getEstimatedShipping: () => getEstimatedShipping(get().items),
  getTotalWithShipping: () => getSubtotal(get().items) + getEstimatedShipping(get().items),
  getItemsGroupedBySeller: () => getItemsGroupedBySeller(get().items),

  hydrate: async () => {
    try {
      const raw = await SecureStore.getItemAsync(CART_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          set({ items: parsed.filter(isValidStoredItem).slice(0, MAX_ITEMS), _hydrated: true });
          return;
        }
      }
    } catch {
      // Corrupted storage — start with an empty cart.
    }
    set({ _hydrated: true });
  },

  scheduleFlush: () => {
    if (flushTimer) return;
    flushTimer = setTimeout(() => {
      flushTimer = null;
      void get().flushSync();
    }, FLUSH_DELAY_MS);
  },

  flushSync: async () => {
    if (flushTimer) {
      clearTimeout(flushTimer);
      flushTimer = null;
    }
    const { items } = get();
    try {
      await SecureStore.setItemAsync(CART_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)));
    } catch {
      // Storage unavailable — cart stays in memory for the session.
    }
    // TODO: cartService sync — push snapshot to POST /api/cart/items once here.
  },
}));

/** Adapts an API `Product` to the cart item shape (backend replacement point). */
export function productToCartItem(
  product: {
    id: string;
    title: string;
    description: string | null;
    images: string[];
    price: number;
    sellerId: string;
    sellerName: string;
    stock: number;
  },
  quantity = 1
): NewCartItem {
  return {
    id: product.id,
    productId: product.id,
    sellerId: product.sellerId,
    sellerName: product.sellerName,
    name: product.title,
    description: product.description ?? undefined,
    image: product.images[0] ?? "",
    price: product.price,
    quantity,
    stock: product.stock,
  };
}
