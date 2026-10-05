import { useInfiniteQuery } from "@tanstack/react-query";
import { Bell, Heart, Search, ShoppingCart, SlidersHorizontal } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, View } from "react-native";
import Animated, { ZoomIn } from "react-native-reanimated";

import { AppButton } from "@/components/ui/app-button";
import { AppIcon } from "@/components/ui/app-icon";
import { AppInput } from "@/components/ui/app-input";
import { AppText } from "@/components/ui/app-text";
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
  onShowSaved?: () => void;
  favorites: Set<string>;
  onToggleFavorite: (product: Product) => void;
  onProductPress: (product: Product) => void;
  cartCount: number;
  onCartPress?: () => void;
}

export function HomeTab({
  onSeeAllCategories,
  onCategoryPress,
  onShowSaved,
  favorites,
  onToggleFavorite,
  onProductPress,
  cartCount,
  onCartPress,
}: HomeTabProps): React.JSX.Element {
  const [query, setQuery] = useState("");

  // Real backend feed, 20 items per page — never the whole catalog at once.
  const feedQuery = useInfiniteQuery({
    queryKey: ["products", "feed"],
    queryFn: ({ pageParam }) => fetchFeed({ limit: 20, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.pages ? lastPage.page + 1 : undefined,
  });
  const feed = feedQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const totalCount = feedQuery.data?.pages[0]?.total ?? 0;
  const remainingCount = Math.max(0, totalCount - feed.length);

  const products = feed.filter((p) =>
    p.title.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <ScrollView
      contentContainerClassName="gap-5 px-3 pb-6 pt-4"
      showsVerticalScrollIndicator={false}
      className="bg-app"
      refreshControl={
        <RefreshControl
          refreshing={feedQuery.isRefetching && !feedQuery.isFetchingNextPage}
          onRefresh={() => void feedQuery.refetch()}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      {/* Header: Sliver + favorites + cart + bell */}
      <ScreenHeader
        title="Sliver"
        titleAlign="left"
        accentFirstLetter
        titleClassName="text-2xl tracking-tight"
        right={
          <View className="flex-row gap-2">
            <CircleIconButton
              icon={Heart}
              accessibilityLabel="Saved items"
              onPress={onShowSaved}
            />
            <View className="relative">
              <CircleIconButton icon={ShoppingCart} accessibilityLabel="Cart" onPress={onCartPress} />
              {cartCount > 0 ? (
                <Animated.View
                  key={cartCount}
                  entering={ZoomIn.springify().damping(10).stiffness(500)}
                  className="absolute -right-1 -top-1 h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1"
                >
                  <AppText className="text-[11px] font-bold text-white">
                    {cartCount > 99 ? "99+" : String(cartCount)}
                  </AppText>
                </Animated.View>
              ) : null}
            </View>
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
          <View className="gap-3">
            <EmptyStateCard
              title="Couldn't load items"
              description="Check your connection and pull to try again later."
            />
            <AppButton variant="secondary" onPress={() => void feedQuery.refetch()}>
              Try again
            </AppButton>
          </View>
        ) : products.length > 0 ? (
          <View className="gap-3">
            <View className="flex-row flex-wrap gap-3">
              {products.map((product) => (
                <View key={product.id} className="flex-1" style={{ minWidth: "47%" }}>
                  <ProductCard
                    className="w-full"
                    imageClassName="h-44"
                    imageSource={{ uri: product.images[0] ?? "" }}
                    title={product.title}
                    subtitle={product.categories[0] ?? ""}
                    price={formatPrice(product.price, product.currency)}
                    isFavorite={favorites.has(product.id)}
                    onPress={() => onProductPress(product)}
                    onFavoritePress={() => onToggleFavorite(product)}
                  />
                </View>
              ))}
            </View>
            {feedQuery.hasNextPage ? (
              <AppButton
                variant="secondary"
                loading={feedQuery.isFetchingNextPage}
                onPress={() => feedQuery.fetchNextPage()}
              >
                {`Load more${remainingCount > 0 ? ` (${remainingCount} left)` : ""}`}
              </AppButton>
            ) : null}
          </View>
        ) : (
          <EmptyStateCard
            title={query.trim() ? "No items match your search" : "No popular items yet"}
            description={
              query.trim()
                ? "Try a different search term."
                : "Popular silver pieces from sellers will appear here."
            }
          />
        )}
      </View>
    </ScrollView>
  );
}
