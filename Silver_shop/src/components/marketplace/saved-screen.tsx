import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react-native";
import { useEffect } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";

import { CircleIconButton } from "@/components/ui/circle-icon-button";
import { EmptyStateCard } from "@/components/ui/empty-state-card";
import { ProductCard } from "@/components/ui/product-card";
import { ScreenHeader } from "@/components/ui/screen-header";
import { SectionHeader } from "@/components/ui/section-header";
import { colors } from "@/components/ui/theme";
import { formatPrice } from "@/features/marketplace/mock-data";
import { fetchFavoriteProducts } from "@/features/products/services/products-service";
import type { Product } from "@/features/products/types";

interface SavedScreenProps {
  productIds: string[];
  onBack: () => void;
  favorites: Set<string>;
  onToggleFavorite: (product: Product) => void;
  onProductPress: (product: Product) => void;
  /** Drop ids that no longer resolve (sold/deleted) so the list never rots. */
  onSyncIds: (validIds: string[]) => void;
}

export function SavedScreen({
  productIds,
  onBack,
  favorites,
  onToggleFavorite,
  onProductPress,
  onSyncIds,
}: SavedScreenProps): React.JSX.Element {
  // Dedicated backend lookup by ids — no catalog paging involved.
  const savedQuery = useQuery({
    queryKey: ["products", "favorites", [...productIds].sort().join(",")],
    queryFn: () => fetchFavoriteProducts(productIds),
    enabled: productIds.length > 0,
    staleTime: 30_000,
  });
  const items = savedQuery.data ?? [];

  useEffect(() => {
    if (savedQuery.data) {
      const valid = savedQuery.data.map((p) => p.id);
      if (valid.length !== productIds.length) onSyncIds(valid);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedQuery.data]);

  return (
    <View className="flex-1 bg-[#F8F8FB]">
      <ScreenHeader
        title="Saved Items"
        titleAlign="left"
        accentFirstLetter
        className="bg-surface px-5 pb-3 pt-4"
        left={
          <CircleIconButton icon={ArrowLeft} accessibilityLabel="Go back" onPress={onBack} tone="accent" />
        }
      />

      <ScrollView
        contentContainerClassName="gap-4 px-3 pb-6 pt-3"
        showsVerticalScrollIndicator={false}
      >
        <SectionHeader
          title={
            savedQuery.data
              ? `${items.length} item${items.length === 1 ? "" : "s"}`
              : "Items"
          }
        />
        {productIds.length === 0 ? (
          <EmptyStateCard
            title="No saved items yet"
            description="Tap the heart on pieces you like and they will wait for you here."
          />
        ) : savedQuery.isPending ? (
          <View className="items-center py-8">
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : savedQuery.isError ? (
          <EmptyStateCard
            title="Couldn't load saved items"
            description="Check your connection and try again later."
          />
        ) : items.length > 0 ? (
          <View className="flex-row flex-wrap gap-3">
            {items.map((product) => (
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
        ) : (
          <EmptyStateCard
            title="Nothing available"
            description="Your saved pieces were sold or removed."
          />
        )}
      </ScrollView>
    </View>
  );
}
