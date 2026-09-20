import type { ReactNode } from "react";
import {View} from "react-native";

import { AppText } from "@/components/ui/app-text";
interface ScreenHeaderProps {
  title: string;
  /** "left" → [left] Title ..... [right]; "center" → [left] Title [right]. */
  titleAlign?: "left" | "center";
  left?: ReactNode;
  right?: ReactNode;
  /** First letter in muted violet + silver rule — the brand header style. */
  accentFirstLetter?: boolean;
  titleClassName?: string;
  className?: string;
}

const TEXT_SIZE_PATTERN = /(^|\s)text-(xs|sm|base|lg|xl|2xl|3xl|4xl)(\s|$)/;

function TitleText({
  title,
  accentFirstLetter,
  grow = true,
  className,
}: {
  title: string;
  accentFirstLetter: boolean;
  grow?: boolean;
  className?: string;
}): React.JSX.Element {
  // An explicit size in className wins over the default text-xl.
  const sizeClass = className && TEXT_SIZE_PATTERN.test(className) ? "" : "text-xl";
  if (accentFirstLetter && title.length > 0) {
    return (
      <AppText className={`${grow ? "flex-1" : ""} ${sizeClass} font-bold text-ink-soft ${className ?? ""}`}>
        <AppText className={`${sizeClass} font-bold text-primary-muted`}>{title.slice(0, 1)}</AppText>
        {title.slice(1)}
      </AppText>
    );
  }
  return (
    <AppText className={`${grow ? "flex-1" : ""} ${sizeClass} font-bold text-text-primary ${className ?? ""}`}>
      {title}
    </AppText>
  );
}

/** Shared screen header layout: optional left action, title, optional right action. */
export function ScreenHeader({
  title,
  titleAlign = "center",
  left,
  right,
  accentFirstLetter = false,
  titleClassName,
  className,
}: ScreenHeaderProps): React.JSX.Element {
  if (titleAlign === "left") {
    return (
      <View className={`flex-row items-center gap-3 ${className ?? ""}`}>
        {left}
        {accentFirstLetter ? (
          <View className="flex-1 flex-row items-center gap-2">
            <TitleText title={title} accentFirstLetter grow={false} className={titleClassName} />
            <View className="h-[5px] w-[5px] rounded-full bg-primary-muted" />
            <View className="h-[2px] flex-1 rounded-full bg-silver" />
          </View>
        ) : (
          <TitleText title={title} accentFirstLetter={false} className={titleClassName} />
        )}
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
