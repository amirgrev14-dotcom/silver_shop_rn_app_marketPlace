import { View } from "react-native";

interface EdgeFadeProps {
  /** Height of the fog strip. */
  height?: number;
  /** Solid color at the header edge (dissolves to transparent). */
  color?: string;
  className?: string;
}

const STEPS = 18;

/**
 * Fog-like fade under a sticky header: content dissolves softly
 * instead of clipping with a hard edge. Pure views, no native deps.
 * Must sit after the ScrollView inside a relative parent; ignores touches.
 */
export function EdgeFade({ height = 40, color = "#FFFFFF", className }: EdgeFadeProps): React.JSX.Element {
  const stepHeight = height / STEPS;
  return (
    <View
      pointerEvents="none"
      style={{ height }}
      className={`absolute left-0 right-0 top-0 ${className ?? ""}`}
    >
      {Array.from({ length: STEPS }).map((_, i) => {
        const t = i / STEPS;
        // Denser curve: visible mist at the edge, soft tail — like fog.
        const opacity = Math.pow(1 - t, 1.15);
        return (
          <View
            key={i}
            style={{ height: stepHeight + 0.5, backgroundColor: color, opacity }}
          />
        );
      })}
    </View>
  );
}
