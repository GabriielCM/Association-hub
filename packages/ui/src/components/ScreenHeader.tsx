import { type ReactNode } from 'react';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import { XStack, YStack, useTheme } from 'tamagui';
import { Text, Heading } from './Text';
import { Icon } from './Icon';
import CaretLeft from 'phosphor-react-native/src/icons/CaretLeft';

export interface ScreenHeaderProps {
  title?: string;
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  onBack?: () => void;
  backAccessibilityLabel?: string;
  rightContent?: ReactNode;
  subtitle?: string;
  variant?: 'default' | 'overlay';
  borderBottom?: boolean;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function ScreenHeader({
  title,
  headingLevel = 4,
  onBack,
  backAccessibilityLabel = 'Voltar',
  rightContent,
  subtitle,
  variant = 'default',
  borderBottom = false,
  children,
  style,
}: ScreenHeaderProps) {
  const isOverlay = variant === 'overlay';
  const theme = useTheme();

  return (
    <XStack
      alignItems="center"
      paddingLeft={4}
      paddingRight="$4"
      paddingVertical="$2"
      gap="$2"
      {...(borderBottom && {
        borderBottomWidth: 1,
        borderBottomColor: '$borderColor',
        paddingBottom: '$2',
      })}
      {...(isOverlay && {
        position: 'absolute',
        top: 50,
        left: 0,
        right: 0,
        zIndex: 10,
      })}
      style={style}
    >
      {onBack && (
        <Pressable
          onPress={onBack}
          accessibilityLabel={backAccessibilityLabel}
          accessibilityRole="button"
          hitSlop={8}
          style={{
            width: 44,
            height: 44,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 22,
          }}
        >
          <Icon
            icon={CaretLeft}
            size="lg"
            color={isOverlay ? '#FFFFFF' : theme.color.val}
            weight="bold"
          />
        </Pressable>
      )}

      {children ?? (
        <YStack flex={1}>
          {title && (
            <Heading
              level={headingLevel}
              numberOfLines={1}
              {...(isOverlay && { color: 'primary', style: { color: '#fff' } })}
            >
              {title}
            </Heading>
          )}
          {subtitle && (
            <Text size="xs" color="secondary" numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </YStack>
      )}

      {rightContent}
    </XStack>
  );
}
