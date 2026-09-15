import { useState } from "react";
import Animated, { SlideInRight } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { AuthEntryScreen } from "@/components/auth/auth-entry-screen";
import { tabsForMode, type MarketTabId } from "@/features/marketplace/types";
import { useAppStore } from "@/stores/app-store";

import { MarketTabBar } from "./market-tab-bar";
import { CategoriesTab } from "./tabs/categories-tab";
import { HomeTab } from "./tabs/home-tab";
import { MessagesTab } from "./tabs/messages-tab";
import { MyProductsTab } from "./tabs/my-products-tab";
import { OrdersTab } from "./tabs/orders-tab";
import { ProfileTab } from "./tabs/profile-tab";
import { SellTab } from "./tabs/sell-tab";

/**
 * Root gate:
 *  - guest     → auth flow (welcome / login / register);
 *  - logged in → SILVER marketplace with a mode-based TabBar:
 *      buyer  → Home / Categories / [Sell] / Orders / Profile
 *      seller → Products / Orders / [Sell] / Messages / Profile (no Home)
 * The center Sell button opens the Sell screen in both modes
 * (a buyer tapping it becomes a seller).
 */
export function MarketplaceHomeScreen(): React.JSX.Element {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return <AuthEntryScreen />;
  }

  return <MarketplaceTabs />;
}

function MarketplaceTabs(): React.JSX.Element {
  const mode = useAppStore((s) => s.mode);
  const tabs = tabsForMode(mode);
  const [activeTab, setActiveTab] = useState<MarketTabId>("home");

  // Seller has no Home — its entry tab is Products.
  const defaultTab: MarketTabId = mode === "seller" ? "products" : "home";

  // If the mode switches to one without the current tab, fall back
  // to the mode entry tab. `sell` is valid in both modes (center button).
  const effectiveTab =
    activeTab === "sell" || tabs.some((t) => t.id === activeTab)
      ? activeTab
      : defaultTab;

  const handleSellPress = () => {
    setActiveTab("sell");
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      {/* key remounts content on tab switch → slide-in animation plays. */}
      <Animated.View
        key={effectiveTab}
        entering={SlideInRight.duration(250)}
        className="flex-1"
      >
        {effectiveTab === "home" ? <HomeTab /> : null}
        {effectiveTab === "categories" ? <CategoriesTab /> : null}
        {effectiveTab === "products" ? (
          <MyProductsTab onAdd={() => setActiveTab("sell")} />
        ) : null}
        {effectiveTab === "orders" ? <OrdersTab /> : null}
        {effectiveTab === "sell" ? <SellTab /> : null}
        {effectiveTab === "messages" ? <MessagesTab /> : null}
        {effectiveTab === "profile" ? <ProfileTab /> : null}
      </Animated.View>
      <MarketTabBar
        tabs={tabs}
        activeTab={effectiveTab}
        isSellActive={effectiveTab === "sell"}
        showSellButton={mode === "seller"}
        onTabPress={setActiveTab}
        onSellPress={handleSellPress}
      />
    </SafeAreaView>
  );
}
