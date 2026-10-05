import { Trash2 } from "lucide-react-native";
import { useState } from "react";
import { Pressable, View } from "react-native";
import Animated, { FadeInUp, FadeOut, LinearTransition } from "react-native-reanimated";

import { AppText } from "@/components/ui/app-text";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { LoadingImage } from "@/components/ui/loading-image";
import { shadows, colors } from "@/components/ui/theme";
import { formatPrice } from "@/features/marketplace/mock-data";
import { showToast } from "@/stores/toast-store";
import type { CartItem } from "../types/cart.types";
import { QuantityControl } from "./QuantityControl";

interface CartItemRowProps {
  item: CartItem;
  /** instant stock cap — falls back to Infinity (no per-tap fetch) */
  maxQty?: number;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
  onPress?: () => void;
}

/**
 * Full-cart row. Trash and minus-at-1 ask for confirm first;
 * confirmed removal slides the row out.
 */
export function CartItemRow({ item, maxQty, onIncrease, onDecrease, onRemove, onPress }: CartItemRowProps): React.JSX.Element {
  const [confirmVisible, setConfirmVisible] = useState(false);

  const stopThen = (fn: () => void) => (event: { stopPropagation: () => void }) => {
    event.stopPropagation();
    fn();
  };

  const handleDecrease = () => {
    if (item.quantity <= 1) {
      setConfirmVisible(true);
      return;
    }
    onDecrease();
  };

  const handleConfirmRemove = () => {
    setConfirmVisible(false);
    onRemove();
    showToast(`Removed "${item.name}" from the cart.`, "info");
  };

  return (
    <Animated.View
      entering={FadeInUp.duration(200)}
      exiting={FadeOut.duration(350)}
      layout={LinearTransition.duration(300)}
      style={shadows.card}
    >
      <Pressable
        onPress={onPress}
        className="flex-row items-center gap-3 rounded-[14px] border border-border bg-surface p-2.5 active:opacity-80"
      >
        <LoadingImage source={{ uri: item.image }} style={{ width: 64, height: 64, borderRadius: 10 }} />
        <View className="flex-1 gap-0.5">
          <AppText numberOfLines={1} ellipsizeMode="tail" className="text-[13px] font-semibold leading-4 text-text-primary">
            {item.name}
          </AppText>
          {item.description ? (
            <AppText numberOfLines={1} ellipsizeMode="tail" className="text-[11px] leading-4 text-text-secondary">
              {item.description}
            </AppText>
          ) : null}
          <AppText className="text-[13px] font-bold text-text-primary">{formatPrice(item.price)}</AppText>
        </View>
        <View className="flex-row items-center gap-2">
          <QuantityControl
            quantity={item.quantity}
            maxQty={maxQty}
            onIncrease={onIncrease}
            onDecrease={handleDecrease}
          />
          <Pressable
            hitSlop={8}
            onPress={stopThen(() => setConfirmVisible(true))}
            className="h-9 w-9 items-center justify-center rounded-full bg-app active:opacity-70 active:scale-90"
          >
            <Trash2 size={18} color={colors.textSecondary} />
          </Pressable>
        </View>
      </Pressable>

      <ConfirmDialog
        visible={confirmVisible}
        title="Remove item?"
        message={`Are you sure you want to remove "${item.name}" from the cart?`}
        onCancel={() => setConfirmVisible(false)}
        onConfirm={handleConfirmRemove}
      />
    </Animated.View>
  );
}
