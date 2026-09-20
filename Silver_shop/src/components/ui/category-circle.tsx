import { Image } from "expo-image";
import {Pressable, View, type ImageSourcePropType} from "react-native";

import { AppText } from "@/components/ui/app-text";
import { shadows } from "./theme";

interface CategoryCircleProps {
  image: ImageSourcePropType;
  label: string;
  onPress?: () => void;
}

/** Round category tile with a soft purple ring, shadow and bold label. */
export function CategoryCircle({ image, label, onPress }: CategoryCircleProps): React.JSX.Element {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className="items-center gap-2 active:scale-95 active:opacity-80"
    >
      <View
        style={shadows.card}
        className="rounded-full bg-primary-light p-[3px]"
      >
        <View className="h-16 w-16 overflow-hidden rounded-full border-2 border-white bg-white">
          <Image
            source={image}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
          />
        </View>
      </View>
      <AppText className="max-w-[72px] text-center text-xs font-semibold text-text-primary">
        {label}
      </AppText>
    </Pressable>
  );
}
