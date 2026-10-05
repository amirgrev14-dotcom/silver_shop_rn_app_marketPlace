import { Image } from "expo-image";
import {Pressable, View} from "react-native";

import { AppText } from "@/components/ui/app-text";
import type { PromoBannerData } from "@/features/marketplace/mock-data";

interface PromoBannerProps {
  promo: PromoBannerData;
  onPress?: () => void;
}

/**
 * Promo/ad banner. Fully driven by `promo` data so the super-admin
 * can manage banners from the backend later without UI changes.
 */
export function PromoBanner({ promo, onPress }: PromoBannerProps): React.JSX.Element {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={promo.title}
      onPress={onPress}
      className="overflow-hidden rounded-[24px] bg-text-primary active:opacity-90"
    >
      <View className="flex-row items-center">
        {/* Copy side */}
        <View className="flex-1 gap-2 p-5">
          <View className="self-start rounded-full bg-surface/15 px-3 py-1">
            <AppText className="text-[11px] font-bold uppercase tracking-[1px] text-white">
              {promo.badge}
            </AppText>
          </View>
          <AppText className="text-2xl font-bold leading-7 text-white">
            {promo.title}
          </AppText>
          <AppText className="text-sm leading-5 text-white/70">
            {promo.subtitle}
          </AppText>
          <View className="mt-2 self-start rounded-full bg-surface px-5 py-2.5">
            <AppText className="text-sm font-bold text-text-primary">
              {promo.ctaLabel}
            </AppText>
          </View>
        </View>

        {/* Image side with decorative rings */}
        <View className="relative mr-4 h-[168px] w-[128px] items-center justify-center">
          <View className="absolute h-[150px] w-[150px] rounded-full bg-surface/10" />
          <View className="absolute h-[118px] w-[118px] rounded-full bg-surface/10" />
          <Image
            source={promo.image}
            style={{ width: 104, height: 140, borderRadius: 20 }}
            contentFit="cover"
          />
        </View>
      </View>
    </Pressable>
  );
}
