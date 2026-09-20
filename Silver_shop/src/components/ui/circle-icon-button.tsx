import type { LucideIcon } from "lucide-react-native";
import {
  Pressable,
  type GestureResponderEvent,
} from "react-native";

import { AppIcon } from "./app-icon";

interface CircleIconButtonProps {
  icon: LucideIcon;
  accessibilityLabel: string;
  onPress?: (event: GestureResponderEvent) => void;
  iconColor?: string;
  bordered?: boolean;
  /** neutral = white button; accent = light-purple button that draws the eye. */
  tone?: "neutral" | "accent";
  className?: string;
}

/** Round icon button used for header actions and image overlays. */
export function CircleIconButton({
  icon,
  accessibilityLabel,
  onPress,
  tone = "neutral",
  iconColor = tone === "accent" ? "primary" : "secondary",
  bordered = tone === "neutral",
  className,
}: CircleIconButtonProps): React.JSX.Element {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      className={`h-10 w-10 items-center justify-center rounded-full active:scale-90 active:opacity-70 ${
        tone === "accent" ? "bg-primary-light" : "bg-white"
      } ${bordered ? "border border-border" : ""} ${className ?? ""}`}
    >
      <AppIcon icon={icon} size={20} color={iconColor} />
    </Pressable>
  );
}
