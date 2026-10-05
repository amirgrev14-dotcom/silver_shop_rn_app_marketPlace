import { Minus, Plus } from "lucide-react-native";
import { Pressable, View } from "react-native";

import { AppText } from "@/components/ui/app-text";
import { colors } from "@/components/ui/theme";
import { showToast } from "@/stores/toast-store";

interface QuantityControlProps {
  quantity: number;
  /** instant cap — checked locally, no fetch per tap */
  maxQty?: number;
  onIncrease: () => void;
  onDecrease: () => void;
  size?: number;
}

export function QuantityControl({ quantity, maxQty, onIncrease, onDecrease, size = 28 }: QuantityControlProps): React.JSX.Element {
  return (
    <View className="flex-row items-center gap-1 rounded-full border border-border bg-app p-0.5">
      <Pressable
        onPress={onDecrease}
        className="items-center justify-center rounded-full bg-surface active:opacity-70"
        style={{ width: size, height: size }}
      >
        <Minus size={12} color={colors.textPrimary} />
      </Pressable>
      <AppText className="min-w-6 text-center text-[13px] font-bold leading-none text-text-primary">{quantity}</AppText>
      <Pressable
        onPress={() => {
          if (maxQty !== undefined && quantity >= maxQty) {
            showToast(maxQty > 0 ? `Only ${maxQty} available.` : "Out of stock.", "error");
            return;
          }
          onIncrease();
        }}
        className="items-center justify-center rounded-full bg-primary active:opacity-80"
        style={{ width: size, height: size }}
      >
        <Plus size={12} color="white" />
      </Pressable>
    </View>
  );
}
