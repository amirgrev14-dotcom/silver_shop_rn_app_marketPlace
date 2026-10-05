import * as SecureStore from 'expo-secure-store';

const CART_KEY = 'marketplace.cart.v1';

export interface CartLine {
  id: string;
  qty: number;
}

/** Local cart (phase 1): product ids + quantities, persisted on device. */
export const cartStorage = {
  async load(): Promise<CartLine[]> {
    try {
      const raw = await SecureStore.getItemAsync(CART_KEY);
      if (!raw) return [];
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter(
          (l): l is CartLine =>
            typeof l === 'object' &&
            l !== null &&
            typeof (l as CartLine).id === 'string' &&
            Number.isInteger((l as CartLine).qty) &&
            (l as CartLine).qty > 0
        )
        .slice(0, 100);
    } catch {
      return [];
    }
  },

  async save(lines: CartLine[]): Promise<void> {
    try {
      await SecureStore.setItemAsync(CART_KEY, JSON.stringify(lines.slice(0, 100)));
    } catch {
      // Storage unavailable — cart stays in memory for the session.
    }
  },
};

export function cartCount(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.qty, 0);
}
