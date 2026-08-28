import React from "react";
import { ActivityIndicator, View } from "react-native";

import { colors } from "./theme";

export function ScreenLoader(): React.JSX.Element {
  return (
    <View className="absolute inset-0 z-50 items-center justify-center bg-app/60">
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}