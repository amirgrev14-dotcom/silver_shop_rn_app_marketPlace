import { useState } from "react";
import {
  ScrollView,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";

import type { PromoBannerData } from "@/features/marketplace/mock-data";
import { PromoBanner } from "./promo-banner";

interface PromoCarouselProps {
  promos: PromoBannerData[];
  onPromoPress?: (promo: PromoBannerData) => void;
}

/** Paging promo banner carousel with dots, like the design reference. */
export function PromoCarousel({ promos, onPromoPress }: PromoCarouselProps): React.JSX.Element {
  const { width: screenWidth } = useWindowDimensions();
  const pageWidth = screenWidth - 24; // px-3 on both sides
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    setActiveIndex(Math.round(offsetX / pageWidth));
  };

  if (promos.length === 0) return <View />;

  return (
    <View className="gap-2">
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        className="flex-row"
      >
        {promos.map((promo) => (
          <View key={promo.id} style={{ width: pageWidth }} className="pr-0">
            <PromoBanner promo={promo} onPress={() => onPromoPress?.(promo)} />
          </View>
        ))}
      </ScrollView>
      {promos.length > 1 ? (
        <View className="flex-row items-center justify-center gap-1.5">
          {promos.map((promo, index) => (
            <View
              key={promo.id}
              className={`h-1.5 rounded-full ${
                index === activeIndex ? "w-5 bg-primary" : "w-1.5 bg-border"
              }`}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}
