import { CreditCard, X } from "lucide-react-native";
import { Modal, Pressable, View } from "react-native";

import { AppButton } from "@/components/ui/app-button";
import { AppIcon } from "@/components/ui/app-icon";
import { AppText } from "@/components/ui/app-text";
import { CircleIconButton } from "@/components/ui/circle-icon-button";
import type { PaymentIntent } from "../types";
import { formatPrice } from "@/features/marketplace/mock-data";

interface MockPaymentSheetProps {
  visible: boolean;
  intent: PaymentIntent | null;
  processing: boolean;
  onPay: () => void;
  onDecline: () => void;
  onClose: () => void;
}

/**
 * Test card sheet — stands in for Stripe's PaymentSheet.
 * Fixed test card 4242…, real total, three outcomes:
 * Pay → provider.confirm, "Simulate decline" → failed, X → canceled.
 */
export function MockPaymentSheet({
  visible,
  intent,
  processing,
  onPay,
  onDecline,
  onClose,
}: MockPaymentSheetProps): React.JSX.Element {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Dismiss payment"
        onPress={processing ? undefined : onClose}
        className="flex-1 items-center justify-center bg-black/40 px-8"
      >
        <Pressable
          onPress={(event) => event.stopPropagation()}
          className="w-full gap-4 rounded-[20px] bg-surface p-5"
        >
          <View className="flex-row items-center justify-between">
            <AppText className="text-[17px] font-bold text-text-primary">Payment</AppText>
            <CircleIconButton icon={X} accessibilityLabel="Cancel payment" onPress={onClose} />
          </View>

          {/* Test card */}
          <View className="flex-row items-center gap-3 rounded-[14px] border border-border bg-app p-4">
            <View className="h-11 w-11 items-center justify-center rounded-[12px] bg-primary">
              <AppIcon icon={CreditCard} size={22} color="white" />
            </View>
            <View className="flex-1">
              <AppText className="text-[15px] font-bold tracking-[1px] text-text-primary">
                4242 4242 4242 4242
              </AppText>
              <AppText className="mt-0.5 text-[13px] text-text-secondary">
                Test card · no real money
              </AppText>
            </View>
          </View>

          <View className="flex-row items-center justify-between">
            <AppText className="text-[15px] text-text-secondary">Total to pay</AppText>
            <AppText className="text-[20px] font-bold text-text-primary">
              {intent ? formatPrice(intent.amount, intent.currency) : "—"}
            </AppText>
          </View>

          <AppButton loading={processing} onPress={onPay}>
            {`Pay${intent ? ` ${formatPrice(intent.amount, intent.currency)}` : ""}`}
          </AppButton>

          <Pressable
            disabled={processing}
            onPress={onDecline}
            className="items-center py-1 active:opacity-70"
          >
            <AppText className="text-[13px] font-semibold text-error">
              Simulate decline (test errors)
            </AppText>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
