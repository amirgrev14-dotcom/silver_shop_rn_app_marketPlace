import { Plus } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppIcon } from "@/components/ui/app-icon";
import type { MarketTab, MarketTabId } from "@/features/marketplace/types";

interface MarketTabBarProps {
  /** Exactly 4 tabs. The Sell button renders in the middle (sellers only). */
  tabs: MarketTab[];
  activeTab: MarketTabId;
  isSellActive: boolean;
  showSellButton: boolean;
  onTabPress: (tab: MarketTabId) => void;
  onSellPress: () => void;
}

export function MarketTabBar({
  tabs,
  activeTab,
  isSellActive,
  showSellButton,
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
        className="items-center gap-1.5 px-2 pb-1 pt-2.5 active:opacity-70"
      >
        {/* Fixed slot → all glyphs sit on one line at one visual size. */}
        <View className="h-7 w-7 items-center justify-center">
          <AppIcon
            icon={tab.icon}
            size={26}
            strokeWidth={isActive ? 2.2 : 1.8}
            color={isActive ? "primary" : "muted"}
          />
        </View>
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
      {/* Five equal slots when the center button is shown, four otherwise —
          the center stays geometrically centered either way. */}
      <View className="flex-row items-start">
        <View className="flex-1 items-center">{renderTab(left[0])}</View>
        <View className="flex-1 items-center">{renderTab(left[1])}</View>

        {showSellButton ? (
          /* Center Sell button — sellers only, raised above the bar. */
          <View className="flex-1 items-center">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Sell"
              onPress={onSellPress}
              className="-mt-3 items-center gap-1 active:opacity-80"
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
        ) : null}

        <View className="flex-1 items-center">{renderTab(right[0])}</View>
        <View className="flex-1 items-center">{renderTab(right[1])}</View>
      </View>
    </View>
  );
}
