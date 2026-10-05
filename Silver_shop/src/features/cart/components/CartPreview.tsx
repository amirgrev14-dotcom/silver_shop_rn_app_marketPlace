import { ArrowLeft, Heart, Trash2 } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import Animated, { FadeInUp, FadeOut, LinearTransition } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppButton } from "@/components/ui/app-button";
import { AppText } from "@/components/ui/app-text";
import { CircleIconButton } from "@/components/ui/circle-icon-button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EdgeFade } from "@/components/ui/edge-fade";
import { LoadingImage } from "@/components/ui/loading-image";
import { ScreenHeader } from "@/components/ui/screen-header";
import { shadows, colors } from "@/components/ui/theme";
import { EmptyCartArt } from "./EmptyCart";
import { formatPrice } from "@/features/marketplace/mock-data";
import { showToast } from "@/stores/toast-store";
import { useCartStore } from "../store/cart-store";
import type { CartItem } from "../types/cart.types";
import { getItemsGroupedBySeller, getSubtotal, getTotalItems } from "../utils/cart-utils";

interface BodyProps {
  onClose: () => void;
  onViewCart: () => void;
  onItemPress?: (item: CartItem) => void;
  /** Header heart → saved items (handy when the cart is empty). */
  onShowSaved?: () => void;
  /** Instant stock check for the + button (no server call per tap). */
  onCheckStock?: (productId: string, nextQty: number) => boolean;
  /** Instant stock caps — plus disables at the limit. */
  stockById?: Map<string, number>;
}

/** Preview content WITHOUT Modal wrapper — rendered inside CartFlowModal. */
export function CartPreviewBody({ onClose, onViewCart, onItemPress, onShowSaved, onCheckStock, stockById }: BodyProps): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const items = useCartStore((s) => s.items);
  const groups = useMemo(() => getItemsGroupedBySeller(items), [items]);
  const totalItems = useMemo(() => getTotalItems(items), [items]);
  const subtotal = useMemo(() => getSubtotal(items), [items]);
  const increase = useCartStore((s) => s.increaseQuantity);
  const decrease = useCartStore((s) => s.decreaseQuantity);
  const remove = useCartStore((s) => s.removeItem);

  return (
    <View className="flex-1 bg-app">
      <ScreenHeader
        title={`Cart (${totalItems})`}
        titleAlign="left"
        accentFirstLetter
        className="bg-surface px-5 pb-3 pt-4"
        left={<CircleIconButton icon={ArrowLeft} accessibilityLabel="Go back" onPress={onClose} tone="accent" />}
      />

      <View className="relative flex-1">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="gap-4 px-5 pb-4 pt-10">
        {groups.length === 0 ? (
          <View className="items-center gap-3 px-8 py-10">
            <EmptyCartArt size={104} />
            <AppText className="text-[16px] font-bold text-text-primary">Your cart is empty</AppText>
            <AppText className="max-w-[260px] text-center text-[13px] leading-5 text-text-secondary">
              There are no items here yet.
            </AppText>
          </View>
        ) : (
          groups.map((group) => (
            <View key={group.sellerId} className="gap-2">
              <AppText className="text-[11px] font-bold tracking-[0.6px] text-text-secondary">
                {group.sellerName}
              </AppText>
              {group.items.map((item) => (
                <PreviewCartRow
                  key={item.id}
                  item={item}
                  maxQty={stockById?.get(item.productId) ?? item.stock}
                  onPress={() => onItemPress?.(item)}
                  onDecrease={() => decrease(item.id)}
                  onIncrease={() => {
                    if (onCheckStock && !onCheckStock(item.productId, item.quantity + 1)) return;
                    increase(item.id);
                  }}
                  onRemove={() => remove(item.id)}
                />
              ))}
            </View>
          ))
        )}
      </ScrollView>
      <EdgeFade />
      </View>

      {groups.length > 0 ? (
        <View
          className="gap-3 border-t border-border bg-surface px-5 pt-4"
          style={{ paddingBottom: insets.bottom + 16 }}
        >
          <View className="flex-row justify-between">
            <AppText className="text-[13px] text-text-secondary">Total ({totalItems} items)</AppText>
            <AppText className="text-[15px] font-bold text-text-primary">{formatPrice(subtotal)}</AppText>
          </View>
          <AppButton onPress={onViewCart}>View Cart</AppButton>
          <Pressable onPress={onClose} className="items-center py-1 active:opacity-70">
            <AppText className="text-[13px] font-semibold text-text-secondary">Continue shopping</AppText>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

interface RowProps {
  item: CartItem;
  /** Instant stock cap — plus disables (not toast-spam) at the limit. */
  maxQty?: number;
  onPress: () => void;
  onDecrease: () => void;
  onIncrease: () => void;
  onRemove: () => void;
}

/**
 * One compact row: photo + name/price on the left, stepper + trash on the right.
 * Trash and minus-at-1 ask for confirm; removal slides out.
 */
function PreviewCartRow({ item, maxQty, onPress, onDecrease, onIncrease, onRemove }: RowProps): React.JSX.Element {
  const [confirmVisible, setConfirmVisible] = useState(false);
  const atCap = maxQty !== undefined && item.quantity >= maxQty;

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
        className="flex-row items-center gap-3 rounded-[14px] border border-border bg-surface p-2.5 active:opacity-70"
      >
        <LoadingImage source={{ uri: item.image }} style={{ width: 56, height: 56, borderRadius: 10 }} />

        <View className="flex-1 gap-0.5">
          <AppText numberOfLines={1} ellipsizeMode="tail" className="text-[13px] font-semibold text-text-primary">
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
          <View className="flex-row items-center gap-1 rounded-full border border-border bg-app p-0.5">
            <Pressable
              onPress={stopThen(handleDecrease)}
              className="h-6 w-6 items-center justify-center rounded-full bg-surface active:opacity-70"
            >
              <AppText className="text-[12px] font-bold leading-none text-text-primary">−</AppText>
            </Pressable>
            <AppText className="min-w-6 text-center text-[12px] font-bold leading-none text-text-primary">
              {item.quantity}
            </AppText>
            <Pressable
              onPress={stopThen(onIncrease)}
              disabled={atCap}
              className={`h-6 w-6 items-center justify-center rounded-full active:opacity-80 ${
                atCap ? "bg-border opacity-60" : "bg-primary"
              }`}
            >
              <AppText className={`text-[12px] font-bold leading-none ${atCap ? "text-text-secondary" : "text-white"}`}>
                +
              </AppText>
            </Pressable>
          </View>
          <Pressable
            onPress={stopThen(() => setConfirmVisible(true))}
            hitSlop={8}
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
