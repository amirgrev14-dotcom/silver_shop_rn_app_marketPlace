import { AppText } from "@/components/ui/app-text";
import { colors } from "@/components/ui/theme";
import { type ReactNode, useState } from 'react';
import {
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

interface AppInputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
}

export function AppInput({
  label,
  error,
  leftIcon,
  rightIcon,
  containerStyle,
  inputStyle,
  editable = true,
  onBlur,
  onFocus,
  ...inputProps
}: AppInputProps): React.JSX.Element {
  const [isFocused, setIsFocused] = useState(false);
  const borderClass = error ? 'border-error' : isFocused ? 'border-primary' : 'border-border';

  return (
    <View style={containerStyle} className="gap-2">
      {label ? <AppText className="text-sm font-medium text-text-primary">{label}</AppText> : null}
      <View
        className={`${inputProps.multiline ? "min-h-[52px] py-3" : "h-[52px]"} flex-row items-center rounded-[14px] border bg-surface px-4 ${borderClass} ${
          editable ? '' : 'bg-silver-light opacity-60'
        }`}
      >
        {leftIcon ? <View className="mr-3">{leftIcon}</View> : null}
        <TextInput
          {...inputProps}
          editable={editable}
          onBlur={(event) => {
            setIsFocused(false);
            onBlur?.(event);
          }}
          onFocus={(event) => {
            setIsFocused(true);
            onFocus?.(event);
          }}
          placeholderTextColor={colors.textMuted}
          style={inputStyle}
          className="flex-1 text-base text-text-primary"
        />
        {rightIcon ? <View className="ml-3">{rightIcon}</View> : null}
      </View>
      {error ? <AppText className="text-sm text-error">{error}</AppText> : null}
    </View>
  );
}
