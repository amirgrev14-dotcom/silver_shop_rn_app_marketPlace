import { Image } from "expo-image";
import { ArrowLeft, ChevronRight, ShoppingCart } from "lucide-react-native";
import {Pressable, ScrollView, View} from "react-native";

import { AppText } from "@/components/ui/app-text";
import { AppIcon } from "@/components/ui/app-icon";
import { CircleIconButton } from "@/components/ui/circle-icon-button";
import { EdgeFade } from "@/components/ui/edge-fade";
import { EmptyStateCard } from "@/components/ui/empty-state-card";
import { ScreenHeader } from "@/components/ui/screen-header";
import { shadows } from "@/components/ui/theme";
import { BETA_CATEGORIES } from "@/features/marketplace/beta-categories";
import {
  countForUiCategory,
  useCategoryCounts,
} from "@/features/products/hooks/use-category-counts";

export function CategoriesTab({
  onBack,
  onCategoryPress,
}: {
  onBack?: () => void;
  onCategoryPress?: (categoryName: string) => void;
}): React.JSX.Element {
  // Live totals per backend category; empty UI tiles are hidden.
  const countsQuery = useCategoryCounts(BETA_CATEGORIES.map((c) => c.name));
  const visibleCategories = BETA_CATEGORIES.filter((c) => {
    const count = countForUiCategory(countsQuery.data, c.name);
    // While loading (or on error) show everything; hide only known empties.
    return count === null || count > 0;
  });

  return (
    <View className="flex-1 bg-[#F8F8FB]">
      {/* Header: back + title + cart */}
      <ScreenHeader
        title="Categories"
        className="bg-surface px-5 pb-3 pt-4"
        left={<CircleIconButton icon={ArrowLeft} accessibilityLabel="Go back" onPress={onBack} tone="accent" />}
        right={<CircleIconButton icon={ShoppingCart} accessibilityLabel="Cart" />}
      />

      <View className="relative flex-1">
      <ScrollView
        contentContainerClassName="gap-4 px-5 pb-6"
        showsVerticalScrollIndicator={false}
      >
        {visibleCategories.length > 0 ? (
        <View className="flex-row flex-wrap gap-3.5">
          {visibleCategories.map((category) => (
            <Pressable
              key={category.id}
              accessibilityRole="button"
              onPress={() => onCategoryPress?.(category.name)}
              className="w-[47.5%] active:scale-[0.98] active:opacity-90"
            >
              <View
                style={shadows.card}
                className="overflow-hidden rounded-[20px] border border-border bg-white"
              >
                <View className="relative">
                  <Image
                    source={category.image}
                    style={{ width: "100%", height: 112 }}
                    contentFit="cover"
                  />
                  <View className="absolute bottom-2 left-2 rounded-full bg-white/95 px-2.5 py-1">
                    <AppText className="text-[11px] font-bold text-text-primary">
                      {(() => {
                        const count = countForUiCategory(countsQuery.data, category.name);
                        return count === null ? "…" : `${count} item${count === 1 ? "" : "s"}`;
                      })()}
                    </AppText>
                  </View>
                </View>
                <View className="flex-row items-center justify-between px-4 py-3">
                  <AppText className="text-base font-bold text-text-primary">
                    {category.name}
                  </AppText>
                  <AppIcon icon={ChevronRight} size={18} color="muted" />
                </View>
              </View>
            </Pressable>
          ))}
        </View>
        ) : (
          <EmptyStateCard
            title="No categories yet"
            description="Categories will appear here once the catalog is ready."
          />
        )}
      </ScrollView>
      <EdgeFade />
      </View>
    </View>
  );
}
