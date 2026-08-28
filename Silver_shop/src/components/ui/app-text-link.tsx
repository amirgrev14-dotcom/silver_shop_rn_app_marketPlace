import React from "react";
import { Pressable, Text, View } from "react-native";

interface Props {
  onPress?: () => void;
  className?: string;
  labelClassName?: string;
  linkClassName?: string;
  linkLabel: string;
  label?: string;
}

export function AppTextLink({
  label,
  linkLabel,
  onPress,
  className,
  linkClassName,
  labelClassName,
}: Props): React.JSX.Element {
  return (
    <View className={`flex-row items-center gap-2 ${className ?? ""}`}>
      {label && (
        <Text className={`text-gray-500 ${labelClassName ?? ""}`}>{label}</Text>
      )}

      <Pressable
        accessibilityRole="link"
        hitSlop={8}
        onPress={onPress}
        className="py-1 active:opacity-60"
      >
        <Text className={`font-semibold text-primary ${linkClassName ?? ""}`}>
          {linkLabel}
        </Text>
      </Pressable>
    </View>
  );
}
