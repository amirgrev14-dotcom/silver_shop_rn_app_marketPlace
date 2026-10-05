import { Heart } from "lucide-react-native";
import type { GestureResponderEvent } from "react-native";
import { Pressable } from "react-native";

import { AppIcon } from "./app-icon";
import { colors } from "./theme";

interface FavoriteButtonProps {
  isFavorite?: boolean;
  onPress?: (event: GestureResponderEvent) => void;
}

/** Heart overlay button for product photos. Filled when favorited. */
export function FavoriteButton({
  isFavorite = false,
  onPress,
}: FavoriteButtonProps): React.JSX.Element {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={isFavorite ? "Remove from favorites" : "Add to favorites"}
      onPress={onPress}
      className="h-10 w-10 items-center justify-center rounded-full bg-surface active:opacity-70"
    >
      <AppIcon
        icon={Heart}
        size={20}
        color={isFavorite ? "primary" : "muted"}
        fill={isFavorite ? colors.primary : "transparent"}
      />
    </Pressable>
  );
}
