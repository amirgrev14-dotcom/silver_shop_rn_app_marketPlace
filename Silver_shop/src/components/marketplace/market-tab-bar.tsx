import { Plus } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppIcon } from "@/components/ui/app-icon";
import type { MarketTab, MarketTabId } from "@/features/marketplace/types";

interface MarketTabBarProps {
  /** Exactly 4 tabs — the Sell button is rendered in the middle. */
  tabs: MarketTab[];
  activeTab: MarketTabId;
  isSellActive: boolean;
  onTabPress: (tab: MarketTabId) => void;
  onSellPress: () => void;
}

export function MarketTabBar({
  tabs,
  activeTab,
  isSellActive,
  onTabPress,
  onSellPress,
}: MarketTabBarProps): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const left = tabs.slice(0, 2);
  const right = tabs.slice(2, 4);

  const renderTab = (tab: MarketTab) => {
    const isActive = tab.id === activeTab;
    return (
      <Pressable
        key={tab.id}
        accessibilityRole="tab"
        accessibilityState={{ selected: isActive }}
        accessibilityLabel={tab.label}
        onPress={() => onTabPress(tab.id)}
        className="items-center gap-1.5 px-2 py-1 active:opacity-70"
      >
        <AppIcon
          icon={tab.icon}
          size={26}
          strokeWidth={isActive ? 2.2 : 1.8}
          color={isActive ? "primary" : "muted"}
        />
        <Text
          className={`text-[11px] font-semibold ${
            isActive ? "text-primary" : "text-text-muted"
          }`}
        >
          {tab.label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View
      style={{ paddingBottom: insets.bottom + 14 }}
      className="border-t border-border bg-surface px-2 pt-3"
    >
      {/* Five equal slots → the center button is geometrically centered
          regardless of label widths. */}
      <View className="flex-row items-start">
        <View className="flex-1 items-center">{renderTab(left[0])}</View>
        <View className="flex-1 items-center">{renderTab(left[1])}</View>

        {/* Center Sell button — raised above the bar. */}
        <View className="flex-1 items-center">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Sell"
            onPress={onSellPress}
            className="-mt-6 items-center gap-1 active:opacity-80"
          >
            <View className="h-14 w-14 items-center justify-center rounded-full bg-primary">
              <AppIcon icon={Plus} size={27} strokeWidth={2.4} color="white" />
            </View>
            <Text
              className={`text-[11px] font-bold ${
                isSellActive ? "text-primary" : "text-text-muted"
              }`}
            >
              Sell
            </Text>
          </Pressable>
        </View>

        <View className="flex-1 items-center">{renderTab(right[0])}</View>
        <View className="flex-1 items-center">{renderTab(right[1])}</View>
      </View>
    </View>
  );
}
