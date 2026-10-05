import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppButton } from "@/components/ui/app-button";
import { AppText } from "@/components/ui/app-text";
import { CircleIconButton } from "@/components/ui/circle-icon-button";
import { ScreenHeader } from "@/components/ui/screen-header";
import { CartSummary } from "@/features/cart/components/CartSummary";
import { EmptyCart } from "@/features/cart/components/EmptyCart";
import { MockPaymentSheet } from "@/features/payments/components/MockPaymentSheet";
import { PaymentSuccessModal } from "@/features/payments/components/PaymentSuccessModal";
import { useCheckout } from "@/features/payments/hooks/use-checkout";
import { useCartStore } from "@/features/cart/store/cart-store";
import { getTotalItems } from "@/features/cart/utils/cart-utils";
import { formatPrice } from "@/features/marketplace/mock-data";
import { DEFAULT_CURRENCY } from "@/features/marketplace/currency";

/**
 * Checkout — Cart → paywall. No payment = no order:
 * the Pay button is the only way forward, and the success modal
 * appears only after a PAID order exists on the backend.
 */
export default function CheckoutRoute(): React.JSX.Element {
  const checkout = useCheckout();
  const items = useCartStore((s) => s.items);
  const busy = checkout.phase === "processing";
  const sheetOpen = checkout.phase === "sheet" || checkout.phase === "processing";

  const goBack = () => router.back();

  const handleSuccessClose = () => {
    checkout.reset();
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-app" edges={["top"]}>
      <ScreenHeader
        title="Checkout"
        titleAlign="left"
        accentFirstLetter
        className="bg-surface px-5 pb-3 pt-4"
        left={<CircleIconButton icon={ArrowLeft} accessibilityLabel="Back" onPress={goBack} tone="accent" />}
      />

      {items.length === 0 && checkout.phase !== "success" ? (
        <EmptyCart onClose={goBack} />
      ) : (
        <>
          <ScrollView
            contentContainerClassName="gap-4 px-5 pb-6 pt-4"
            showsVerticalScrollIndicator={false}
          >
            <CartSummary
              subtotal={checkout.totals.subtotal}
              shipping={checkout.totals.shipping}
              total={checkout.totals.total}
              itemCount={getTotalItems(items)}
            />

            <AppText className="text-[13px] leading-5 text-text-secondary">
              {`Test mode — card 4242 4242 4242 4242, no real money moves. The order is created only after a successful payment.`}
            </AppText>

            {checkout.phase === "error" && checkout.error ? (
              <View className="gap-2 rounded-[14px] border border-error bg-surface p-4">
                <AppText className="text-[14px] font-semibold text-error">
                  {checkout.error}
                </AppText>
                <Pressable onPress={() => void checkout.startCheckout()} className="self-start active:opacity-70">
                  <AppText className="text-[14px] font-bold text-primary">Try again</AppText>
                </Pressable>
              </View>
            ) : null}
          </ScrollView>

          <View className="gap-3 border-t border-border bg-surface px-5 pb-6 pt-4">
            <AppButton
              loading={busy}
              disabled={items.length === 0}
              onPress={() => void checkout.startCheckout()}
            >
              {`Pay ${formatPrice(checkout.totals.total, DEFAULT_CURRENCY)}`}
            </AppButton>
            <Pressable onPress={goBack} className="items-center py-1 active:opacity-70">
              <AppText className="text-[13px] font-semibold text-text-secondary">
                Back to cart
              </AppText>
            </Pressable>
          </View>
        </>
      )}

      <MockPaymentSheet
        visible={sheetOpen && checkout.intent !== null}
        intent={checkout.intent}
        processing={busy}
        onPay={() => void checkout.confirmPayment()}
        onDecline={checkout.declinePayment}
        onClose={checkout.closeSheet}
      />

      <PaymentSuccessModal
        visible={checkout.phase === "success"}
        order={checkout.order}
        onClose={handleSuccessClose}
      />
    </SafeAreaView>
  );
}
