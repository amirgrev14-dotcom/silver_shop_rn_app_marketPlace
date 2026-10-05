import { Modal, Pressable, View } from "react-native";

import { AppText } from "./app-text";

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Custom centered confirm dialog (fade) — destructive action guard. */
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = "Remove",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmDialogProps): React.JSX.Element {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Dismiss"
        onPress={onCancel}
        className="flex-1 items-center justify-center bg-black/40 px-8"
      >
        <Pressable
          onPress={(event) => event.stopPropagation()}
          className="w-full gap-2 rounded-[20px] bg-surface p-5"
        >
          <AppText className="text-[17px] font-bold text-text-primary">{title}</AppText>
          {message ? (
            <AppText className="text-[14px] leading-5 text-text-secondary">{message}</AppText>
          ) : null}
          <View className="mt-3 flex-row gap-2.5">
            <Pressable
              accessibilityRole="button"
              onPress={onCancel}
              className="h-[48px] flex-1 items-center justify-center rounded-[14px] border border-border bg-surface active:opacity-70"
            >
              <AppText className="text-[15px] font-semibold text-text-primary">{cancelLabel}</AppText>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={onConfirm}
              className="h-[48px] flex-1 items-center justify-center rounded-[14px] bg-error active:opacity-80"
            >
              <AppText className="text-[15px] font-semibold text-white">{confirmLabel}</AppText>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
