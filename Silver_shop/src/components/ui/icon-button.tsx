import { Feather } from "@expo/vector-icons";
import { type ComponentProps } from "react";
import {
  Pressable,
  type GestureResponderEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { colors } from "./theme";

type FeatherIconName = ComponentProps<typeof Feather>["name"];

interface IconButtonProps {
  icon?: FeatherIconName;
  customIcon?: React.JSX.Element;
  accessibilityLabel: string;
  onPress?: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  active?: boolean;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

export function IconButton({
  icon,
  accessibilityLabel,
  onPress,
  disabled = false,
  active = false,
  style,
  customIcon,
  className,
}: IconButtonProps): React.JSX.Element {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={style}
      className={`h-10 w-10 items-center justify-center rounded-full border border-border-light ${
        active ? "bg-primary-light" : "bg-surface"
      } ${disabled ? "opacity-40" : ""} ${className ?? ""}`}
    >
      {/* {!customIcon && <Feather color={active ? colors.primary : colors.textSecondary} name={icon} size={19} />} */}
      {customIcon ?? (
        <Feather
          color={active ? colors.primary : colors.textSecondary}
          name={icon}
          size={19}
        />
      )}
    </Pressable>
  );
}
