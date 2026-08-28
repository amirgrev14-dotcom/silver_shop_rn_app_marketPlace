import { type PropsWithChildren } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";

import { shadows } from "./theme";

type AppCardVariant = "primary" | "ghost";

const variantClasses: Record<AppCardVariant, string> = {
  primary: "border-border-light bg-surface",
  ghost: "bg-transparent border-transparent",
};

type AppCardProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  variant?: AppCardVariant;
  className?: string;
}>;

export function AppCard({
  children,
  style,
  className,
  variant = "primary",
}: AppCardProps): React.JSX.Element {
  return (
    <View
      style={variant === "primary" ? [shadows.card, style] : style}
      className={`rounded-[20px] border  p-4 ${className ?? ""}  ${variantClasses[variant]}`}
    >
      {children}
    </View>
  );
}
