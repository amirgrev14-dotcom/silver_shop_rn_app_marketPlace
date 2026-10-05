import { AppText } from "@/components/ui/app-text";
import {
  ActivityIndicator,
  Pressable,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

import { colors } from './theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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

  // Spring press animation (hover-like feedback) for all buttons.
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={onPress}
      onPressIn={() => {
        if (!isDisabled) scale.value = withSpring(0.96, { damping: 15, stiffness: 500 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 500 });
      }}
      style={[animatedStyle, style]}
      className={`h-[52px] items-center justify-center rounded-[14px] px-5 active:opacity-85 ${
        fullWidth ? 'w-full' : 'self-start'
      } ${variantClasses[variant]} ${isDisabled ? 'opacity-50' : ''} ${className ?? ''}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.surface : colors.primary} />
      ) : (
        <AppText style={textStyle} className={`text-base font-semibold ${textVariantClasses[variant]}`}>
          {children}
        </AppText>
      )}
    </AnimatedPressable>
  );
}
