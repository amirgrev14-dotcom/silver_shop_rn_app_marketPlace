import { Image, type ImageContentFit } from "expo-image";
import { ImageOff } from "lucide-react-native";
import { ActivityIndicator, StyleSheet, View, type ImageSourcePropType, type StyleProp, type ViewStyle } from "react-native";

import { AppIcon } from "./app-icon";
import { AppText } from "./app-text";
import { colors } from "./theme";

interface LoadingImageProps {
  source: ImageSourcePropType;
  style?: StyleProp<ViewStyle>;
  contentFit?: ImageContentFit;
  className?: string;
}

function isEmptySource(source: ImageSourcePropType): boolean {
  if (source === null || source === undefined) return true;
  if (typeof source === "number") return false;
  if (Array.isArray(source)) return source.length === 0;
  return !source.uri;
}

/**
 * Image with two built-in states:
 *  - empty source → "No image" placeholder (icon + label);
 *  - loading → spinner on a silver placeholder, covered once
 *    the opaque photo paints over it.
 * Stateless — safe inside lists and viewers.
 */
export function LoadingImage({ source, style, contentFit = "cover", className }: LoadingImageProps): React.JSX.Element {
  if (isEmptySource(source)) {
    return (
      <View
        style={style}
        className={`items-center justify-center gap-1.5 overflow-hidden bg-silver-light ${className ?? ""}`}
      >
        <AppIcon icon={ImageOff} size={28} color="muted" />
        <AppText className="text-xs font-medium text-text-muted">No image</AppText>
      </View>
    );
  }

  return (
    <View
      style={style}
      className={`items-center justify-center overflow-hidden bg-silver-light ${className ?? ""}`}
    >
      <ActivityIndicator size="small" color={colors.primary} />
      <Image source={source} style={StyleSheet.absoluteFill} contentFit={contentFit} />
    </View>
  );
}
