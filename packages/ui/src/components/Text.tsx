import { styled, Text as TamaguiText, GetProps } from 'tamagui';

export const Text = styled(TamaguiText, {
  name: 'Text',
  fontFamily: '$body',
  color: '$color',

  variants: {
    size: {
      xs: {
        fontSize: '$xs',
        lineHeight: '$xs',
      },
      sm: {
        fontSize: '$sm',
        lineHeight: '$sm',
      },
      base: {
        fontSize: '$base',
        lineHeight: '$base',
      },
      lg: {
        fontSize: '$lg',
        lineHeight: '$lg',
      },
      xl: {
        fontSize: '$xl',
        lineHeight: '$xl',
      },
      '2xl': {
        fontSize: '$2xl',
        lineHeight: '$2xl',
      },
    },
    weight: {
      regular: {
        fontWeight: '$regular',
      },
      medium: {
        fontWeight: '$medium',
      },
      semibold: {
        fontWeight: '$semibold',
      },
      bold: {
        fontWeight: '$bold',
      },
    },
    color: {
      primary: {
        color: '$color',
      },
      secondary: {
        color: '$colorSecondary',
      },
      tertiary: {
        color: '$colorTertiary',
      },
      accent: {
        color: '$primary',
      },
      error: {
        color: '$error',
      },
      success: {
        color: '$success',
      },
      warning: {
        color: '$warning',
      },
      info: {
        color: '$info',
      },
    },
    align: {
      left: {
        textAlign: 'left',
      },
      center: {
        textAlign: 'center',
      },
      right: {
        textAlign: 'right',
      },
    },
  } as const,

  defaultVariants: {
    size: 'base',
    weight: 'regular',
    color: 'primary',
    align: 'left',
  },
});

export const Heading = styled(TamaguiText, {
  name: 'Heading',
  fontFamily: '$heading',
  fontWeight: '$bold',
  color: '$color',

  variants: {
    level: {
      1: {
        fontSize: '$4xl',
        lineHeight: '$4xl',
      },
      2: {
        fontSize: '$3xl',
        lineHeight: '$3xl',
      },
      3: {
        fontSize: '$2xl',
        lineHeight: '$2xl',
      },
      4: {
        fontSize: '$xl',
        lineHeight: '$xl',
      },
      5: {
        fontSize: '$lg',
        lineHeight: '$lg',
      },
      6: {
        fontSize: '$base',
        lineHeight: '$base',
      },
    },
    color: {
      primary: {
        color: '$color',
      },
      secondary: {
        color: '$colorSecondary',
      },
      accent: {
        color: '$primary',
      },
    },
    align: {
      left: {
        textAlign: 'left',
      },
      center: {
        textAlign: 'center',
      },
      right: {
        textAlign: 'right',
      },
    },
  } as const,

  defaultVariants: {
    level: 3,
    color: 'primary',
    align: 'left',
  },
});

export type TextProps = GetProps<typeof Text>;
export type HeadingProps = GetProps<typeof Heading>;
