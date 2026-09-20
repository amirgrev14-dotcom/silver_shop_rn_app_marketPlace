import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react-native";
import { ActivityIndicator, ScrollView, View } from "react-native";

import { AppText } from "@/components/ui/app-text";
import { CircleIconButton } from "@/components/ui/circle-icon-button";
import { EmptyStateCard } from "@/components/ui/empty-state-card";
import { ProductCard } from "@/components/ui/product-card";
import { ScreenHeader } from "@/components/ui/screen-header";
import { SectionHeader } from "@/components/ui/section-header";
import { colors } from "@/components/ui/theme";
import { formatPrice } from "@/features/marketplace/mock-data";
import { mapCategoryToBackend } from "@/features/products/schemas/categories.schema";
import { fetchFeed } from "@/features/products/services/products-service";
import type { Product } from "@/features/products/types";

interface CategoryProductsScreenProps {
  /** UI category label, e.g. "Rings". */
  categoryName: string;
  onBack: () => void;
  favorites: Set<string>;
  onToggleFavorite: (id: string) => void;
  onProductPress: (product: Product) => void;
}

export function CategoryProductsScreen({
  categoryName,
  onBack,
  favorites,
  onToggleFavorite,
  onProductPress,
}: CategoryProductsScreenProps): React.JSX.Element {
  // Category names go to the backend as-is (backend enum mirrors the app grid).
  const backendCategory = mapCategoryToBackend(categoryName);
  const feedQuery = useQuery({
    queryKey: ["products", "feed", backendCategory],
    queryFn: () => fetchFeed({ category: backendCategory, limit: 50 }),
  });
  const items = feedQuery.data?.items ?? [];
  const total = feedQuery.data?.total ?? 0;

  return (
    <View className="flex-1 bg-[#F8F8FB]">
      <ScreenHeader
        title={categoryName}
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
          title={feedQuery.data ? `${total} item${total === 1 ? "" : "s"}` : "Items"}
        />
        {feedQuery.isPending ? (
          <View className="items-center py-8">
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : feedQuery.isError ? (
          <EmptyStateCard
            title="Couldn't load items"
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
            title={`No ${categoryName.toLowerCase()} yet`}
            description="New pieces in this category will appear here."
          />
        )}
      </ScrollView>
    </View>
  );
}
