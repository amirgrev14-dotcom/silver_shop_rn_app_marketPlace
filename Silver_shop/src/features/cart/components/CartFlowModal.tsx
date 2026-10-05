import { Modal, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { CartItem } from "../types/cart.types";
import { CartFullModalBody } from "./CartFullModal";
import { CartPreviewBody } from "./CartPreview";

interface Props {
  visible: boolean;
  /** true = full cart, false = preview. Owned by the parent, no effects here. */
  full: boolean;
  onClose: () => void;
  onCheckout: () => void;
  onViewCart: () => void;
  onItemPress?: (item: CartItem) => void;
  onShowSaved?: () => void;
  onCheckStock?: (productId: string, nextQty: number) => boolean;
  stockById?: Map<string, number>;
}

/**
 * Single native Modal for the whole cart flow (fade only, no slide).
 * Preview ↔ full switches INSTANTLY inside one modal — no stacked
 * modals, so Android never closes/reopens anything mid-transition.
 * Pure render: all state lives in the parent, zero effects here.
 */
export function CartFlowModal({
  visible,
  full,
  onClose,
  onCheckout,
  onViewCart,
  onItemPress,
  onShowSaved,
  onCheckStock,
  stockById,
}: Props): React.JSX.Element {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent={false} animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View className="flex-1 bg-app" style={{ paddingTop: insets.top }}>
        {full ? (
          <CartFullModalBody
            stockById={stockById}
            onClose={onClose}
            onCheckout={onCheckout}
            onContinueShopping={onClose}
            onShowSaved={onShowSaved}
          />
        ) : (
          <CartPreviewBody
            onClose={onClose}
            onViewCart={onViewCart}
            onItemPress={onItemPress}
            onShowSaved={onShowSaved}
            onCheckStock={onCheckStock}
            stockById={stockById}
          />
        )}
      </View>
    </Modal>
  );
}
