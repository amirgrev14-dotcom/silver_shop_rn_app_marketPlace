import { Check } from "lucide-react-native";
import { Modal, Pressable, View } from "react-native";

import { AppButton } from "@/components/ui/app-button";
import { AppIcon } from "@/components/ui/app-icon";
import { AppText } from "@/components/ui/app-text";
import type { Order } from "../types";
import { formatPrice } from "@/features/marketplace/mock-data";

interface PaymentSuccessModalProps {
  visible: boolean;
  order: Order | null;
  onClose: () => void;
}

/**
 * Post-payment celebration — appears only after a PAID order exists.
 * Green check in theme `success`, short order id, paid total.
 */
export function PaymentSuccessModal({
  visible,
  order,
  onClose,
}: PaymentSuccessModalProps): React.JSX.Element {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Dismiss"
        onPress={onClose}
        className="flex-1 items-center justify-center bg-black/40 px-8"
      >
        <Pressable
          onPress={(event) => event.stopPropagation()}
          className="w-full items-center gap-3 rounded-[20px] bg-surface p-6"
        >
          <View className="h-20 w-20 items-center justify-center rounded-full bg-success">
            <AppIcon icon={Check} size={40} color="white" strokeWidth={3} />
          </View>
          <AppText className="text-[20px] font-bold text-text-primary">Payment successful</AppText>
          {order ? (
            <View className="items-center gap-1">
              <AppText className="text-[13px] text-text-secondary">
                {`Order № ${order.id.slice(0, 8).toUpperCase()}`}
              </AppText>
              <AppText className="text-[18px] font-bold text-text-primary">
                {formatPrice(order.total, order.currency)}
              </AppText>
            </View>
          ) : null}
          <AppText className="text-center text-[13px] leading-5 text-text-secondary">
            The seller is preparing your items. You can track the order in your profile.
          </AppText>
          <AppButton onPress={onClose}>Continue shopping</AppButton>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
