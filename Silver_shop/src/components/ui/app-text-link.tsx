import React from "react";
import {Pressable, View} from "react-native";

import { AppText } from "@/components/ui/app-text";
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
        <AppText className={`text-gray-500 ${labelClassName ?? ""}`}>{label}</AppText>
      )}

      <Pressable
        accessibilityRole="link"
        hitSlop={8}
        onPress={onPress}
        className="py-1 active:opacity-60"
      >
        <AppText className={`font-semibold text-primary ${linkClassName ?? ""}`}>
          {linkLabel}
        </AppText>
      </Pressable>
    </View>
  );
}
