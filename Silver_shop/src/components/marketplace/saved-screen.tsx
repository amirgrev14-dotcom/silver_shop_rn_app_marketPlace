import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

import { AppText } from "@/components/ui/app-text";
import { CircleIconButton } from "@/components/ui/circle-icon-button";
import { EmptyStateCard } from "@/components/ui/empty-state-card";
import { ProductCard } from "@/components/ui/product-card";
import { ScreenHeader } from "@/components/ui/screen-header";
import { SectionHeader } from "@/components/ui/section-header";
import { colors } from "@/components/ui/theme";
import { formatPrice } from "@/features/marketplace/mock-data";
import { fetchFavoriteProducts } from "@/features/products/services/products-service";
import type { Product } from "@/features/products/types";
import { favoritesStorage } from "@/lib/storage/favorites-storage";

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
  // One lookup for the whole visit, frozen at mount: unlikes only
  // hide cards from memory (filter below) and never hit the backend
  // per toggle. The single sync happens on exit (handleBack).
  const mountIdsRef = useRef<string[] | null>(null);
  if (mountIdsRef.current === null) mountIdsRef.current = productIds;
  const initialIds = mountIdsRef.current;

  // Dedicated backend lookup by ids — no catalog paging involved.
  const savedQuery = useQuery({
    queryKey: ["products", "favorites", "snapshot", [...initialIds].sort().join(",")],
    queryFn: () => fetchFavoriteProducts(initialIds),
    enabled: initialIds.length > 0,
    staleTime: Infinity,
    gcTime: 60_000,
  });
  // Delayed disappear: heart unfills instantly, the card itself
  // lingers ~450ms so the tap reads before it slides away.
  // Declared BEFORE first use (transpiled var would be undefined).
  const [leavingIds, setLeavingIds] = useState<Set<string>>(new Set());
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => {
    timersRef.current.forEach(clearTimeout);
  }, []);

  const items = (savedQuery.data ?? []).filter(
    (p) => favorites.has(p.id) || leavingIds.has(p.id)
  );

  const handleUnlike = (product: Product) => {
    if (!favorites.has(product.id) || leavingIds.has(product.id)) return;
    setLeavingIds((prev) => new Set(prev).add(product.id));
    timersRef.current.push(
      setTimeout(() => {
        onToggleFavorite(product);
        setLeavingIds((prev) => {
          const next = new Set(prev);
          next.delete(product.id);
          return next;
        });
      }, 450)
    );
  };

  // Batched exit-sync: unlikes apply instantly in memory; a single
  // loader validates + persists once when leaving — never per toggle.
  const [syncing, setSyncing] = useState(false);

  const handleBack = async () => {
    const initial = mountIdsRef.current ?? [];
    const changed =
      initial.length !== productIds.length ||
      initial.some((id, index) => productIds[index] !== id);
    if (!changed) {
      onBack();
      return;
    }
    setSyncing(true);
    try {
      await favoritesStorage.save(productIds);
      const fresh = await fetchFavoriteProducts(productIds);
      const valid = fresh.map((p) => p.id);
      if (valid.length !== productIds.length) onSyncIds(valid);
    } catch {
      // Offline — local state stays, sync retries on next exit.
    } finally {
      setSyncing(false);
      onBack();
    }
  };

  return (
    <View className="flex-1 bg-app">
      <ScreenHeader
        title="Saved Items"
        titleAlign="left"
        accentFirstLetter
        className="bg-surface px-5 pb-3 pt-4"
        left={
          <CircleIconButton icon={ArrowLeft} accessibilityLabel="Go back" onPress={handleBack} tone="accent" />
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
            {items.map((product, index) => (
              <Animated.View
                key={product.id}
                entering={FadeInUp.duration(250).delay(Math.min(index, 8) * 45)}
                className="flex-1"
                style={{ minWidth: "47%" }}
              >
                <ProductCard
                  className="w-full"
                  imageClassName="h-44"
                  imageSource={{ uri: product.images[0] ?? "" }}
                  title={product.title}
                  subtitle={product.categories[0] ?? ""}
                  price={formatPrice(product.price, product.currency)}
                  isFavorite={favorites.has(product.id) && !leavingIds.has(product.id)}
                  onPress={() => onProductPress(product)}
                  onFavoritePress={() => handleUnlike(product)}
                />
              </Animated.View>
            ))}
          </View>
        ) : (
          <EmptyStateCard
            title="Nothing available"
            description="Your saved pieces were sold or removed."
          />
        )}
      </ScrollView>

      {/* Single sync loader on exit — never per toggle. */}
      {syncing ? (
        <View className="absolute inset-0 items-center justify-center gap-3 bg-surface/80">
          <ActivityIndicator size="large" color={colors.primary} />
          <AppText className="text-sm font-semibold text-text-secondary">
            Syncing saved items…
          </AppText>
        </View>
      ) : null}
    </View>
  );
}
