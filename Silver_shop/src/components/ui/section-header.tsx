import {Pressable, View} from "react-native";

import { AppText } from "@/components/ui/app-text";
interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
}

export function SectionHeader({ title, actionLabel, onActionPress }: SectionHeaderProps): React.JSX.Element {
  return (
    <View className="flex-row items-center justify-between">
      <AppText className="text-lg font-bold text-text-primary">{title}</AppText>
      {actionLabel ? (
        <Pressable accessibilityRole="button" onPress={onActionPress} className="active:opacity-70">
          <AppText className="text-sm font-semibold text-primary">{actionLabel}</AppText>
        </Pressable>
      ) : null}
    </View>
  );
}
