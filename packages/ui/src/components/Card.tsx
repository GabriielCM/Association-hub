import { styled, GetProps, YStack, XStack, Text } from 'tamagui';

const CardFrame = styled(YStack, {
  name: 'Card',
  backgroundColor: '$surface',
  borderRadius: '$lg',
  padding: '$3',
  overflow: 'hidden',

  // Neumorphic shadow
  shadowColor: '$shadowColor',
  shadowOffset: { width: 8, height: 8 },
  shadowOpacity: 0.2,
  shadowRadius: 16,

  variants: {
    variant: {
      elevated: {
        // Default neumorphic
      },
      flat: {
        shadowOpacity: 0,
        borderWidth: 1,
        borderColor: '$borderColor',
      },
      outlined: {
        backgroundColor: 'transparent',
        shadowOpacity: 0,
        borderWidth: 2,
        borderColor: '$borderColor',
      },
    },
    size: {
      sm: {
        padding: '$2',
        borderRadius: '$md',
      },
      md: {
        padding: '$3',
        borderRadius: '$lg',
      },
      lg: {
        padding: '$4',
        borderRadius: '$xl',
      },
    },
    pressable: {
      true: {
        hoverStyle: {
          scale: 1.02,
          shadowOpacity: 0.25,
        },
        pressStyle: {
          scale: 0.98,
          shadowOpacity: 0.15,
        },
        animation: 'fast',
      },
    },
    fullWidth: {
      true: {
        width: '100%',
      },
    },
  } as const,

  defaultVariants: {
    variant: 'elevated',
    size: 'md',
  },
});

const CardHeader = styled(XStack, {
  name: 'CardHeader',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '$2',
  gap: '$2',
});

const CardTitle = styled(Text, {
  name: 'CardTitle',
  fontFamily: '$heading',
  fontSize: '$xl',
  fontWeight: '$bold',
  color: '$color',
});

const CardDescription = styled(Text, {
  name: 'CardDescription',
  fontFamily: '$body',
  fontSize: '$sm',
  color: '$colorSecondary',
  marginTop: '$0.5',
});

const CardContent = styled(YStack, {
  name: 'CardContent',
  gap: '$2',
});

const CardFooter = styled(XStack, {
  name: 'CardFooter',
  alignItems: 'center',
  justifyContent: 'flex-end',
  marginTop: '$3',
  gap: '$2',
  paddingTop: '$2',
  borderTopWidth: 1,
  borderTopColor: '$borderColor',
});

export type CardProps = GetProps<typeof CardFrame>;
export type CardHeaderProps = GetProps<typeof CardHeader>;
export type CardTitleProps = GetProps<typeof CardTitle>;
export type CardDescriptionProps = GetProps<typeof CardDescription>;
export type CardContentProps = GetProps<typeof CardContent>;
export type CardFooterProps = GetProps<typeof CardFooter>;

export const Card = Object.assign(CardFrame, {
  Header: CardHeader,
  Title: CardTitle,
  Description: CardDescription,
  Content: CardContent,
  Footer: CardFooter,
});
