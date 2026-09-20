import type { LucideIcon } from "lucide-react-native";
import {
  Pressable,
  type GestureResponderEvent,
} from "react-native";

import { AppIcon } from "./app-icon";

interface HeaderIconButtonProps {
  icon: LucideIcon;
  accessibilityLabel: string;
  onPress?: (event: GestureResponderEvent) => void;
  color?: string;
  fill?: string;
  size?: number;
  className?: string;
}

/** Plain header icon — no circle, no background. All header actions look identical. */
export function HeaderIconButton({
  icon,
  accessibilityLabel,
  onPress,
  color = "primary",
  fill,
  size = 22,
  className,
}: HeaderIconButtonProps): React.JSX.Element {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      hitSlop={8}
      className={`h-10 w-10 items-center justify-center active:opacity-60 ${className ?? ""}`}
    >
      <AppIcon icon={icon} size={size} color={color} fill={fill} />
    </Pressable>
  );
}
