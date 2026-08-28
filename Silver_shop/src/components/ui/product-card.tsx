import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {
  Image,
  Pressable,
  Text,
  View,
  type GestureResponderEvent,
  type ImageSourcePropType,
} from "react-native";

import { AppCard } from "./app-card";
import { IconButton } from "./icon-button";
import { colors } from "./theme";

interface ProductCardProps {
  imageSource: ImageSourcePropType;
  title: string;
  subtitle?: string;
  price: string;
  isFavorite?: boolean;
  onPress?: () => void;
  onFavoritePress?: () => void;
}

export function ProductCard({
  imageSource,
  title,
  subtitle,
  price,
  isFavorite = false,
  onPress,
  onFavoritePress,
}: ProductCardProps): React.JSX.Element {
  const handleFavoritePress = (event: GestureResponderEvent): void => {
    event.stopPropagation();
    onFavoritePress?.();
  };

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="w-[210px]"
    >
      <AppCard className="py-0 px-0">
        <View className="relative h-40 overflow-hidden rounded-t-[14px] bg-silver-light">
          <Image
            source={imageSource}
            resizeMode="cover"
            className="h-full w-full"
          />

          <View className="absolute right-2 top-2">
            <IconButton
              active={isFavorite}
              accessibilityLabel={
                isFavorite ? "Remove from favorites" : "Add to favorites"
              }
              customIcon={
                <MaterialCommunityIcons
                  name={isFavorite ? "heart" : "heart-outline"}
                  size={24}
                  color={isFavorite ? colors.primary : colors.textSecondary}
                />
              }
              onPress={handleFavoritePress}
              style={{ backgroundColor: colors.surface }}
              className="size-10 border-0"
            />
          </View>
        </View>
        {/* INFO */}
        <View className="px-3 pt-2 pb-3">
          <View className="flex-row items-start justify-between gap-2">
            <View className="flex-1">
              <Text
                numberOfLines={1}
                className="text-base font-semibold text-text-primary"
              >
                {title}
              </Text>

              {subtitle ? (
                <Text
                  numberOfLines={1}
                  className="mt-1 text-sm text-text-secondary"
                >
                  {subtitle}
                </Text>
              ) : null}
            </View>
          </View>
          <Text className="mt-3 text-xl font-bold text-primary">{price}</Text>
        </View>
      </AppCard>
    </Pressable>
  );
}
