import type { CartItem, CartSellerGroup } from "../types/cart.types";

/** Sum of price × quantity over all lines. */
export function getSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

/** Total unit count (badge number). */
export function getTotalItems(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function getItemsGroupedBySeller(items: CartItem[]): CartSellerGroup[] {
  const map = new Map<string, CartSellerGroup>();
  for (const item of items) {
    const existing = map.get(item.sellerId);
    if (existing) {
      existing.items.push(item);
      existing.itemCount += item.quantity;
      existing.subtotal += item.price * item.quantity;
    } else {
      map.set(item.sellerId, {
        sellerId: item.sellerId,
        sellerName: item.sellerName,
        sellerAvatar: item.sellerAvatar,
        items: [item],
        itemCount: item.quantity,
        subtotal: item.price * item.quantity,
      });
    }
  }
  return Array.from(map.values());
}

/** Isolated shipping calc — replace with backend later. */
export function getEstimatedShipping(items: CartItem[]): number {
  if (items.length === 0) return 0;
  // Flat $5 for now, matches reference total $104 + $5 = $109.
  return 5;
}

export function getTotalWithShipping(items: CartItem[]): number {
  return getSubtotal(items) + getEstimatedShipping(items);
}
