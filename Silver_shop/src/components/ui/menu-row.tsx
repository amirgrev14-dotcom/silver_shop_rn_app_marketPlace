import { ChevronRight, type LucideIcon } from "lucide-react-native";
import {Pressable, View} from "react-native";

import { AppText } from "@/components/ui/app-text";
import { AppIcon } from "./app-icon";

interface MenuRowProps {
  icon: LucideIcon;
  title: string;
  onPress?: () => void;
  showDivider?: boolean;
}

/** Settings-style menu row: tinted icon, title, chevron, optional divider. */
export function MenuRow({ icon, title, onPress, showDivider = true }: MenuRowProps): React.JSX.Element {
  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={title}
        onPress={onPress}
        className="flex-row items-center gap-3 px-1 py-3 active:opacity-70"
      >
        <AppIcon icon={icon} size={22} color="secondary" />
        <AppText className="flex-1 text-base font-medium text-text-primary">{title}</AppText>
        <AppIcon icon={ChevronRight} size={20} color="muted" />
      </Pressable>
      {showDivider ? <View className="ml-[34px] h-px bg-border-light" /> : null}
    </View>
  );
}
