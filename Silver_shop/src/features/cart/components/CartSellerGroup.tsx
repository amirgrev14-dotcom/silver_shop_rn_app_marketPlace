import { Image } from "expo-image";
import { View } from "react-native";

import { AppText } from "@/components/ui/app-text";
import { shadows } from "@/components/ui/theme";
import type { CartItem, CartSellerGroup as Group } from "../types/cart.types";
import { CartItemRow } from "./CartItemRow";

interface Props {
  group: Group;
  onIncrease: (item: CartItem) => void;
  onDecrease: (item: CartItem) => void;
  onRemove: (item: CartItem) => void;
  onItemPress?: (item: CartItem) => void;
  /** instant max qty per product (cached stock / Infinity) */
  maxById?: Map<string, number>;
}

export function CartSellerGroup({ group, onIncrease, onDecrease, onRemove, onItemPress, maxById }: Props): React.JSX.Element {
  return (
    <View style={shadows.card} className="gap-2.5 rounded-[16px] border border-border bg-surface p-3">
      {/* Seller header */}
      <View className="flex-row items-center gap-2">
        <View className="h-7 w-7 items-center justify-center rounded-full bg-primary-light overflow-hidden">
          {group.sellerAvatar ? (
            <Image source={{ uri: group.sellerAvatar }} style={{ width: 28, height: 28 }} contentFit="cover" />
          ) : (
            <AppText className="text-[11px] font-bold text-primary">
              {group.sellerName.slice(0, 1).toUpperCase()}
            </AppText>
          )}
        </View>
        <View className="flex-1">
          <AppText className="text-[12px] font-semibold text-text-primary">{group.sellerName}</AppText>
        </View>
        <View className="rounded-full bg-app px-2 py-0.5">
          <AppText className="text-[11px] font-semibold text-text-secondary">
            {group.itemCount} {group.itemCount === 1 ? "item" : "items"}
          </AppText>
        </View>
      </View>

      <View className="gap-2">
        {group.items.map((item) => (
          <CartItemRow
            key={item.id}
            item={item}
            maxQty={maxById?.get(item.productId)}
            onIncrease={() => onIncrease(item)}
            onDecrease={() => onDecrease(item)}
            onRemove={() => onRemove(item)}
            onPress={onItemPress ? () => onItemPress(item) : undefined}
          />
        ))}
      </View>
    </View>
  );
}
