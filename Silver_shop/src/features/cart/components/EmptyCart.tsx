import { ShoppingBag } from "lucide-react-native";
import { View } from "react-native";

import { AppButton } from "@/components/ui/app-button";
import { AppText } from "@/components/ui/app-text";
import { colors } from "@/components/ui/theme";

interface Props {
  onClose: () => void;
}

/** Empty-cart illustration: layered circles with a bag icon (no binary assets). */
export function EmptyCartArt({ size = 120 }: { size?: number }): React.JSX.Element {
  const inner = Math.round(size * 0.78);
  return (
    <View
      style={{ width: size, height: size }}
      className="items-center justify-center rounded-full bg-surface"
    >
      <View
        style={{ width: inner, height: inner }}
        className="items-center justify-center rounded-full bg-primary-light"
      >
        <ShoppingBag size={Math.round(size * 0.28)} color={colors.primary} />
      </View>
    </View>
  );
}

export function EmptyCart({ onClose }: Props): React.JSX.Element {
  return (
    <View className="flex-1 items-center justify-center gap-4 px-8 py-16">
      <EmptyCartArt />
      <AppText className="text-[18px] font-bold text-text-primary">Your cart is empty</AppText>
      <AppText className="max-w-[280px] text-center text-[14px] leading-5 text-text-secondary">
        There are no items here yet. When you add silver pieces, they will appear in this list.
      </AppText>
      <AppButton variant="secondary" onPress={onClose} className="mt-2 px-10">
        Close
      </AppButton>
    </View>
  );
}
