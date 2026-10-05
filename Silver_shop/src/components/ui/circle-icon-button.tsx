import type { LucideIcon } from "lucide-react-native";
import { Pressable, type GestureResponderEvent } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

import { AppIcon } from "./app-icon";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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

/** Round icon button with spring press animation (hover-like feedback). */
export function CircleIconButton({
  icon,
  accessibilityLabel,
  onPress,
  tone = "neutral",
  iconColor = tone === "accent" ? "primary" : "secondary",
  bordered = tone === "neutral",
  className,
}: CircleIconButtonProps): React.JSX.Element {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.86, { damping: 14, stiffness: 500 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 14, stiffness: 500 });
      }}
      style={animatedStyle}
      className={`h-10 w-10 items-center justify-center rounded-full active:opacity-70 ${
        tone === "accent" ? "bg-primary-light" : "bg-surface"
      } ${bordered ? "border border-border" : ""} ${className ?? ""}`}
    >
      <AppIcon icon={icon} size={20} color={iconColor} />
    </AnimatedPressable>
  );
}
