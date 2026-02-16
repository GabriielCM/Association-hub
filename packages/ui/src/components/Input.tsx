import { styled, YStack, XStack, View, Text } from 'tamagui';
import { forwardRef, useState } from 'react';
import { TextInput, type TextInputProps, type StyleProp, type TextStyle } from 'react-native';

const InputContainer = styled(YStack, {
  name: 'InputContainer',
  width: '100%',
  gap: '$0.5',
});

const InputLabel = styled(Text, {
  name: 'InputLabel',
  fontFamily: '$body',
  fontSize: '$sm',
  fontWeight: '$medium',
  color: '$color',
  marginBottom: '$0.5',
});

const InputFrame = styled(XStack, {
  name: 'InputFrame',
  alignItems: 'center',
  width: '100%',
  minHeight: 48,
  borderRadius: '$sm',
  paddingHorizontal: '$2',
  paddingVertical: '$1.5',
  backgroundColor: '$background',
  borderWidth: 1,
  borderColor: '$borderColor',

  // Neumorphic inset effect
  shadowColor: '$shadowColor',
  shadowOffset: { width: 2, height: 2 },
  shadowOpacity: 0.15,
  shadowRadius: 4,

  variants: {
    size: {
      sm: {
        minHeight: 40,
        paddingHorizontal: '$1.5',
      },
      md: {
        minHeight: 48,
        paddingHorizontal: '$2',
      },
      lg: {
        minHeight: 56,
        paddingHorizontal: '$2.5',
      },
    },
    error: {
      true: {
        borderColor: '$error',
      },
    },
    focused: {
      true: {
        borderColor: '$primary',
        borderWidth: 2,
      },
    },
    disabled: {
      true: {
        opacity: 0.5,
        backgroundColor: '$backgroundHover',
      },
    },
  } as const,

  defaultVariants: {
    size: 'md',
  },
});

const HelperText = styled(Text, {
  name: 'HelperText',
  fontFamily: '$body',
  fontSize: '$xs',
  marginTop: '$0.5',

  variants: {
    error: {
      true: {
        color: '$error',
      },
      false: {
        color: '$colorSecondary',
      },
    },
  } as const,
});

const IconWrapper = styled(View, {
  name: 'IconWrapper',
  alignItems: 'center',
  justifyContent: 'center',
  marginHorizontal: '$1',
});

export interface InputProps {
  label?: string;
  placeholder?: string;
  value?: string | undefined;
  defaultValue?: string;
  onChangeText?: (value: string) => void;
  onBlur?: () => void;
  error?: string | undefined;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  editable?: boolean;
  autoFocus?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: TextInputProps['keyboardType'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
  autoComplete?: TextInputProps['autoComplete'];
  autoCorrect?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  style?: StyleProp<TextStyle>;
}

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      placeholder,
      value,
      defaultValue,
      onChangeText,
      onBlur,
      error,
      helperText,
      leftIcon,
      rightIcon,
      size = 'md',
      disabled,
      editable,
      autoFocus,
      secureTextEntry,
      keyboardType,
      autoCapitalize,
      autoComplete,
      autoCorrect,
      multiline,
      numberOfLines,
      maxLength,
      style: customStyle,
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    const fontSize = size === 'sm' ? 14 : size === 'lg' ? 18 : 16;

    return (
      <InputContainer>
        {label && <InputLabel>{label}</InputLabel>}
        <InputFrame
          size={size}
          error={!!error}
          focused={isFocused && !error}
          disabled={disabled}
        >
          {leftIcon && <IconWrapper>{leftIcon}</IconWrapper>}
          <TextInput
            ref={ref}
            style={[{
              flex: 1,
              fontFamily: 'Inter',
              fontSize,
              color: '#1F2937',
              padding: 0,
              margin: 0,
            }, customStyle]}
            value={value}
            defaultValue={defaultValue}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            editable={editable !== undefined ? editable : !disabled}
            autoFocus={autoFocus}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            autoComplete={autoComplete}
            autoCorrect={autoCorrect}
            multiline={multiline}
            numberOfLines={numberOfLines}
            maxLength={maxLength}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              setIsFocused(false);
              onBlur?.();
            }}
          />
          {rightIcon && <IconWrapper>{rightIcon}</IconWrapper>}
        </InputFrame>
        {(error || helperText) && (
          <HelperText error={!!error}>{error || helperText}</HelperText>
        )}
      </InputContainer>
    );
  }
);

Input.displayName = 'Input';
