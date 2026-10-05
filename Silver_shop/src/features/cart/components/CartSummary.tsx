import { View } from "react-native";

import { AppText } from "@/components/ui/app-text";
import { shadows } from "@/components/ui/theme";
import { formatPrice } from "@/features/marketplace/mock-data";

interface Props {
  subtotal: number;
  shipping: number;
  total: number;
  itemCount: number;
}

export function CartSummary({ subtotal, shipping, total, itemCount }: Props): React.JSX.Element {
  return (
    <View style={shadows.card} className="gap-2.5 rounded-[16px] border border-border bg-surface p-4">
      <View className="flex-row justify-between">
        <AppText className="text-[13px] text-text-secondary">Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})</AppText>
        <AppText className="text-[13px] font-semibold text-text-primary">{formatPrice(subtotal)}</AppText>
      </View>
      <View className="flex-row justify-between">
        <AppText className="text-[13px] text-text-secondary">Shipping (estimated)</AppText>
        <AppText className="text-[13px] font-semibold text-text-primary">{formatPrice(shipping)}</AppText>
      </View>
      <View className="h-px bg-border-light" />
      <View className="flex-row items-center justify-between">
        <AppText className="text-[15px] font-bold text-text-primary">Total</AppText>
        <AppText className="text-[16px] font-bold text-primary">{formatPrice(total)}</AppText>
      </View>
    </View>
  );
}
