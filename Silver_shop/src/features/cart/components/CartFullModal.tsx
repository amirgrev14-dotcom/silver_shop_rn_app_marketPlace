import { ArrowLeft, Heart } from "lucide-react-native";
import { Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppButton } from "@/components/ui/app-button";
import { AppText } from "@/components/ui/app-text";
import { CircleIconButton } from "@/components/ui/circle-icon-button";
import { EdgeFade } from "@/components/ui/edge-fade";
import { ScreenHeader } from "@/components/ui/screen-header";
import { formatPrice } from "@/features/marketplace/mock-data";
import { useCartStore } from "../store/cart-store";
import { getEstimatedShipping, getItemsGroupedBySeller, getSubtotal, getTotalItems } from "../utils/cart-utils";
import { CartSellerGroup } from "./CartSellerGroup";
import { CartSummary } from "./CartSummary";
import { EmptyCart } from "./EmptyCart";
import { MultiSellerNotice } from "./MultiSellerNotice";

interface BodyProps {
  onClose: () => void;
  onCheckout: () => void;
  onContinueShopping: () => void;
  /** Header heart → saved items (handy when the cart is empty). */
  onShowSaved?: () => void;
  /** instant stock snapshot — no fetch per tap */
  stockById?: Map<string, number>;
}

/** Full-cart content WITHOUT Modal wrapper — rendered inside CartFlowModal. */
export function CartFullModalBody({ onClose, onCheckout, onContinueShopping, onShowSaved, stockById }: BodyProps): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const items = useCartStore((s) => s.items);
  const groups = getItemsGroupedBySeller(items);
  const subtotal = getSubtotal(items);
  const shipping = getEstimatedShipping(items);
  const total = subtotal + shipping;
  const totalItems = getTotalItems(items);
  const increase = useCartStore((s) => s.increaseQuantity);
  const decrease = useCartStore((s) => s.decreaseQuantity);
  const remove = useCartStore((s) => s.removeItem);
  // Fresh server snapshot wins; line-level stock (saved at add time) is the fallback.
  const capById = new Map<string, number>();
  for (const line of items) {
    const cap = stockById?.get(line.productId) ?? line.stock;
    if (cap !== undefined) capById.set(line.productId, cap);
  }

  return (
    <View className="flex-1 bg-app">
      <ScreenHeader
        title={`Cart (${totalItems})`}
        titleAlign="left"
        accentFirstLetter
        className="bg-surface px-5 pb-3 pt-4"
        left={<CircleIconButton icon={ArrowLeft} accessibilityLabel="Go back" onPress={onClose} tone="accent" />}
      />

        {items.length === 0 ? (
          <EmptyCart onClose={onContinueShopping} />
        ) : (
          <>
            <View className="relative flex-1">
            <ScrollView contentContainerClassName="gap-3 px-5 pb-6 pt-10" showsVerticalScrollIndicator={false}>
              {groups.map((group) => (
                <CartSellerGroup
                  key={group.sellerId}
                  group={group}
                  maxById={capById}
                  onIncrease={(item) => increase(item.id)}
                  onDecrease={(item) => decrease(item.id)}
                  onRemove={(item) => remove(item.id)}
                />
              ))}
              <CartSummary subtotal={subtotal} shipping={shipping} total={total} itemCount={totalItems} />
              {groups.length > 1 ? <MultiSellerNotice /> : null}
            </ScrollView>
            <EdgeFade />
            </View>
            <View
              style={{ paddingBottom: insets.bottom + 16 }}
              className="gap-3 border-t border-border bg-surface px-5 pt-4"
            >
              <AppButton onPress={onCheckout}>Proceed to Checkout</AppButton>
              <Pressable
                onPress={onContinueShopping}
                className="h-[52px] items-center justify-center rounded-[14px] border border-border bg-surface active:opacity-70"
              >
                <AppText className="text-[15px] font-semibold text-text-primary">← Continue Shopping</AppText>
              </Pressable>
            </View>
          </>
        )}
    </View>
  );
}
