import type { LucideIcon } from "lucide-react-native";
import {
  LayoutGrid,
  MessageCircle,
  Package,
  ReceiptText,
  Store,
  User,
} from "lucide-react-native";

export type MarketplaceMode = "buyer" | "seller";

export type BuyerTabId = "home" | "categories" | "orders" | "profile";
export type SellerTabId = "home" | "orders" | "messages" | "profile";
/** `sell` is opened via the center button (not a bar tab) in both modes. */
export type MarketTabId = BuyerTabId | SellerTabId | "sell";

export interface MarketTab {
  id: MarketTabId;
  label: string;
  icon: LucideIcon;
}

export const BUYER_TABS: MarketTab[] = [
  { id: "home", label: "Home", icon: Store },
  { id: "categories", label: "Categories", icon: LayoutGrid },
  { id: "orders", label: "Orders", icon: ReceiptText },
  { id: "profile", label: "Profile", icon: User },
];

export const SELLER_TABS: MarketTab[] = [
  { id: "home", label: "Home", icon: Store },
  { id: "orders", label: "Orders", icon: Package },
  { id: "messages", label: "Messages", icon: MessageCircle },
  { id: "profile", label: "Profile", icon: User },
];

export function tabsForMode(mode: MarketplaceMode): MarketTab[] {
  return mode === "seller" ? SELLER_TABS : BUYER_TABS;
}
