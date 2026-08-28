import { type ReactNode, useState } from 'react';
import {
  Text,
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
      {label ? <Text className="text-sm font-medium text-text-primary">{label}</Text> : null}
      <View
        className={`h-[52px] flex-row items-center rounded-[14px] border bg-surface px-4 ${borderClass} ${
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
          placeholderTextColor="#A0A0AA"
          style={inputStyle}
          className="flex-1 text-base text-text-primary"
        />
        {rightIcon ? <View className="ml-3">{rightIcon}</View> : null}
      </View>
      {error ? <Text className="text-sm text-error">{error}</Text> : null}
    </View>
  );
}
