import type { ReactNode } from "react";
import {View} from "react-native";

import { AppText } from "@/components/ui/app-text";
interface ScreenHeaderProps {
  title: string;
  /** "left" → [left] Title ..... [right]; "center" → [left] Title [right]. */
  titleAlign?: "left" | "center";
  left?: ReactNode;
  right?: ReactNode;
  titleClassName?: string;
  className?: string;
}

/** Shared screen header layout: optional left action, title, optional right action. */
export function ScreenHeader({
  title,
  titleAlign = "center",
  left,
  right,
  titleClassName,
  className,
}: ScreenHeaderProps): React.JSX.Element {
  if (titleAlign === "left") {
    return (
      <View className={`flex-row items-center gap-3 ${className ?? ""}`}>
        {left}
        <AppText className={`flex-1 text-lg font-bold text-text-primary ${titleClassName ?? ""}`}>
          {title}
        </AppText>
        {right}
      </View>
    );
  }

  return (
    <View className={`flex-row items-center justify-between ${className ?? ""}`}>
      {left ?? <View className="h-10 w-10" />}
      <AppText
        className={`flex-1 text-center text-lg font-bold text-text-primary ${titleClassName ?? ""}`}
      >
        {title}
      </AppText>
      {right ?? <View className="h-10 w-10" />}
    </View>
  );
}
