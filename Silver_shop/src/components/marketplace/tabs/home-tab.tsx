import { useQuery } from "@tanstack/react-query";
import { Bell, Heart, Search, ShoppingCart, SlidersHorizontal } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";

import { AppIcon } from "@/components/ui/app-icon";
import { AppInput } from "@/components/ui/app-input";
import { CategoryCircle } from "@/components/ui/category-circle";
import { CircleIconButton } from "@/components/ui/circle-icon-button";
import { EmptyStateCard } from "@/components/ui/empty-state-card";
import { ProductCard } from "@/components/ui/product-card";
import { PromoCarousel } from "@/components/ui/promo-carousel";
import { ScreenHeader } from "@/components/ui/screen-header";
import { SectionHeader } from "@/components/ui/section-header";
import { colors } from "@/components/ui/theme";
import {
  MOCK_PROMOS,
  formatPrice,
} from "@/features/marketplace/mock-data";
import { BETA_HOME_CATEGORIES } from "@/features/marketplace/beta-categories";
import { fetchFeed } from "@/features/products/services/products-service";
import type { Product } from "@/features/products/types";

interface HomeTabProps {
  onSeeAllCategories?: () => void;
  onCategoryPress?: (categoryName: string) => void;
  favorites: Set<string>;
  onToggleFavorite: (id: string) => void;
  onProductPress: (product: Product) => void;
}

export function HomeTab({
  onSeeAllCategories,
  onCategoryPress,
  favorites,
  onToggleFavorite,
  onProductPress,
}: HomeTabProps): React.JSX.Element {
  const [query, setQuery] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  // Real backend feed (ACTIVE products). Replaces the old mock list.
  const feedQuery = useQuery({
    queryKey: ["products", "feed"],
    queryFn: () => fetchFeed({ limit: 20 }),
  });
  const feed = feedQuery.data?.items ?? [];

  const products = feed.filter(
    (p) =>
      p.title.toLowerCase().includes(query.trim().toLowerCase()) &&
      (!favoritesOnly || favorites.has(p.id)),
  );

  return (
    <ScrollView
      contentContainerClassName="gap-5 px-3 pb-6 pt-4"
      showsVerticalScrollIndicator={false}
      className="bg-[#F8F8FB]"
    >
      {/* Header: Sliver + favorites + cart + bell */}
      <ScreenHeader
        title="Sliver"
        titleAlign="left"
        titleClassName="text-2xl tracking-tight"
        right={
          <View className="flex-row gap-2">
            <CircleIconButton
              icon={Heart}
              accessibilityLabel="Show favorites"
              iconColor={favoritesOnly ? "primary" : "secondary"}
              onPress={() => setFavoritesOnly((v) => !v)}
            />
            <CircleIconButton icon={ShoppingCart} accessibilityLabel="Cart" />
            <CircleIconButton icon={Bell} accessibilityLabel="Notifications" />
          </View>
        }
      />

      {/* Search + filter */}
      <View className="flex-row items-center gap-2.5">
        <View className="flex-1">
          <AppInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search silver items..."
            leftIcon={<AppIcon icon={Search} size={18} color="muted" />}
          />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Filter"
          className="h-[52px] w-[52px] items-center justify-center rounded-[14px] bg-text-primary active:opacity-80"
        >
          <AppIcon icon={SlidersHorizontal} size={20} color="white" />
        </Pressable>
      </View>

      {/* Promo carousel (hidden when there are no promos yet). */}
      {MOCK_PROMOS.length > 0 ? <PromoCarousel promos={MOCK_PROMOS} /> : null}

      {/* Categories */}
      <View className="mt-1 gap-3.5">
        <SectionHeader title="Categories" actionLabel="See all" onActionPress={onSeeAllCategories} />
        {BETA_HOME_CATEGORIES.length > 0 ? (
          <View className="flex-row justify-between">
            {BETA_HOME_CATEGORIES.map((cat) => (
              <CategoryCircle
                key={cat.id}
                image={cat.image}
                label={cat.name}
                onPress={() => onCategoryPress?.(cat.name)}
              />
            ))}
          </View>
        ) : (
          <EmptyStateCard
            title="No categories yet"
            description="Categories will appear here once the catalog is ready."
          />
        )}
      </View>

      {/* Popular items: 2-column grid from the API, tap opens product details. */}
      <View className="gap-3">
        <SectionHeader title="Popular Items" actionLabel="See all" />
        {feedQuery.isPending ? (
          <View className="items-center py-8">
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : feedQuery.isError ? (
          <EmptyStateCard
            title="Couldn't load items"
            description="Check your connection and pull to try again later."
          />
        ) : products.length > 0 ? (
          <View className="flex-row flex-wrap gap-3">
            {products.map((product) => (
              <View key={product.id} className="flex-1" style={{ minWidth: "47%" }}>
                <ProductCard
                  className="w-full"
                  imageClassName="h-44"
                  imageSource={{ uri: product.images[0] ?? "" }}
                  title={product.title}
                  subtitle={product.categories[0] ?? ""}
                  price={formatPrice(product.price)}
                  isFavorite={favorites.has(product.id)}
                  onPress={() => onProductPress(product)}
                  onFavoritePress={() => onToggleFavorite(product.id)}
                />
              </View>
            ))}
          </View>
        ) : (
          <EmptyStateCard
            title={
              query.trim()
                ? "No items match your search"
                : favoritesOnly
                  ? "No favorites yet"
                  : "No popular items yet"
            }
            description={
              query.trim()
                ? "Try a different search term."
                : favoritesOnly
                  ? "Tap the heart on pieces you like to save them here."
                  : "Popular silver pieces from sellers will appear here."
            }
          />
        )}
      </View>
    </ScrollView>
  );
}
