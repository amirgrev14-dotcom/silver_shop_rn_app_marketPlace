import {Pressable, View, type GestureResponderEvent, type ImageSourcePropType, } from "react-native";

import { AppText } from "@/components/ui/app-text";
import { AppCard } from "./app-card";
import { FavoriteButton } from "./favorite-button";
import { LoadingImage } from "./loading-image";

interface ProductCardProps {
  imageSource: ImageSourcePropType;
  title: string;
  subtitle?: string;
  price: string;
  isFavorite?: boolean;
  onPress?: () => void;
  onFavoritePress?: () => void;
  className?: string;
  imageClassName?: string;
  /** vertical = image on top (grid), horizontal = image left, info right (wide feed). */
  layout?: "vertical" | "horizontal";
}

export function ProductCard({
  imageSource,
  title,
  subtitle,
  price,
  isFavorite = false,
  onPress,
  onFavoritePress,
  className,
  imageClassName = "h-40",
  layout = "vertical",
}: ProductCardProps): React.JSX.Element {
  const handleFavoritePress = (event: GestureResponderEvent): void => {
    event.stopPropagation();
    onFavoritePress?.();
  };

  if (layout === "horizontal") {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        className={className ?? "w-full"}
      >
        <AppCard className="flex-row items-center gap-3 p-3">
          <View className="h-[104px] w-[104px] overflow-hidden rounded-[14px] bg-silver-light">
            <LoadingImage
              source={imageSource}
              style={{ width: "100%", height: "100%" }}
            />
          </View>
          <View className="flex-1 gap-1 py-1">
            <AppText
              numberOfLines={1}
              className="text-base font-semibold text-text-primary"
            >
              {title}
            </AppText>
            {subtitle ? (
              <AppText
                numberOfLines={1}
                className="text-sm text-text-secondary"
              >
                {subtitle}
              </AppText>
            ) : null}
            <AppText className="mt-1 text-lg font-bold text-primary">{price}</AppText>
          </View>
          <View className="self-start">
            <FavoriteButton isFavorite={isFavorite} onPress={handleFavoritePress} />
          </View>
        </AppCard>
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className={className ?? "w-[210px]"}
    >
      <AppCard className="py-0 px-0">
        <View className={`relative overflow-hidden rounded-t-[14px] bg-silver-light ${imageClassName}`}>
          <LoadingImage
            source={imageSource}
            style={{ width: "100%", height: "100%" }}
          />

          <View className="absolute right-2 top-2">
            <FavoriteButton isFavorite={isFavorite} onPress={handleFavoritePress} />
          </View>
        </View>
        {/* INFO */}
        <View className="px-3 pt-2 pb-3">
          <View className="flex-row items-start justify-between gap-2">
            <View className="flex-1">
              <AppText
                numberOfLines={1}
                className="text-base font-semibold text-text-primary"
              >
                {title}
              </AppText>

              {subtitle ? (
                <AppText
                  numberOfLines={1}
                  className="mt-1 text-sm text-text-secondary"
                >
                  {subtitle}
                </AppText>
              ) : null}
            </View>
          </View>
          <AppText className="mt-3 text-xl font-bold text-primary">{price}</AppText>
        </View>
      </AppCard>
    </Pressable>
  );
}
