import { useState } from "react";
import Animated, { SlideInRight } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { AuthEntryScreen } from "@/components/auth/auth-entry-screen";
import { tabsForMode, type MarketTabId } from "@/features/marketplace/types";
import type { Product } from "@/features/products/types";
import { useAppStore } from "@/stores/app-store";

import { MarketTabBar } from "./market-tab-bar";
import { CategoryProductsScreen } from "./category-products-screen";
import { ProductDetailScreen } from "./product-detail-screen";
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
 *      buyer  → Home / Categories / Messages / Profile (no Sell)
 *      seller → Products / Orders / [Sell] / Messages / Profile
 * The center Sell button renders in seller mode only.
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
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Seller has no Home — its entry tab is Products.
  const defaultTab: MarketTabId = mode === "seller" ? "products" : "home";

  // If the mode switches to one without the current tab, fall back
  // to the mode entry tab. `sell` is valid via the center button (seller only).
  const effectiveTab =
    activeTab === "sell" || tabs.some((t) => t.id === activeTab)
      ? activeTab
      : defaultTab;

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleTabPress = (tab: MarketTabId) => {
    setSelectedProduct(null);
    setSelectedCategory(null);
    setActiveTab(tab);
  };

  const handleSellPress = () => {
    setSelectedProduct(null);
    setSelectedCategory(null);
    setActiveTab("sell");
  };

  // Product details open above everything (tab bar hidden).
  if (selectedProduct) {
    return (
      <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
        <ProductDetailScreen
          product={selectedProduct}
          isFavorite={favorites.has(selectedProduct.id)}
          onToggleFavorite={() => toggleFavorite(selectedProduct.id)}
          onBack={() => setSelectedProduct(null)}
        />
      </SafeAreaView>
    );
  }

  // Category listing opens above the tabs (tab bar hidden).
  if (selectedCategory) {
    return (
      <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
        <CategoryProductsScreen
          categoryName={selectedCategory}
          onBack={() => setSelectedCategory(null)}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          onProductPress={setSelectedProduct}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      {/* key remounts content on tab switch → slide-in animation plays. */}
      <Animated.View
        key={effectiveTab}
        entering={SlideInRight.duration(150)}
        className="flex-1"
      >
        {effectiveTab === "home" ? (
          <HomeTab
            onSeeAllCategories={() => setActiveTab("categories")}
            onCategoryPress={setSelectedCategory}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onProductPress={setSelectedProduct}
          />
        ) : null}
        {effectiveTab === "categories" ? (
          <CategoriesTab
            onBack={() => handleTabPress("home")}
            onCategoryPress={setSelectedCategory}
          />
        ) : null}
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
        onTabPress={handleTabPress}
        onSellPress={handleSellPress}
      />
    </SafeAreaView>
  );
}
