import { memo } from "react";
import {Pressable, View, type GestureResponderEvent, type ImageSourcePropType, } from "react-native";

import { AppText } from "@/components/ui/app-text";
import { AppCard } from "./app-card";
import { FavoriteButton } from "./favorite-button";
import { LoadingImage } from "./loading-image";
import { colors } from "./theme";

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

function sourceKey(source: ImageSourcePropType): string | number {
  if (source === null || source === undefined) return "";
  if (typeof source === "number") return source;
  if (Array.isArray(source)) return source.length > 0 ? sourceKey(source[0]) : "";
  return source.uri ?? "";
}

/**
 * Custom compare: grids pass fresh inline closures and `{ uri }`
 * objects every render — compare by value so only the tapped card
 * re-renders when a heart toggles. The heart fills instantly.
 */
function arePropsEqual(prev: ProductCardProps, next: ProductCardProps): boolean {
  return (
    prev.title === next.title &&
    prev.subtitle === next.subtitle &&
    prev.price === next.price &&
    prev.isFavorite === next.isFavorite &&
    prev.className === next.className &&
    prev.imageClassName === next.imageClassName &&
    prev.layout === next.layout &&
    sourceKey(prev.imageSource) === sourceKey(next.imageSource)
  );
}

function ProductCardInner({
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
        className={`${className ?? "w-full"} active:opacity-75`}
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
      className={`${className ?? "w-[210px]"} active:opacity-75`}
    >
      <AppCard variant="ghost" style={{ borderColor: colors.border }} className="py-0 px-0">
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

export const ProductCard = memo(ProductCardInner, arePropsEqual);
