import { Image, View, type ImageSourcePropType } from "react-native";

type AuthImageCardSize = "hero" | "compact" | "full" | "logo";

interface AuthImageCardProps {
  source: ImageSourcePropType;
  accessibilityLabel: string;
  size?: AuthImageCardSize;
  className?: string;
}

const sizeClasses: Record<AuthImageCardSize, string> = {
  logo: "h-20 w-20",
  hero: "h-56 w-full max-w-[340px]",
  compact: "h-40 w-full max-w-[260px]",
  full: "h-full w-full",
};

/** A neutral visual block shared by future Welcome, Login and Register screens. */
export function AuthImageCard({
  source,
  accessibilityLabel,
  size = "hero",
  className,
}: AuthImageCardProps): React.JSX.Element {
  return (
    <View
      className={`self-center overflow-hidden rounded-[14px] border border-border-light bg-silver-light ${sizeClasses[size]} ${className ?? ""}`}
    >
      <Image
        accessibilityLabel={accessibilityLabel}
        resizeMode="cover"
        source={source}
        className="h-full w-full"
      />
    </View>
  );
}
