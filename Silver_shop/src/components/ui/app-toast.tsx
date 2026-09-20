import { CircleAlert, CircleCheck, Info } from "lucide-react-native";
import Animated, { FadeInUp, FadeOutDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppIcon } from "./app-icon";
import { AppText } from "./app-text";
import { useToastStore, type ToastTone } from "@/stores/toast-store";

const TONE_STYLES: Record<ToastTone, { bar: string; icon: typeof Info }> = {
  success: { bar: "bg-success", icon: CircleCheck },
  error: { bar: "bg-error", icon: CircleAlert },
  info: { bar: "bg-primary", icon: Info },
};

/**
 * Global toast overlay. Mount once near the root —
 * any screen fires it via showToast(message, tone).
 */
export function AppToast(): React.JSX.Element | null {
  const insets = useSafeAreaInsets();
  const { id, message, tone, visible } = useToastStore();

  if (!visible) return null;
  const style = TONE_STYLES[tone];

  return (
    <Animated.View
      key={id}
      entering={FadeInUp.duration(220)}
      exiting={FadeOutDown.duration(200)}
      pointerEvents="none"
      style={{ bottom: insets.bottom + 96 }}
      className="absolute left-5 right-5"
    >
      <Animated.View className="flex-row items-center gap-3 rounded-[16px] bg-text-primary p-4 shadow-lg">
        <AppIcon icon={style.icon} size={22} color="white" />
        <AppText className="flex-1 text-sm font-medium leading-5 text-white">
          {message}
        </AppText>
        <Animated.View className={`h-8 w-1.5 rounded-full ${style.bar}`} />
      </Animated.View>
    </Animated.View>
  );
}
