import type { LucideIcon, LucideProps } from "lucide-react-native";
import React from "react";

import { View } from "react-native";
import { colors } from "./theme";

type ThemeIconColor =
  | "primary"
  | "secondary"
  | "muted"
  | "success"
  | "error"
  | "warning";

type AppIconProps = Omit<LucideProps, "color" | "size" | "strokeWidth"> & {
  icon: LucideIcon;
  size?: number;
  color?: ThemeIconColor | string;
  strokeWidth?: number;
  className?: string;
};

const themeColors: Record<ThemeIconColor, string> = {
  primary: colors.primary,
  secondary: colors.textSecondary,
  muted: colors.textMuted,
  success: colors.success,
  error: colors.error,
  warning: colors.warning,
};

export function AppIcon({
  icon: IconComponent,
  size = 24,
  color = "primary",
  strokeWidth = 2,
  ...props
}: AppIconProps): React.JSX.Element {
  const resolvedColor =
    color in themeColors ? themeColors[color as ThemeIconColor] : color;

  return (
    <View className={`${props.className ?? ""}`}>
      <IconComponent
        {...props}
        size={size}
        color={resolvedColor}
        strokeWidth={strokeWidth}
      />
    </View>
  );
}
