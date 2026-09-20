import { Text as RNText, type TextProps } from 'react-native';

import { fontFamilies } from './theme';

type AppTextProps = TextProps & {
  className?: string;
};

/**
 * App-wide text: renders Inter everywhere.
 * Weight utilities in `className` pick the matching Inter family
 * (custom fonts need an explicit family per weight on iOS/Android).
 */
export function AppText({ className, style, ...rest }: AppTextProps): React.JSX.Element {
  const family = className?.includes('font-black')
    ? fontFamilies.extrabold
    : className?.includes('font-extrabold')
      ? fontFamilies.extrabold
      : className?.includes('font-bold')
        ? fontFamilies.bold
        : className?.includes('font-semibold')
          ? fontFamilies.semibold
          : className?.includes('font-medium')
            ? fontFamilies.medium
            : fontFamilies.regular;

  return <RNText {...rest} style={[{ fontFamily: family }, style]} className={className} />;
}
