import {
  ActivityIndicator,
  Pressable,
  Text,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { colors } from './theme';

type AppButtonVariant = 'primary' | 'secondary' | 'ghost';

interface AppButtonProps {
  children: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  variant?: AppButtonVariant;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  className?: string;
}

const variantClasses: Record<AppButtonVariant, string> = {
  primary: 'bg-primary',
  secondary: 'border border-primary bg-surface',
  ghost: 'bg-transparent',
};

const textVariantClasses: Record<AppButtonVariant, string> = {
  primary: 'text-white',
  secondary: 'text-primary',
  ghost: 'text-primary',
};

export function AppButton({
  children,
  onPress,
  disabled = false,
  loading = false,
  fullWidth = true,
  variant = 'primary',
  style,
  textStyle,
  className,
}: AppButtonProps): React.JSX.Element {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={onPress}
      style={style}
      className={`h-[52px] items-center justify-center rounded-[14px] px-5 ${
        fullWidth ? 'w-full' : 'self-start'
      } ${variantClasses[variant]} ${isDisabled ? 'opacity-50' : ''} ${className ?? ''}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.surface : colors.primary} />
      ) : (
        <Text style={textStyle} className={`text-base font-semibold ${textVariantClasses[variant]}`}>
          {children}
        </Text>
      )}
    </Pressable>
  );
}
