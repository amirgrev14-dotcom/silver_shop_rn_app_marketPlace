import { Truck } from "lucide-react-native";
import { View } from "react-native";

import { AppText } from "@/components/ui/app-text";
import { colors } from "@/components/ui/theme";

export function MultiSellerNotice(): React.JSX.Element {
  return (
    <View className="flex-row items-center gap-2.5 rounded-[12px] bg-primary-light px-3.5 py-3">
      <View className="h-8 w-8 items-center justify-center rounded-full bg-surface">
        <Truck size={16} color={colors.primary} />
      </View>
      <AppText className="flex-1 text-[12px] font-medium leading-4 text-primary">
        Items from different sellers will be shipped separately.
      </AppText>
    </View>
  );
}
